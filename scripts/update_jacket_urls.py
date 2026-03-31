#!/usr/bin/env python3
"""
Fetch album artwork URLs from Deezer API and update Notion pages.

- Songs:  updates page cover for confirmed songs (Song Library)
- Albums: updates jacket_url property for albums with empty jacket_url (Album DB)

Usage:
  python3 scripts/update_jacket_urls.py                # update songs only (default)
  python3 scripts/update_jacket_urls.py --albums       # update albums only
  python3 scripts/update_jacket_urls.py --all          # update both
  python3 scripts/update_jacket_urls.py --dry-run      # preview without writing
"""

import json
import os
import sys
import time
import urllib.parse
import urllib.request

# --- Config ---
SONG_DATABASE_ID = "91723235-15df-47df-8bed-14f5ffa0f257"
ALBUM_DATABASE_ID = "471aa704-6aa1-47cb-9d74-bcdfe8a15efc"
NOTION_API_VERSION = "2022-06-28"
DEEZER_SEARCH_URL = "https://api.deezer.com/search"
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

        data = notion_request("POST", f"databases/{SONG_DATABASE_ID}/query", body)

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

            # Current cover image
            cover = page.get("cover")
            has_cover = False
            if cover:
                if cover.get("type") == "external" and cover.get("external", {}).get("url"):
                    has_cover = True
                elif cover.get("type") == "file" and cover.get("file", {}).get("url"):
                    has_cover = True

            songs.append({
                "page_id": page["id"],
                "title": parsed_title,
                "artist": artist,
                "has_cover": has_cover,
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


def update_cover(page_id, url):
    """Set the page cover image on a Notion page."""
    notion_request("PATCH", f"pages/{page_id}", {
        "cover": {
            "type": "external",
            "external": {"url": url},
        },
    })


def fetch_albums_without_jacket():
    """Fetch albums from Album DB where jacket_url is empty."""
    albums = []
    start_cursor = None

    while True:
        body = {
            "filter": {
                "property": "jacket_url",
                "url": {"is_empty": True},
            },
            "page_size": 100,
        }
        if start_cursor:
            body["start_cursor"] = start_cursor

        data = notion_request("POST", f"databases/{ALBUM_DATABASE_ID}/query", body)

        for page in data.get("results", []):
            if page.get("object") != "page":
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
    params = urllib.parse.urlencode({"q": f'artist:"{artist}" album:"{album_name}"'})
    url = f"{DEEZER_SEARCH_ALBUM_URL}?{params}"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as res:
        data = json.loads(res.read())
    results = data.get("data", [])
    # Fallback to simple search
    if not results:
        params = urllib.parse.urlencode({"q": f"{artist} {album_name}"})
        url = f"{DEEZER_SEARCH_ALBUM_URL}?{params}"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as res:
            data = json.loads(res.read())
        results = data.get("data", [])
    if not results:
        return None
    return results[0].get("cover_big")


def update_album_jacket_url(page_id, url):
    """Set the jacket_url property on an Album page."""
    notion_request("PATCH", f"pages/{page_id}", {
        "properties": {
            "jacket_url": {
                "url": url,
            },
        },
    })


def run_songs(dry_run):
    """Update cover images for confirmed songs."""
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

        if song["has_cover"]:
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
                update_cover(song["page_id"], cover_url)
                print(f"{prefix} UPDATED: {title} / {artist} → {cover_url}")
                updated += 1
            except Exception as e:
                print(f"{prefix} NOTION ERROR: {title} / {artist} — {e}")
                skipped += 1

        time.sleep(0.15)

    print(f"\n--- Songs Summary ---")
    print(f"Total:      {len(songs)}")
    print(f"Updated:    {updated}")
    print(f"Already set:{already_set}")
    print(f"Not found:  {not_found}")
    print(f"Skipped:    {skipped}")
    return updated


def run_albums(dry_run):
    """Update jacket_url for albums missing it."""
    print("Fetching albums without jacket_url from Notion...")
    albums = fetch_albums_without_jacket()
    print(f"Found {len(albums)} albums without jacket_url\n")

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
            cover_url = search_deezer_album(artist, name) if artist else None
            # Fallback: search by album name only
            if not cover_url:
                cover_url = search_deezer_album("", name)
        except Exception as e:
            print(f"{prefix} DEEZER ERROR: {name} / {artist} — {e}")
            skipped += 1
            continue

        if not cover_url:
            print(f"{prefix} NOT FOUND: {name} / {artist}")
            not_found += 1
            continue

        if dry_run:
            print(f"{prefix} DRY RUN: {name} / {artist} → {cover_url}")
            updated += 1
        else:
            try:
                update_album_jacket_url(album["page_id"], cover_url)
                print(f"{prefix} UPDATED: {name} / {artist} → {cover_url}")
                updated += 1
            except Exception as e:
                print(f"{prefix} NOTION ERROR: {name} / {artist} — {e}")
                skipped += 1

        time.sleep(0.15)

    print(f"\n--- Albums Summary ---")
    print(f"Total:      {len(albums)}")
    print(f"Updated:    {updated}")
    print(f"Not found:  {not_found}")
    print(f"Skipped:    {skipped}")
    return updated


def main():
    dry_run = "--dry-run" in sys.argv
    do_albums = "--albums" in sys.argv
    do_all = "--all" in sys.argv
    do_songs = not do_albums or do_all

    if do_songs and not do_albums:
        run_songs(dry_run)
    elif do_albums and not do_all:
        run_albums(dry_run)
    elif do_all:
        run_songs(dry_run)
        print("\n" + "=" * 50 + "\n")
        run_albums(dry_run)


if __name__ == "__main__":
    main()
