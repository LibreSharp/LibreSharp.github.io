import { getCollection } from "astro:content";
import type { Package, Template } from "./types";

/** All packages, sorted by name. Fails the build if a slug doesn't match its file name. */
export async function getPackages(): Promise<Package[]> {
  const entries = await getCollection("packages");
  for (const e of entries) {
    if (e.data.slug !== e.id) {
      throw new Error(`data/packages/${e.id}.yml: slug "${e.data.slug}" must match the file name`);
    }
  }
  return entries.map((e) => e.data).sort((a, b) => a.name.localeCompare(b.name));
}

/** Alternatives worth naming in lists (not "pin" or "pay"). */
export function realAlternatives(p: Package) {
  return p.alternatives.filter((a) => a.kind !== "pin" && a.kind !== "pay");
}

/** All templates, sorted by name. Fails the build if a slug doesn't match its file name. */
export async function getTemplates(): Promise<Template[]> {
  const entries = await getCollection("templates");
  for (const e of entries) {
    if (e.data.slug !== e.id) {
      throw new Error(`data/templates/${e.id}.yml: slug "${e.data.slug}" must match the file name`);
    }
  }
  return entries.map((e) => e.data).sort((a, b) => a.name.localeCompare(b.name));
}
