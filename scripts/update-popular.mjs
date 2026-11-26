// Builds data/popular.json: the most downloaded community .NET open source
// projects on NuGet, with GitHub details and sponsor links.
//
//   GITHUB_TOKEN=... node scripts/update-popular.mjs
//
// Needs a GitHub token (GraphQL API). In GitHub Actions the built-in
// GITHUB_TOKEN works. Without one, the script exits and leaves the existing
// data/popular.json in place.

import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";

const root = path.resolve(import.meta.dirname, "..");
const config = parse(fs.readFileSync(path.join(root, "data/popular-config.yml"), "utf8"));
const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error("GITHUB_TOKEN is not set. Keeping the existing data/popular.json.");
  process.exit(0);
}

// OSI-approved licences we recognise. Anything else is excluded as "not open source".
const OSI = new Set([
  "MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "MS-PL", "MS-RL", "MPL-2.0",
  "LGPL-2.1", "LGPL-2.1-only", "LGPL-2.1-or-later", "LGPL-3.0", "LGPL-3.0-only", "LGPL-3.0-or-later",
  "GPL-2.0", "GPL-2.0-only", "GPL-3.0", "GPL-3.0-only", "GPL-3.0-or-later",
  "AGPL-3.0", "AGPL-3.0-only", "AGPL-3.0-or-later", "ISC", "Unlicense", "Zlib", "0BSD",
  "BSL-1.0", "EPL-1.0", "EPL-2.0", "RPL-1.5", "PostgreSQL", "MIT-0", "Apache-1.1", "OSL-3.0",
  // Public domain dedications (not OSI licences, but free to use).
  "CC0-1.0",
]);

const excludeOwners = new Set((config.excludeOwners ?? []).map((o) => o.toLowerCase()));
const excludeRepos = new Set((config.excludeRepos ?? []).map((r) => r.toLowerCase()));
const repoOverrides = Object.fromEntries(
  Object.entries(config.repoOverrides ?? {}).map(([k, v]) => [k.toLowerCase(), v]),
);
const licenseOverrides = Object.fromEntries(
  Object.entries(config.licenseOverrides ?? {}).map(([k, v]) => [k.toLowerCase(), v]),
);
const names = Object.fromEntries(Object.entries(config.names ?? {}).map(([k, v]) => [k.toLowerCase(), v]));

/** True if every part of an SPDX expression like "MS-PL OR Apache-2.0" is OSI-approved. */
function isOpenSource(expr) {
  if (!expr) return false;
  const parts = expr.replace(/[()]/g, " ").split(/\s+(?:OR|AND)\s+/i).map((x) => x.trim());
  return parts.length > 0 && parts.every((x) => OSI.has(x));
}

async function getJson(url, options = {}, tries = 3) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { ...options, signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
      return await res.json();
    } catch (e) {
      if (i >= tries) throw e;
      await new Promise((r) => setTimeout(r, 1000 * i));
    }
  }
}

async function getText(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

/** Runs fn over items with limited concurrency. */
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i], i);
      }
    }),
  );
  return out;
}

function githubRepo(url) {
  const m = url?.match(/github\.com[/:]([\w.-]+)\/([\w.-]+?)(?:\.git)?(?:[/#?].*)?$/i);
  return m ? `${m[1]}/${m[2]}` : null;
}

// 1. Top NuGet packages by total downloads.
const scan = config.scan ?? 2000;
let packages = [];
for (let skip = 0; skip < scan; skip += 1000) {
  const take = Math.min(1000, scan - skip);
  const url = `https://azuresearch-usnc.nuget.org/query?q=&take=${take}&skip=${skip}&prerelease=false&semVerLevel=2.0.0&sortBy=totalDownloads-desc`;
  packages.push(...(await getJson(url)).data);
}
console.log(`Scanned ${packages.length} NuGet packages.`);

// 2. Drop Microsoft and cloud vendor packages.
packages = packages.filter((p) => !(p.owners ?? []).some((o) => excludeOwners.has(o.toLowerCase())));
console.log(`${packages.length} packages after excluding vendor owners.`);

// 3. Find each package's GitHub repository (nuspec <repository>, else projectUrl).
await mapLimit(packages, 16, async (p) => {
  const id = p.id.toLowerCase();
  const version = p.version.toLowerCase();
  const nuspec = await getText(`https://api.nuget.org/v3-flatcontainer/${id}/${version}/${id}.nuspec`);
  const repoUrl = nuspec?.match(/<repository[^>]*\burl="([^"]+)"/)?.[1];
  p.repo = repoOverrides[id] ?? githubRepo(repoUrl) ?? githubRepo(p.projectUrl);
  p.nugetLicense = nuspec?.match(/<license type="expression">([^<]+)<\/license>/)?.[1] ?? null;
});

// 4. Group packages by repository.
const groups = new Map();
for (const p of packages) {
  if (!p.repo) continue;
  const key = p.repo.toLowerCase();
  if (excludeRepos.has(key)) continue;
  if (!groups.has(key)) groups.set(key, { repo: p.repo, packages: [] });
  groups.get(key).packages.push(p);
}
let projects = [...groups.values()]
  .map((g) => {
    g.packages.sort((a, b) => b.totalDownloads - a.totalDownloads);
    return g;
  })
  .sort((a, b) => b.packages[0].totalDownloads - a.packages[0].totalDownloads);
console.log(`${projects.length} GitHub repositories found.`);

// 5. GitHub details in batches (GraphQL). Take extra, because some get merged or excluded.
const limit = config.limit ?? 100;
const candidates = projects.slice(0, limit * 3);
const gh = new Map();
for (let i = 0; i < candidates.length; i += 40) {
  const batch = candidates.slice(i, i + 40);
  const fields = batch
    .map((p, j) => {
      const [owner, name] = p.repo.split("/");
      return `r${j}: repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(name)}) {
        nameWithOwner url description homepageUrl stargazerCount isArchived pushedAt
        licenseInfo { spdxId }
        fundingLinks { platform url }
      }`;
    })
    .join("\n");
  const json = await getJson("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: `query { ${fields} }` }),
  });
  batch.forEach((p, j) => {
    const r = json.data?.[`r${j}`];
    if (r) gh.set(p.repo.toLowerCase(), r);
  });
}

// 6. Merge groups that resolve to the same repository (renamed or moved repos).
const resolved = new Map();
const excluded = [];
for (const p of candidates) {
  const r = gh.get(p.repo.toLowerCase());
  if (!r) continue; // Repository missing or private.
  const key = r.nameWithOwner.toLowerCase();
  if (excludeRepos.has(key)) continue;
  if (!resolved.has(key)) resolved.set(key, { gh: r, packages: [] });
  resolved.get(key).packages.push(...p.packages);
}

// 7. Licence check, then fold "satellite" repos (e.g. serilog/serilog-sinks-file)
//    into their parent project from the same owner (serilog/serilog).
const accepted = [];
const sorted = [...resolved.values()]
  .map((g) => {
    g.packages.sort((a, b) => b.totalDownloads - a.totalDownloads);
    return g;
  })
  .sort((a, b) => b.packages[0].totalDownloads - a.packages[0].totalDownloads);

for (const g of sorted) {
  const r = g.gh;
  const top = g.packages[0];
  const owner = r.nameWithOwner.split("/")[0].toLowerCase();
  const parent = accepted.find(
    (a) => a.owner === owner && top.id.toLowerCase().startsWith(a.topPackage.toLowerCase() + "."),
  );
  if (parent) {
    parent.relatedRepos.push(r.nameWithOwner);
    parent.packages.push(...g.packages.map((x) => x.id));
    continue;
  }
  const spdx = r.licenseInfo?.spdxId;
  const license =
    licenseOverrides[r.nameWithOwner.toLowerCase()] ??
    (spdx && spdx !== "NOASSERTION" && spdx !== "OTHER" ? spdx : top.nugetLicense);
  if (!isOpenSource(license)) {
    excluded.push({
      name: top.id,
      repo: r.nameWithOwner,
      downloads: top.totalDownloads,
      packages: g.packages.map((x) => x.id),
      reason: license ? `Licence "${license}" is not recognised as open source` : "Custom or unrecognised licence",
    });
    continue;
  }
  if (r.isArchived) {
    excluded.push({ name: top.id, repo: r.nameWithOwner, downloads: top.totalDownloads, packages: g.packages.map((x) => x.id), reason: "Repository is archived" });
    continue;
  }
  if (accepted.length >= limit) continue;
  const repoName = r.nameWithOwner.split("/")[1];
  const name =
    names[r.nameWithOwner.toLowerCase()] ??
    // Use the package's own capitalisation, trimmed to the repo name when the package
    // is a sub-package (e.g. "Swashbuckle.AspNetCore.SwaggerGen" -> "Swashbuckle.AspNetCore").
    (top.id.toLowerCase().startsWith(repoName.toLowerCase()) ? top.id.slice(0, repoName.length) : top.id);
  accepted.push({
    name,
    owner,
    repo: r.nameWithOwner,
    url: r.url,
    homepage: r.homepageUrl || null,
    description: r.description ?? top.description ?? "",
    license,
    stars: r.stargazerCount,
    archived: r.isArchived,
    lastActivity: r.pushedAt?.slice(0, 10) ?? null,
    funding: (r.fundingLinks ?? []).map((f) => ({ platform: f.platform, url: f.url })),
    downloads: top.totalDownloads,
    topPackage: top.id,
    packages: g.packages.map((x) => x.id),
    relatedRepos: [],
  });
}
const result = accepted.map(({ owner, ...rest }) => rest);

const out = {
  generated: new Date().toISOString(),
  note: "Most downloaded community .NET open source projects on NuGet. Packages from Microsoft and cloud vendor SDK accounts are excluded. Downloads are for the most downloaded package in each repository.",
  count: result.length,
  projects: result,
  excluded,
};
fs.writeFileSync(path.join(root, "data/popular.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${result.length} projects to data/popular.json (${excluded.length} excluded).`);
