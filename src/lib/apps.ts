import type { App, AppCategory } from "./types";

/** Categories in the order they appear on the page. */
export const APP_CATEGORIES: Record<AppCategory, { label: string; blurb: string }> = {
  cms: { label: "Content management (CMS)", blurb: "Websites, headless content APIs and portals." },
  ecommerce: { label: "Online shops", blurb: "Shopping carts and e-commerce platforms." },
  community: { label: "Forums and blogs", blurb: "Discussion forums and blogging platforms." },
  business: {
    label: "Business: CRM, ERP and accounting",
    blurb: "Customer management, ERP, accounting and office suites.",
  },
  media: { label: "Media servers and readers", blurb: "Stream your own films, music, books and comics." },
  "media-automation": {
    label: "Media library automation",
    blurb: "Organise and fetch media for a home media server.",
  },
  security: {
    label: "Security, network and payments",
    blurb: "Password managers, DNS servers and payment processors you host yourself.",
  },
  devops: {
    label: "Developer and operations servers",
    blurb: "Error tracking, feature flags, caches and test mail servers.",
  },
  backup: { label: "Backup and archiving", blurb: "Encrypted backups and email archives." },
  desktop: { label: "Desktop utilities", blurb: "Everyday tools for Windows and other desktops." },
  developer: {
    label: "Developer desktop tools",
    blurb: "Shells, decompilers, Git clients and network tools.",
  },
  games: { label: "Games and launchers", blurb: "Games, game engines and game library managers." },
};

export const APP_STATUS: Record<App["status"], string> = {
  active: "Active",
  stale: "Not updated recently",
  unmaintained: "No longer maintained",
};
