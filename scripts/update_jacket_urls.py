#!/usr/bin/env python3
"""
Fetch album artwork URLs from Deezer API and update Notion's jacket_url property.
Targets songs with ✅ 確認済み = true in the Song Library.

Usage:
  python3 scripts/update_jacket_urls.py
  python3 scripts/update_jacket_urls.py --dry-run   # preview without writing
"""

import json
import os
import sys
import time
import urllib.parse
import urllib.request

# --- Config ---
DATABASE_ID = "91723235-15df-47df-8bed-14f5ffa0f257"
NOTION_API_VERSION = "2022-06-28"
DEEZER_SEARCH_URL = "https://api.deezer.com/search"

# --- Load env ---
def load_env():
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ.setdefault(key.strip(), val.strip())

load_env()

NOTION_TOKEN = os.environ.get("NOTION_API_KEY") or os.environ.get("NOTION_TOKEN")
if not NOTION_TOKEN:
    print("ERROR: NOTION_API_KEY or NOTION_TOKEN not found in env")
    sys.exit(1)


def notion_request(method, path, body=None):
    url = f"https://api.notion.com/v1/{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", f"Bearer {NOTION_TOKEN}")
    req.add_header("Notion-Version", NOTION_API_VERSION)
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req) as res:
            return json.loads(res.read())
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        print(f"Notion API error {e.code}: {err_body}")
        raise


def fetch_confirmed_songs():
    """Fetch all confirmed songs from Notion, paginating through results."""
    songs = []
    start_cursor = None

    while True:
        body = {
            "filter": {
                "property": "✅ 確認済み",
                "checkbox": {"equals": True},
            },
            "page_size": 100,
        }
        if start_cursor:
            body["start_cursor"] = start_cursor

        data = notion_request("POST", f"databases/{DATABASE_ID}/query", body)

        for page in data.get("results", []):
            if page.get("object") != "page":
                continue

            props = page.get("properties", {})

            # Title
            title_prop = props.get("Title", {})
            title = ""
            if title_prop.get("type") == "title":
                title = "".join(t["plain_text"] for t in title_prop.get("title", []))

            # Parse "Title / Artist" format from title
            parsed_artist = ""
            parsed_title = title
            if " / " in title:
                parts = title.split(" / ")
                parsed_title = parts[0].strip()
                parsed_artist = parts[1].strip() if len(parts) > 1 else ""

            # Artist from rich_text property
            artist_prop = props.get("Artist (text)", {})
            artist = ""
            if artist_prop.get("type") == "rich_text":
                artist = "".join(t["plain_text"] for t in artist_prop.get("rich_text", []))

            # Fallback: resolve artist from relation
            if not artist:
                artist_rel = props.get("Artist", {})
                if artist_rel.get("type") == "relation" and artist_rel.get("relation"):
                    rel_id = artist_rel["relation"][0]["id"]
                    try:
                        rel_page = notion_request("GET", f"pages/{rel_id}")
                        for pv in rel_page.get("properties", {}).values():
                            if pv.get("type") == "title":
                                artist = "".join(t["plain_text"] for t in pv.get("title", []))
                                break
                    except Exception:
                        pass
            if not artist:
                artist = parsed_artist

            # Current jacket_url
            jacket_prop = props.get("jacket_url", {})
            jacket_url = jacket_prop.get("url") if jacket_prop.get("type") == "url" else None

            songs.append({
                "page_id": page["id"],
                "title": parsed_title,
                "artist": artist,
                "jacket_url": jacket_url,
            })

        if data.get("has_more") and data.get("next_cursor"):
            start_cursor = data["next_cursor"]
        else:
            break

    return songs


def _deezer_get(query):
    params = urllib.parse.urlencode({"q": query})
    url = f"{DEEZER_SEARCH_URL}?{params}"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as res:
        data = json.loads(res.read())
    return data.get("data", [])


def search_deezer(artist, title):
    """Search Deezer for a track and return album.cover_big URL."""
    # Try structured search first
    results = _deezer_get(f'artist:"{artist}" track:"{title}"')
    # Fallback to simple search
    if not results:
        results = _deezer_get(f"{artist} {title}")
    if not results:
        return None

    cover = results[0].get("album", {}).get("cover_big")
    return cover  # 500x500


def update_jacket_url(page_id, url):
    """Update the jacket_url property on a Notion page."""
    notion_request("PATCH", f"pages/{page_id}", {
        "properties": {
            "jacket_url": {"url": url},
        },
    })


def main():
    dry_run = "--dry-run" in sys.argv

    print("Fetching confirmed songs from Notion...")
    songs = fetch_confirmed_songs()
    print(f"Found {len(songs)} confirmed songs\n")

    skipped = 0
    updated = 0
    not_found = 0
    already_set = 0

    for i, song in enumerate(songs, 1):
        title = song["title"]
        artist = song["artist"]
        prefix = f"[{i}/{len(songs)}]"

        if not title or not artist:
            print(f"{prefix} SKIP (missing title/artist): {title} / {artist}")
            skipped += 1
            continue

        if song["jacket_url"]:
            print(f"{prefix} ALREADY SET: {title} / {artist}")
            already_set += 1
            continue

        try:
            cover_url = search_deezer(artist, title)
        except Exception as e:
            print(f"{prefix} DEEZER ERROR: {title} / {artist} — {e}")
            skipped += 1
            continue

        if not cover_url:
            print(f"{prefix} NOT FOUND: {title} / {artist}")
            not_found += 1
            continue

        if dry_run:
            print(f"{prefix} DRY RUN: {title} / {artist} → {cover_url}")
            updated += 1
        else:
            try:
                update_jacket_url(song["page_id"], cover_url)
                print(f"{prefix} UPDATED: {title} / {artist} → {cover_url}")
                updated += 1
            except Exception as e:
                print(f"{prefix} NOTION ERROR: {title} / {artist} — {e}")
                skipped += 1

        # Deezer rate limit: ~50 req/5s
        time.sleep(0.15)

    print(f"\n--- Summary ---")
    print(f"Total:      {len(songs)}")
    print(f"Updated:    {updated}")
    print(f"Already set:{already_set}")
    print(f"Not found:  {not_found}")
    print(f"Skipped:    {skipped}")


if __name__ == "__main__":
    main()
