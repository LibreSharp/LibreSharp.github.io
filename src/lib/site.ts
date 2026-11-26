export const SITE = {
  name: "LibreSharp",
  url: "https://libresharp.github.io",
  repo: "https://github.com/LibreSharp/LibreSharp.github.io",
  org: "https://github.com/LibreSharp",
  description:
    "A free list of .NET packages that moved from open source to commercial or paid models, and the free alternatives you can use instead.",
};

export function formatChanged(changed: string): string {
  const [y, m, d] = changed.split("-");
  if (!m) return y;
  const month = new Date(Date.UTC(Number(y), Number(m) - 1, 1)).toLocaleString("en-GB", {
    month: "short",
    timeZone: "UTC",
  });
  return d ? `${Number(d)} ${month} ${y}` : `${month} ${y}`;
}

export function isExactVersion(v: string): boolean {
  return /^\d+(\.\d+)+$/.test(v);
}
