# Spell Deck — Updated Roadmap

> June 2026 · Lead Architect: Fred

## Current State

Spell Deck is a **Vite-built, partially-typed React PWA** with static spell data, 95 tests, and CI/CD to GitHub Pages. Dark mode works, campaigns are namespaced, and spell slots track D&D 5e progression.

**Stack:** Vite 8 + React 18 + Chakra UI v3 + TanStack Query + TypeScript (partial) + Vitest + GitHub Actions

---

## Completed

| Feature | Notes |
|---------|-------|
| Static spell data (spells.json) | Single fetch, sub-second loads |
| Dark mode | next-themes + ColorModeButton |
| XSS fix | dangerouslySetInnerHTML → react-markdown |
| Compact list view | Card/compact toggle, persisted |
| URL-based filter state | Shareable ?q=, ?class=, ?level= params |
| BEM CSS modularization | 5 co-located CSS files |
| CRA → Vite migration | 400ms dev server |
| TypeScript (data layer) | types, api, localStorage, spellSlots, utilities |
| Test foundation | Vitest + 95 tests + GitHub Actions CI |
| Spell slot tracker | Full/half/warlock progression, interactive pips |
| Campaign management | Namespaced localStorage, popover selector |
| Per-spell notes | Inline textarea on SpellCard |
| PWA / offline | Service worker with cache-first strategy |

---

## In-Progress / Gaps

| Item | Remaining Work |
|------|---------------|
| TypeScript migration | Components and hooks still JS/JSX (~50% done) |
| Spell slot ↔ burn integration | Burning a spell doesn't decrement slots |
| README rewrite | Still has AI-generated marketing copy |
| Tab label consistency | Mixed abbreviations vs full labels |
| Search threshold | minMatchCharLength: 2 should be 1 |

---

## Roadmap

### Phase 5: Polish & Consolidation (1–2 weeks)
- Finish TypeScript migration (all components and hooks)
- Wire spell slot tracker to burn action
- Quick filters: reaction, ritual, bonus action in library
- Spell save DC / attack bonus display in Deck header
- Lower search threshold to 1 char
- Rewrite README
- Fix tab label consistency
- Increase test coverage

### Phase 6: Custom Spell Builder (2–3 weeks)
- Spell builder form UI with all Spell-type fields
- Custom spells stored in localStorage (campaign-scoped)
- Custom spells appear in library with visual tag
- Edit / delete custom spells
- Import/export custom spell JSON

### Phase 7: Export & Sharing (2–3 weeks)
- Export spellbook as JSON (download button)
- Import spellbook JSON (upload + validate + merge)
- Printable spell cards (print-friendly layout, 2×4 per page)
- Share spellbook via URL (client-side encoding, read-only view)
- localStorage quota warning with backup prompt

### Phase 8: Character Sheet Integration (3–4 weeks)
- D&D Beyond text-paste import (parse spell list from pasted text)
- Multiclass spell slot calculator
- Prepared / known spells split
- Spell save DC / attack bonus display

---

## DM Tools (Separate)

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Loot / scroll generator | 3 | 2 | **12** |
| Encounter spell randomizer | 3 | 2 | **12** |
| Party spell tracker (DM view) | 4 | 5 | **4** |
| Condition / concentration tracker | 3 | 3 | **9** |
| DM screen mode (low-contrast) | 2 | 2 | **8** |

DM tools are deferred to a separate planning session.
