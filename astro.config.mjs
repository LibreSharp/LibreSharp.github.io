// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// GitHub Pages org site: served from https://libresharp.github.io (no base path needed).
export default defineConfig({
  site: "https://libresharp.github.io",
  trailingSlash: "always",
  integrations: [sitemap()],
});
