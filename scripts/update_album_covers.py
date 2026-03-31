#!/usr/bin/env python3
"""
Fetch album artwork from Deezer API and set as Notion page cover for Album DB entries.
Only targets albums that have no page cover image.

Usage:
  python3 scripts/update_album_covers.py              # update covers
  python3 scripts/update_album_covers.py --dry-run    # preview without writing
"""

import json
import os
import sys
import time
import urllib.parse
import urllib.request

# --- Config ---
ALBUM_DATABASE_ID = "471aa704-6aa1-47cb-9d74-bcdfe8a15efc"
NOTION_API_VERSION = "2022-06-28"
DEEZER_SEARCH_ALBUM_URL = "https://api.deezer.com/search/album"

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


def fetch_albums_without_cover():
    """Fetch all albums from Album DB, return only those without a page cover."""
    albums = []
    start_cursor = None

    while True:
        body = {"page_size": 100}
        if start_cursor:
            body["start_cursor"] = start_cursor

        data = notion_request("POST", f"databases/{ALBUM_DATABASE_ID}/query", body)

        for page in data.get("results", []):
            if page.get("object") != "page":
                continue

            # Check if page already has a cover
            cover = page.get("cover")
            has_cover = False
            if cover:
                if cover.get("type") == "external" and cover.get("external", {}).get("url"):
                    has_cover = True
                elif cover.get("type") == "file" and cover.get("file", {}).get("url"):
                    has_cover = True

            if has_cover:
                continue

            props = page.get("properties", {})

            # Album name (title property)
            album_prop = props.get("Album", {})
            album_name = ""
            if album_prop.get("type") == "title":
                album_name = "".join(t["plain_text"] for t in album_prop.get("title", []))

            # Resolve artist from relation
            artist = ""
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

            albums.append({
                "page_id": page["id"],
                "album_name": album_name,
                "artist": artist,
            })

        if data.get("has_more") and data.get("next_cursor"):
            start_cursor = data["next_cursor"]
        else:
            break

    return albums


def search_deezer_album(artist, album_name):
    """Search Deezer for an album and return cover_big URL."""
    if artist:
        params = urllib.parse.urlencode({"q": f'artist:"{artist}" album:"{album_name}"'})
        url = f"{DEEZER_SEARCH_ALBUM_URL}?{params}"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as res:
            data = json.loads(res.read())
        results = data.get("data", [])
        if results:
            return results[0].get("cover_big")

    # Fallback: search by album name (with artist as keyword if available)
    query = f"{artist} {album_name}".strip() if artist else album_name
    params = urllib.parse.urlencode({"q": query})
    url = f"{DEEZER_SEARCH_ALBUM_URL}?{params}"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as res:
        data = json.loads(res.read())
    results = data.get("data", [])
    if results:
        return results[0].get("cover_big")

    return None


def update_page_cover(page_id, image_url):
    """Set the page cover image on a Notion page."""
    notion_request("PATCH", f"pages/{page_id}", {
        "cover": {
            "type": "external",
            "external": {"url": image_url},
        },
    })


def main():
    dry_run = "--dry-run" in sys.argv

    print("Fetching albums without cover from Notion...")
    albums = fetch_albums_without_cover()
    print(f"Found {len(albums)} albums without page cover\n")

    if not albums:
        print("Nothing to update.")
        return

    skipped = 0
    updated = 0
    not_found = 0

    for i, album in enumerate(albums, 1):
        name = album["album_name"]
        artist = album["artist"]
        prefix = f"[{i}/{len(albums)}]"

        if not name:
            print(f"{prefix} SKIP (missing album name): {name} / {artist}")
            skipped += 1
            continue

        try:
            cover_url = search_deezer_album(artist, name)
        except Exception as e:
            print(f"{prefix} DEEZER ERROR: {name} / {artist} -- {e}")
            skipped += 1
            continue

        if not cover_url:
            print(f"{prefix} NOT FOUND: {name} / {artist}")
            not_found += 1
            continue

        if dry_run:
            print(f"{prefix} DRY RUN: {name} / {artist} -> {cover_url}")
            updated += 1
        else:
            try:
                update_page_cover(album["page_id"], cover_url)
                print(f"{prefix} UPDATED: {name} / {artist} -> {cover_url}")
                updated += 1
            except Exception as e:
                print(f"{prefix} NOTION ERROR: {name} / {artist} -- {e}")
                skipped += 1

        time.sleep(0.15)

    print(f"\n--- Summary ---")
    print(f"Total:     {len(albums)}")
    print(f"Updated:   {updated}")
    print(f"Not found: {not_found}")
    print(f"Skipped:   {skipped}")


if __name__ == "__main__":
    main()
