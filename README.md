# Spell Deck

A D&D 5e spell reference PWA. Browse, search, filter, and manage spells for your tabletop sessions. Everything runs in your browser — no accounts, no backend, offline-capable.

**Live:** [stephenburks.github.io/spell-deck](https://stephenburks.github.io/spell-deck)

## Features

**Five tabs:**
- **Daily** — 12 randomly selected spells, refreshed each day
- **Spellbook** — Save spells to a personal collection for quick reference
- **Spell Deck** — Active session spell management with spell slot tracking and burn history
- **Spell Library** — Full searchable D&D 5e SRD spell database with class, level, and school filters
- **About** — Usage guide

**Other:**
- Fuzzy search by spell name, class, level, school, or description text
- Spell slot tracker (full caster, half caster, warlock progression) with interactive pips
- Campaign-scoped data (namespace spells, slots, and notes per campaign)
- Per-spell player notes on spell cards
- Dark mode
- Card and compact list views
- URL-based filter state (shareable `?q=`, `?class=`, `?level=` params)
- PWA with cache-first service worker for offline use

## Getting Started

```bash
git clone <repo-url>
cd spell-deck
npm install
```

### Development

```bash
npm run dev      # Vite dev server at localhost:3000
npm test         # Run all tests (Vitest)
npm run build    # Production build to /build
npm run deploy   # Build + deploy to GitHub Pages
```

### Run a single test file

```bash
npx vitest run --reporter=verbose path/to/test.test.ts
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Build | Vite 8 |
| UI framework | React 18 (functional components, hooks) |
| Component library | Chakra UI v3 |
| Data fetching | TanStack Query (React Query) |
| Search | Fuse.js (fuzzy search) |
| Testing | Vitest + React Testing Library |
| TypeScript | Partial (~50% migrated) |
| Deployment | GitHub Pages via GitHub Actions |

## Project Structure

```
src/
  api.js                  # Spell data fetching (batched, rate-limited)
  types.ts                # Spell, SessionSpell, and related interfaces
  App.jsx                 # Root component — providers, dark mode, routing
  hooks/
    useAllSpells.js       # Spell DB + custom spells merged, React Query cache
    useDailySpells.js     # Seeded daily random spells
    useSearchIndex.js     # Fuse.js fuzzy search index
    useDebounce.js        # Debounce hook
  components/
    SpellInterface.jsx    # Tab layout, tab state persistence
    SpellCard.jsx         # Spell detail card (used across tabs)
    SpellSlotTracker.jsx  # Spell slot tracking UI (pip grid)
    CampaignSelector.tsx  # Campaign creation/switching
    VirtualizedSpellList.jsx  # Efficient rendering for large spell lists
    tabs/
      DailySpellsTab.jsx
      SpellbookTab.jsx
      SpellDeckTab.jsx
      SpellLibraryTab.jsx
      ReadmeTab.jsx
    card-features/        # Spell card sub-components (description, formatting)
    ui/                   # Chakra UI wrappers, theme config, toaster, loading
  utils/
    localStorage.ts       # All localStorage read/write, campaign scoping
    spellSlots.ts         # D&D 5e spell slot progression tables
    spellGrouping.ts      # Group spells by level, generate session IDs
    validation.ts         # Spell object validation
    burnHistory.ts        # Burned spell history (name, level, timestamp)
```

## Data Sources

- Spell data: [D&D 5e SRD API](https://www.dnd5eapi.co/) ([5e-bits](https://github.com/5e-bits/5e-srd-api))
- Class/school icons: [tw-dnd](https://github.com/intrinsical/tw-dnd) by intrinsical

## Roadmap

See [ROADMAP.md](ROADMAP.md) for planned features and current progress.

## License

MIT
