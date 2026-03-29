const cache = new Map<string, string | null>();

export async function fetchArtwork(
  artist: string,
  title: string
): Promise<string | null> {
  const cacheKey = `${artist}-${title}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey) ?? null;

  try {
    const query = encodeURIComponent(`${artist} ${title}`);
    const res = await fetch(
      `https://itunes.apple.com/search?term=${query}&media=music&limit=1`
    );
    if (!res.ok) {
      cache.set(cacheKey, null);
      return null;
    }
    const data = await res.json();
    const url: string | null =
      data.results?.[0]?.artworkUrl100?.replace("100x100", "300x300") ?? null;
    cache.set(cacheKey, url);
    return url;
  } catch {
    cache.set(cacheKey, null);
    return null;
  }
}
