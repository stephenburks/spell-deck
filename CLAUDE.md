# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

D&D 5e Spell Library — a React PWA for browsing, filtering, and managing spells from the D&D 5e SRD. Spell data comes from the public API (`https://www.dnd5eapi.co/api/2014`). User data (spellbook, active deck, preferences) is persisted in localStorage.

## Commands

```bash
npm start        # Dev server at localhost:3000
npm run build    # Production build
npm test         # Run all tests (Jest via react-scripts)
npm run deploy   # Build + deploy to GitHub Pages (https://stephenburks.github.io/spell-deck)
```

Run a single test file:
```bash
npm test -- --testPathPattern=useAllSpells
```

## Architecture

**Data flow:**
`api.js` (batched/rate-limited fetch) → React Query cache → custom hooks → tab components

**Layers:**
- `src/api.js` — all API calls; uses `fetchInBatches` to avoid rate limiting. Single source of truth for network access.
- `src/hooks/` — `useAllSpells` (full spell DB + custom spells merged), `useDailySpells` (seeded daily randoms), `useSearchIndex` (Fuse.js fuzzy search). Keep components thin by putting logic here.
- `src/utils/` — localStorage r/w (`localStorage.js`), spell grouping by class/level (`spellGrouping.js`), validation (`validation.js`), and supplemental spells not in the API (`additionalSpells.js`)
- `src/components/tabs/` — one component per tab: `DailySpellsTab`, `SpellbookTab`, `SpellDeckTab`, `SpellLibraryTab`, `ReadmeTab`
- `src/components/card-features/` — spell card sub-components (`description.jsx`, `formatSpellText.jsx`)
- `src/components/ui/` — Chakra UI wrappers and theme config
- `src/components/SpellInterface.jsx` — root layout; owns tab state (persisted to sessionStorage) and localStorage initialization

**State:**
- Server/async state: React Query (24h stale time for spell data)
- Tab navigation: sessionStorage via `SpellInterface`
- User data (spellbook, deck): localStorage via `utils/localStorage.js`
- Local UI state: component-level `useState`

**Custom spells:** Added directly in `useAllSpells.js` via the `CUSTOM_SPELLS` array, merged with API data through `mergeAdditionalSpells`.

## Styling & Migration

Currently **Chakra UI v3**. Planned migration to **ShadCN + Tailwind**. When adding new UI:
- Avoid deepening Chakra-specific abstractions
- Prefer patterns that will be straightforward to port (simple layout, minimal Chakra-specific props)

## Formatting

Prettier (`.prettierrc`): tabs, width 4, print width 100, single quotes, no trailing commas. Auto-formats on save via `.vscode/settings.json`.
