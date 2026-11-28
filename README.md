# LibreSharp

**[libresharp.github.io](https://libresharp.github.io)**: a free list of .NET packages that moved from open source to commercial or paid models, and the free alternatives you can use instead.

LibreSharp is a non-profit, community project. We respect maintainers: open source maintenance is real work, and if a paid licence is right for your team, buy it. This list exists so everyone knows their options.

## What's on the site

- A searchable list of affected packages: what changed, when, the last free version, and free alternatives (community forks, replacements, and features built into .NET).
- A page per package with sources, security notes and a version-pinning snippet.
- A Popular page: the 100 most downloaded community .NET open source projects, with licences, activity and sponsor links. Built by `scripts/update-popular.mjs` (settings in `data/popular-config.yml`), refreshed weekly.
- Open data: [`/packages.json`](https://libresharp.github.io/packages.json) and [`/llms.txt`](https://libresharp.github.io/llms.txt) for AI coding assistants, plus `/templates.json`, `/popular.json` and `/apps.json`.

## Contributing

Every package is one YAML file in [`data/packages/`](data/packages). See [CONTRIBUTING.md](CONTRIBUTING.md).

## Running locally

```bash
npm install
npm run dev     # http://localhost:4321
npm run check   # type check
npm run build   # static site in dist/
GITHUB_TOKEN=$(gh auth token) node scripts/update-popular.mjs   # refresh data/popular.json
```

The build fetches download counts from the NuGet API. If NuGet can't be reached, the site still builds without them.

## How it's built

- [Astro](https://astro.build) static site, TypeScript, plain CSS. No server, no database, almost no JavaScript in the browser.
- Data is an Astro content collection with a schema (`src/content.config.ts`). A bad YAML file fails the build with a clear message.
- GitHub Actions builds on every push and pull request, deploys `main` to GitHub Pages, and rebuilds weekly to refresh NuGet stats.

## Licence

- Site code: [MIT](LICENSE)
- Data in `data/`: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
