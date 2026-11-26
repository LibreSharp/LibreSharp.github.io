import type { FeatureKey, FeatureStatus, Template } from "./types";

export const FEATURES: { key: FeatureKey; label: string; short: string }[] = [
  { key: "auth", label: "Sign-in and users", short: "Sign-in" },
  { key: "multiTenancy", label: "Multi-tenancy (separate customer accounts)", short: "Multi-tenant" },
  { key: "billing", label: "Billing and payments", short: "Billing" },
  { key: "adminUi", label: "Admin screens", short: "Admin UI" },
  { key: "email", label: "Sending email", short: "Email" },
  { key: "backgroundJobs", label: "Background jobs", short: "Jobs" },
  { key: "deploy", label: "Deployment setup", short: "Deploy" },
  { key: "tests", label: "Tests included", short: "Tests" },
];

export const FEATURE_STATUS: Record<FeatureStatus, { symbol: string; label: string }> = {
  yes: { symbol: "✓", label: "Included" },
  partial: { symbol: "½", label: "Partly included" },
  no: { symbol: "–", label: "Not included" },
  unknown: { symbol: "?", label: "Not checked yet" },
};

export const TEMPLATE_STATUS: Record<Template["status"], string> = {
  active: "Active",
  stale: "Not updated recently",
  unmaintained: "No longer maintained",
  reference: "Reference app, not a starter",
};
