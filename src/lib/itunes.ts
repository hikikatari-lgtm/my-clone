const cache = new Map<string, string | null>();

export async function fetchArtwork(
  artist: string,
  title: string
): Promise<string | null> {
  const cacheKey = `${artist}-${title}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey) ?? null;

  try {
    const params = new URLSearchParams({ artist, title });
    const res = await fetch(`/api/artwork?${params}`);
    if (!res.ok) {
      cache.set(cacheKey, null);
      return null;
    }
    const data = await res.json();
    const url: string | null = data.url ?? null;
    cache.set(cacheKey, url);
    return url;
  } catch {
    cache.set(cacheKey, null);
    return null;
  }
}
