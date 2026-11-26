import type { AlternativeKind, Category } from "./types";

export const CATEGORIES: Record<
  Category,
  { label: string; short: string; description: string }
> = {
  relicensed: {
    label: "Relicensed",
    short: "Now commercial",
    description:
      "New versions are no longer open source. Older versions keep their original open source licence.",
  },
  "revenue-capped": {
    label: "Free under a revenue limit",
    short: "Revenue limit",
    description:
      "New versions are free only for smaller organisations (for example under $1M revenue). Bigger organisations must buy a licence.",
  },
  "maintenance-fee": {
    label: "Maintenance fee",
    short: "Maintenance fee",
    description:
      "The source code is still open source, but organisations above a revenue limit are asked to pay a fee to use the official packages. If you can afford it, please consider paying: it keeps the project open source.",
  },
  abandoned: {
    label: "Abandoned",
    short: "Abandoned",
    description:
      "The owner stopped maintaining it. A community successor may exist.",
  },
  trust: {
    label: "Trust issue",
    short: "Trust issue",
    description:
      "The licence did not change, but a decision by the maintainer made many users move away.",
  },
};

export const ALTERNATIVE_KINDS: Record<AlternativeKind, string> = {
  fork: "Community fork",
  replacement: "Free replacement",
  "built-in": "Built into .NET",
  pin: "Stay on the last free version",
  pay: "Support the project",
};
