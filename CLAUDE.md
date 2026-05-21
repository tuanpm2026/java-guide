# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

JavaGuide is a **Chinese-language documentation site** for Java backend interview prep, published at https://javaguide.cn. Despite the parent folder name `Java-interview-learn`, there is **no Java source code or test suite here** — the deliverable is a static site built from Markdown.

Stack: VuePress 2 (rc) + `vuepress-theme-hope` + Vite bundler, managed with **pnpm** (the `packageManager` field pins `pnpm@10.0.0`; do not use npm/yarn — `package-lock.json` is gitignored).

## Common commands

Run from `JavaGuide/` (not the repo root):

- `pnpm docs:dev` — local dev server with hot reload (alias: `pnpm dev`).
- `pnpm docs:clean-dev` — dev server with a cleared cache; use when stale cache causes weird routing/sidebar issues.
- `pnpm docs:build` — production build into `./dist` (alias: `pnpm build`). This is what CI runs (`.github/workflows/test.yml`) with `NODE_OPTIONS=--max_old_space_size=4096`; expect the build to be memory-hungry.
- `pnpm docs:build:clean` — wipes `.vuepress/.temp` and `.vuepress/.cache` before building.
- `pnpm lint` — runs `lint:prettier` then `lint:md` (markdownlint-cli2). `lint:prettier` **writes** changes (`--check --write`), it is not read-only.
- `pnpm lint:md` — markdownlint only, scoped by `.markdownlint-cli2.mjs`.

A Husky `pre-commit` hook runs `pnpm nano-staged`, which applies Prettier to all staged files and markdownlint to staged `.md` files. Don't bypass it.

## Architecture & where things live

### Content vs. configuration

- **Content** lives under `docs/<section>/*.md` (e.g. `docs/java/`, `docs/database/`, `docs/distributed-system/`, `docs/system-design/`, `docs/ai/`). Section folders correspond to URL prefixes.
- **Site configuration** lives under `docs/.vuepress/`:
  - `config.ts` — top-level VuePress config (title, head meta, bundler, page patterns).
  - `theme.ts` — theme-hope configuration including the markdown `include.resolvePath` rule that maps `@` to `docs/snippets/`.
  - `navbar.ts` — top navbar.
  - `sidebar/index.ts` — the master sidebar; **adding a new page is a two-step change**: create the `.md` file _and_ register its slug in the right `children` array here. Pages not listed will still render but won't appear in the sidebar.
  - `sidebar/constants.ts` — `ICONS` map plus `createImportantSection` / `createSourceCodeSection` helpers used by `index.ts`; reuse these helpers instead of inlining `{ text: "重要知识点", ... }` blocks.

### Snippets and `pagePatterns`

Files matching `**/*.snippet.md` are **excluded from `pagePatterns`** in `config.ts` — they are reusable fragments included into other pages via markdown `<!-- @include: @article-footer.snippet.md -->` syntax. The `@` is resolved to `docs/snippets/` by the custom `resolvePath` in `theme.ts`. When creating a reusable fragment, name it `*.snippet.md` so it isn't rendered as a standalone page.

### Authoring conventions

- Content is **Simplified Chinese** (`lang: "zh-CN"`). Match the existing voice; don't translate to English when editing existing pages.
- Many pages start with frontmatter (`title`, `category`, `tag`, `head`). Look at a neighbor page in the same section before adding a new one.
- Markdown lint rules are relaxed: line-length (`MD013`) and code-fence style (`MD046`) are off; ATX headings (`MD003`) and dash bullets (`MD004`) are enforced; the horizontal-rule style is `---` (`MD035`).
- Mermaid, code tabs, alignment, GFM, and tasklists are enabled in `theme.ts` — feel free to use them.

### External hosting / interview-突击 site

Some sidebar entries link to `https://interview.javaguide.cn/...` — that is a **separate companion site** not in this repo. Treat those as external links, not internal pages.

## Notes specific to this checkout

- The git repository lives inside `JavaGuide/`, not at `/Users/tuanphung/work/Java-interview-learn/`. Run git commands from inside `JavaGuide/`.
- `node_modules/` is already installed; if dependencies look off, `pnpm install --frozen-lockfile` matches CI.
- macOS `.DS_Store` files appear in some directories — leave them alone, they are gitignored at the global level for this user but tracked-state varies.
