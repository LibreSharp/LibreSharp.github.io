import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// YAML may read dates as Date objects and versions/years as numbers. Normalise to strings.
const text = z.preprocess(
  (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v == null ? v : String(v)),
  z.string().min(1),
);
const date = (pattern: RegExp, hint: string) =>
  z.preprocess(
    (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v == null ? v : String(v)),
    z.string().regex(pattern, hint),
  );

const packages = defineCollection({
  loader: glob({ pattern: "*.yml", base: "./data/packages" }),
  schema: z.object({
    slug: z.string().regex(/^[a-z0-9-]+$/, "slug must be lowercase letters, numbers and dashes"),
    name: z.string(),
    nuget: z.array(z.string()).min(1),
    repo: z.url().optional(),
    category: z.enum(["relicensed", "revenue-capped", "maintenance-fee", "abandoned", "trust"]),
    oldLicense: text,
    newModel: text,
    lastFreeVersion: text,
    firstPaidVersion: text.optional(),
    changed: date(/^\d{4}(-\d{2}){0,2}$/, "changed must be YYYY, YYYY-MM or YYYY-MM-DD"),
    freeTier: text.optional(),
    summary: text,
    notes: z.array(text).optional(),
    security: z
      .array(z.object({ id: z.string(), url: z.url().optional(), text: text }))
      .optional(),
    alternatives: z
      .array(
        z.object({
          name: z.string(),
          kind: z.enum(["fork", "replacement", "built-in", "pin", "pay"]),
          url: z.url().optional(),
          nuget: z.string().optional(),
          license: z.string().optional(),
          note: text.optional(),
        }),
      )
      .min(1),
    sources: z.array(z.object({ title: z.string(), url: z.url() })).min(1),
    checked: date(/^\d{4}-\d{2}-\d{2}$/, "checked must be YYYY-MM-DD").optional(),
  }),
});

const feature = z.object({
  status: z.enum(["yes", "partial", "no", "unknown"]),
  note: text.optional(),
});

const templates = defineCollection({
  loader: glob({ pattern: "*.yml", base: "./data/templates" }),
  schema: z.object({
    slug: z.string().regex(/^[a-z0-9-]+$/, "slug must be lowercase letters, numbers and dashes"),
    name: z.string(),
    url: z.url().optional(),
    repo: z.url().optional(),
    /** GitHub "owner/name" to read stars from, if different from repo. */
    starsRepo: z.string().optional(),
    license: z.string(),
    openSource: z.boolean(),
    licenseNote: text.optional(),
    status: z.enum(["active", "stale", "unmaintained", "reference"]),
    statusNote: text.optional(),
    dotnet: text,
    frontend: z.array(z.string()).min(1),
    database: z.array(z.string()).optional(),
    install: text,
    summary: text,
    features: z.object({
      multiTenancy: feature,
      auth: feature,
      billing: feature,
      adminUi: feature,
      email: feature,
      backgroundJobs: feature,
      deploy: feature,
      tests: feature,
    }),
    paidDependencies: z
      .array(
        z.object({
          package: z.string(),
          version: text,
          /** Slug of the matching entry in data/packages, for a link. */
          packageSlug: z.string().optional(),
          note: text,
        }),
      )
      .optional(),
    notes: z.array(text).optional(),
    sources: z.array(z.object({ title: z.string(), url: z.url() })).min(1),
    checked: date(/^\d{4}-\d{2}-\d{2}$/, "checked must be YYYY-MM-DD").optional(),
  }),
});

const apps = defineCollection({
  loader: glob({ pattern: "*.yml", base: "./data/apps" }),
  schema: z.object({
    slug: z.string().regex(/^[a-z0-9-]+$/, "slug must be lowercase letters, numbers and dashes"),
    name: z.string(),
    category: z.enum([
      "cms",
      "ecommerce",
      "community",
      "business",
      "media",
      "media-automation",
      "security",
      "devops",
      "backup",
      "desktop",
      "developer",
      "games",
    ]),
    url: z.url().optional(),
    repo: z.url(),
    /** GitHub "owner/name" to read stars from, if different from repo. */
    starsRepo: z.string().optional(),
    license: z.string(),
    licenseNote: text.optional(),
    status: z.enum(["active", "stale", "unmaintained"]),
    /** Where it runs, e.g. Docker, Windows, Linux, macOS. */
    runsOn: z.array(z.string()).min(1),
    builtWith: text.optional(),
    summary: text,
    notes: z.array(text).optional(),
    sources: z.array(z.object({ title: z.string(), url: z.url() })).min(1),
    checked: date(/^\d{4}-\d{2}-\d{2}$/, "checked must be YYYY-MM-DD").optional(),
  }),
});

export const collections = { packages, templates, apps };
