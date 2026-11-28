import type { APIRoute } from "astro";
import { getApps } from "../lib/data";
import { SITE } from "../lib/site";

/** Open data: the open source .NET apps list as JSON at /apps.json. */
export const GET: APIRoute = async () => {
  const apps = await getApps();
  return Response.json({
    name: "LibreSharp: open source apps built with .NET",
    license: "CC-BY-4.0",
    source: SITE.repo,
    page: `${SITE.url}/apps/`,
    generated: new Date().toISOString(),
    count: apps.length,
    apps,
  });
};
