import type { CollectionEntry } from "astro:content";

export type Package = CollectionEntry<"packages">["data"];
export type Category = Package["category"];
export type AlternativeKind = Package["alternatives"][number]["kind"];

export interface NuGetStats {
  id: string;
  version: string;
  totalDownloads: number;
}

export type Template = CollectionEntry<"templates">["data"];
export type FeatureKey = keyof Template["features"];
export type FeatureStatus = Template["features"][FeatureKey]["status"];
