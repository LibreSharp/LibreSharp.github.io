import type { APIRoute } from "astro";
import { getPackages } from "../lib/data";
import { SITE } from "../lib/site";

/** Open data: the full list as JSON at /packages.json. */
export const GET: APIRoute = async () => {
  const packages = (await getPackages()).map((p) => ({ ...p, url: `${SITE.url}/packages/${p.slug}/` }));
  return Response.json({
    name: "LibreSharp: .NET packages that moved from free to paid",
    license: "CC-BY-4.0",
    source: SITE.repo,
    generated: new Date().toISOString(),
    count: packages.length,
    packages,
  });
};
