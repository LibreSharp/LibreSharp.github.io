const cache = new Map<string, Promise<number | null>>();

/** GitHub star count for "owner/name", fetched at build time. Uses GITHUB_TOKEN when set (in CI). */
export function getStars(repo: string): Promise<number | null> {
  if (!cache.has(repo)) cache.set(repo, fetchStars(repo));
  return cache.get(repo)!;
}

async function fetchStars(repo: string): Promise<number | null> {
  try {
    const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
    const token = process.env.GITHUB_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers,
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { stargazers_count?: number };
    return json.stargazers_count ?? null;
  } catch {
    return null;
  }
}

export function repoPath(url: string | undefined): string | undefined {
  const m = url?.match(/^https:\/\/github\.com\/([^/]+\/[^/#?]+)/);
  return m?.[1];
}

export function formatStars(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}
