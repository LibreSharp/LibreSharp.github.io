# Contributing to LibreSharp

Thank you for helping. Corrections are as valuable as new entries.

## Fixing an entry

Use the "Edit this page on GitHub" link at the bottom of any package page, or edit the file in `data/packages/` directly and open a pull request.

## Adding a package

Create `data/packages/<slug>.yml`. The slug must match the file name and use lowercase letters, numbers and dashes. See any existing file, or the template on the [Contribute page](https://libresharp.github.io/contribute/).

| Field | Required | Notes |
|---|---|---|
| `slug` | yes | Matches the file name |
| `name` | yes | Display name |
| `nuget` | yes | List of NuGet IDs. The first is used for download stats |
| `repo` | no | Source repository URL |
| `category` | yes | `relicensed`, `revenue-capped`, `maintenance-fee`, `abandoned` or `trust` |
| `oldLicense` | yes | The licence before the change |
| `newModel` | yes | What it is now, in plain words |
| `lastFreeVersion` | yes | Exact version where possible (enables the pinning snippet) |
| `firstPaidVersion` | no | |
| `changed` | yes | `YYYY`, `YYYY-MM` or `YYYY-MM-DD` |
| `freeTier` | no | Who can still use it for free |
| `summary` | yes | One or two plain sentences |
| `notes` | no | List of extra points |
| `security` | no | List of `id`, `url`, `text` for known vulnerabilities in the last free version |
| `alternatives` | yes | List of `name`, `kind` (`fork`, `replacement`, `built-in`, `pin`, `pay`), `url`, `nuget`, `license`, `note` |
| `sources` | yes | List of `title`, `url`. Prefer the project's own licence or announcement |
| `checked` | no | `YYYY-MM-DD` you confirmed the facts against the sources. Leave out if you haven't |

## Adding a template

Templates live in `data/templates/<slug>.yml`, checked against the schema in `src/content.config.ts`. Copy an existing file. Each feature (`auth`, `multiTenancy`, `billing`, `adminUi`, `email`, `backgroundJobs`, `deploy`, `tests`) has a `status` of `yes`, `partial`, `no` or `unknown`, plus an optional `note`. Use `unknown` rather than guessing. List any paid packages the template depends on under `paidDependencies`.

## Adding an app

Open source apps built with .NET live in `data/apps/<slug>.yml`, checked against the schema in `src/content.config.ts`. Copy an existing file. Only add complete applications people can install and use (not libraries, frameworks or templates) with an open source licence. Pick a `category` from the list in the schema, describe any extra licence terms in `licenseNote`, and list where it runs in `runsOn`. Stars are read from GitHub when the site builds.

## Rules

- Every fact needs a source.
- Keep the tone neutral and respectful to maintainers. No criticism of people for changing their licence.
- Only list alternatives that are free and open source, or built into .NET.
- Maintenance-fee projects are still open source: always include a `pay` option for them.

## Checking your change

```bash
npm install
npm run build
```

The build checks every data file against the schema in `src/content.config.ts` and tells you exactly what is wrong.

## Wanted: entries to research

These may belong on the list but haven't been checked yet:

- Xceed Extended WPF Toolkit (Ms-PL → Xceed Community Licence)
- Blazorise (commercial licence for commercial use)
- EventStoreDB → KurrentDB (server licence change; .NET client still Apache-2.0)
- Open-core projects to watch: Hangfire, Avalonia, Uno Platform, Hot Chocolate, ABP
