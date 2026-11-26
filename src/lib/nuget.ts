import type { NuGetStats } from "./types";

const SEARCH = "https://azuresearch-usnc.nuget.org/query";
const cache = new Map<string, Promise<NuGetStats | null>>();

/**
 * Latest stable version and total downloads from the NuGet search API, fetched at build time.
 * Returns null if NuGet can't be reached, so the build still works offline.
 */
export function getNuGetStats(id: string): Promise<NuGetStats | null> {
  const key = id.toLowerCase();
  if (!cache.has(key)) cache.set(key, fetchStats(id));
  return cache.get(key)!;
}

async function fetchStats(id: string): Promise<NuGetStats | null> {
  try {
    const url = `${SEARCH}?q=packageid:${encodeURIComponent(id)}&prerelease=false&semVerLevel=2.0.0&take=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: { id: string; version: string; totalDownloads: number }[];
    };
    const hit = json.data?.find((d) => d.id.toLowerCase() === id.toLowerCase());
    return hit ? { id: hit.id, version: hit.version, totalDownloads: hit.totalDownloads } : null;
  } catch {
    return null;
  }
}

export function formatDownloads(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${Math.round(n / 1e6)}M`;
  if (n >= 1e3) return `${Math.round(n / 1e3)}k`;
  return String(n);
}
