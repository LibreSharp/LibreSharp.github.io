import type { APIRoute } from "astro";
import { getPopular } from "../lib/popular";

/** Open data: the popular projects list as JSON at /popular.json. */
export const GET: APIRoute = () => Response.json({ license: "CC-BY-4.0", ...getPopular() });
