#!/usr/bin/env python3
"""
Sync YouTube playlists to Notion database.
Fetches all playlists from the channel and creates entries for any not already in Notion.

Usage:
  python3 scripts/sync_playlists_to_notion.py
  python3 scripts/sync_playlists_to_notion.py --dry-run
"""

import json
import os
import sys
import time
import urllib.parse
import urllib.request
import urllib.error

# --- Config ---
CHANNEL_ID = "UCBry-IGC_zBdmNkgMucqC7A"
NOTION_DB_ID = "6ec1fb96-a440-4bca-a6f7-7b3a42bc7d83"
NOTION_API_VERSION = "2022-06-28"
YT_API_BASE = "https://www.googleapis.com/youtube/v3"

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

YT_API_KEY = os.environ.get("YOUTUBE_API_KEY")
NOTION_TOKEN = os.environ.get("NOTION_API_KEY") or os.environ.get("NOTION_TOKEN")

if not YT_API_KEY:
    print("ERROR: YOUTUBE_API_KEY not found"); sys.exit(1)
if not NOTION_TOKEN:
    print("ERROR: NOTION_API_KEY not found"); sys.exit(1)


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


def fetch_youtube_playlists():
    """Fetch all playlists from the YouTube channel."""
    playlists = []
    page_token = ""

    while True:
        url = (
            f"{YT_API_BASE}/playlists?part=snippet,contentDetails"
            f"&channelId={CHANNEL_ID}&maxResults=50&key={YT_API_KEY}"
        )
        if page_token:
            url += f"&pageToken={page_token}"

        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as res:
            data = json.loads(res.read())

        for item in data.get("items", []):
            playlists.append({
                "playlist_id": item["id"],
                "title": item["snippet"]["title"],
                "description": item["snippet"].get("description", ""),
                "video_count": item["contentDetails"]["itemCount"],
            })

        page_token = data.get("nextPageToken", "")
        if not page_token:
            break

    return playlists


def fetch_existing_playlist_ids():
    """Fetch all playlist_ids already in the Notion DB."""
    existing = set()
    start_cursor = None

    while True:
        body = {"page_size": 100}
        if start_cursor:
            body["start_cursor"] = start_cursor

        data = notion_request("POST", f"databases/{NOTION_DB_ID}/query", body)

        for page in data.get("results", []):
            props = page.get("properties", {})
            pid_prop = props.get("playlist_id", {})
            if pid_prop.get("type") == "rich_text":
                pid = "".join(t["plain_text"] for t in pid_prop.get("rich_text", []))
                if pid:
                    existing.add(pid)

        if data.get("has_more") and data.get("next_cursor"):
            start_cursor = data["next_cursor"]
        else:
            break

    return existing


def create_notion_page(playlist):
    """Create a new page in the Notion playlists DB."""
    body = {
        "parent": {"database_id": NOTION_DB_ID},
        "properties": {
            "タイトル": {
                "title": [{"text": {"content": playlist["title"]}}],
            },
            "playlist_id": {
                "rich_text": [{"text": {"content": playlist["playlist_id"]}}],
            },
            "動画数": {
                "number": playlist["video_count"],
            },
            "公開設定": {
                "select": {"name": "表示"},
            },
            "カテゴリ": {
                "select": {"name": "その他"},
            },
            "表示順": {
                "number": 50,
            },
        },
    }
    return notion_request("POST", "pages", body)


def main():
    dry_run = "--dry-run" in sys.argv

    print("Fetching YouTube playlists...")
    yt_playlists = fetch_youtube_playlists()
    print(f"Found {len(yt_playlists)} playlists on YouTube\n")

    print("Fetching existing Notion entries...")
    existing_ids = fetch_existing_playlist_ids()
    print(f"Found {len(existing_ids)} already in Notion\n")

    new_playlists = [p for p in yt_playlists if p["playlist_id"] not in existing_ids]
    print(f"New playlists to add: {len(new_playlists)}\n")

    created = 0
    skipped = 0

    for i, pl in enumerate(new_playlists, 1):
        prefix = f"[{i}/{len(new_playlists)}]"

        if dry_run:
            print(f"{prefix} DRY RUN: {pl['title']} ({pl['video_count']} videos)")
            created += 1
            continue

        try:
            create_notion_page(pl)
            print(f"{prefix} CREATED: {pl['title']} ({pl['video_count']} videos)")
            created += 1
            time.sleep(0.35)  # Notion rate limit
        except Exception as e:
            print(f"{prefix} ERROR: {pl['title']} — {e}")
            skipped += 1

    print(f"\n--- Summary ---")
    print(f"YouTube total:  {len(yt_playlists)}")
    print(f"Already in DB:  {len(existing_ids)}")
    print(f"Created:        {created}")
    print(f"Skipped/Error:  {skipped}")


if __name__ == "__main__":
    main()
