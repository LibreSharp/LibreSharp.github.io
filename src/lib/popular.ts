import fs from "node:fs";
import path from "node:path";

export interface PopularProject {
  name: string;
  repo: string;
  url: string;
  homepage: string | null;
  description: string;
  license: string;
  stars: number;
  archived: boolean;
  lastActivity: string | null;
  funding: { platform: string; url: string }[];
  downloads: number;
  topPackage: string;
  packages: string[];
  relatedRepos: string[];
}

export interface PopularData {
  generated: string;
  note: string;
  count: number;
  projects: PopularProject[];
  excluded: { name: string; repo: string; downloads: number; packages: string[]; reason: string }[];
}

/** Reads data/popular.json, written by scripts/update-popular.mjs. */
export function getPopular(): PopularData {
  const file = path.join(process.cwd(), "data", "popular.json");
  return JSON.parse(fs.readFileSync(file, "utf8")) as PopularData;
}

const PLATFORMS: Record<string, string> = {
  GITHUB: "GitHub Sponsors",
  OPEN_COLLECTIVE: "Open Collective",
  PATREON: "Patreon",
  TIDELIFT: "Tidelift",
  KO_FI: "Ko-fi",
  LIBERAPAY: "Liberapay",
  BUY_ME_A_COFFEE: "Buy Me a Coffee",
  THANKS_DEV: "thanks.dev",
  POLAR: "Polar",
  ISSUEHUNT: "IssueHunt",
  LFX_CROWDFUNDING: "LFX",
};

export function platformLabel(platform: string, url: string): string {
  if (PLATFORMS[platform]) return PLATFORMS[platform];
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Donate";
  }
}
