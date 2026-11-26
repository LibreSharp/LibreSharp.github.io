import type { APIRoute } from "astro";
import { getTemplates } from "../lib/data";
import { SITE } from "../lib/site";

/** Open data: the template comparison as JSON at /templates.json. */
export const GET: APIRoute = async () => {
  const templates = await getTemplates();
  return Response.json({
    name: "LibreSharp: free .NET templates compared",
    license: "CC-BY-4.0",
    source: SITE.repo,
    page: `${SITE.url}/templates/`,
    generated: new Date().toISOString(),
    count: templates.length,
    templates,
  });
};
