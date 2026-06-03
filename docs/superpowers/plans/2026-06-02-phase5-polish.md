# Phase 5: Polish & Consolidation — Execution Plan

**Date:** 2026-06-02 · **Architect:** Fred · **Baseline:** 98 tests passing, 81.77% coverage

## Item 1: Lower search threshold to 1 char

**Assigned:** @fred  
**Files:** `src/hooks/useSearchIndex.js`, `src/components/tabs/SpellLibraryTab.jsx`

### Changes
- [ ] `useSearchIndex.js:60`: `term.length < 2` → `term.length < 1`
- [ ] `useSearchIndex.js:81`: `searchTerm.trim().length < 2` → `searchTerm.trim().length < 1`
- [ ] `SpellLibraryTab.jsx:415`: `searchTerm.length >= 2` → `searchTerm.length >= 1` (spinner threshold)

### Verify
```
npm test -- --testPathPattern=useSearchIndex
```

---

## Item 2: Fix tab label consistency

**Assigned:** @fred  
**Files:** `src/components/SpellInterface.jsx`

### Changes
- [ ] Fix tooltip typo line 114: `Spell Spellbook` → `Spellbook`
- [ ] Change tab label `Deck` → `Spell Deck` (to match heading)
- [ ] Change tab label `Library` → `Spell Library` (to match heading)

### Verify
```
npm run build && npm test
```

---

## Item 3: Spell slot ↔ burn integration (verify)

**Assigned:** @fred  
**Files:** `src/components/tabs/SpellDeckTab.jsx`, `src/components/SpellSlotTracker.jsx`

### Analysis
- `markSlotUsed(level)` at SpellDeckTab:123 correctly increments `usedSlots[level]`, saves to localStorage via `STORAGE_KEY`, dispatches `spell-deck:slot-changed`
- `SpellSlotTracker` line 62 listens for `spell-deck:slot-changed` and reloads state from localStorage
- Integration already works. Mark as verified.

### Verify
```
npm test
```

---

## Item 4: Spell save DC / attack bonus display

**Assigned:** @daphne  
**Files:** `src/components/tabs/SpellDeckTab.jsx` (new), `src/utils/localStorage.ts` (maybe)

### Changes
- [ ] Add two NumberInput fields in the SpellDeckTab header area (after spellCounts, around line 310)
- [ ] Persist to localStorage under key `spell-deck-character-stats`
- [ ] Format: `{ saveDC: number, attackBonus: number }`
- [ ] Simple `<HStack>` with labels: "Save DC" and "Attack Bonus"

### Verify
```
npm test && npm run build
```

---

## Item 5: Quick filters verification

**Assigned:** @fred  
**Files:** `src/components/tabs/SpellLibraryTab.jsx`

### Analysis
- State at lines 41-43, filter logic at lines 183-185, UI buttons at lines 446-466
- Logic: `showRitualOnly && !spell.ritual`, `showReactionOnly && !spell.casting_time?.includes('reaction')`, `showBonusActionOnly && !spell.casting_time?.includes('bonus action')`
- Code looks correct. Verify with test run and mark done.

### Verify
```
npm test
```

---

## Item 6: TypeScript migration

**Assigned:** @daphne (components) + @velma (hooks)  
**Files:** All remaining `.js`/`.jsx` in `src/hooks/` and `src/components/`

### Hooks to convert (5 files)
- `src/hooks/index.js`
- `src/hooks/useAllSpells.js`
- `src/hooks/useDailySpells.js`
- `src/hooks/useDebounce.js`
- `src/hooks/useSearchIndex.js`

### Components to convert (8 files)
- `src/components/SpellInterface.jsx`
- `src/components/SpellCard.jsx`
- `src/components/SpellSlotTracker.jsx`
- `src/components/VirtualizedSpellList.jsx`
- `src/components/CompactSpellRow.jsx`
- `src/components/IconRegistry.jsx`
- `src/components/tabs/DailySpellsTab.jsx`
- `src/components/tabs/SpellbookTab.jsx`
- `src/components/tabs/SpellDeckTab.jsx`
- `src/components/tabs/SpellLibraryTab.jsx`
- `src/components/tabs/ReadmeTab.jsx`

### Principles
- Use existing types from `src/types.ts` (`Spell`, `SessionSpell`)
- No `any` types — use proper TypeScript
- Verify with `npm test && npm run build` after each file

---

## Item 7: README rewrite

**Assigned:** @scrappy  
**Files:** `README.md`

### Requirements
- Remove emojis from headings
- Concise, factual, useful
- Sections: What the app does, How to run locally, How to deploy, Tech stack, Project structure
- Fix outdated commands (`npm start` → `npm run dev`)
- Link to ROADMAP.md not ideas.md

---

## Item 8: Increase test coverage

**Assigned:** @shaggy  
**Files:** `src/utils/__tests__/`

### Targets
- `spellSlots.ts:81-93` (warlock slot calculation, currently 31.57%)
- `localStorage.ts` uncovered branches
- Add tests for `getSlotsForLevel` warlock path
- Add tests for edge cases in `safeLoadFromStorage`, `safeSaveToStorage`
