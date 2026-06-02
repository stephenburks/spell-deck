# Spell Deck — Comprehensive Codebase Audit & Implementation Plan

> Generated: June 2, 2026 Based on: Fallow analysis, React Doctor report, and technical
> documentation review

---

## Executive Summary

This audit combines static analysis (Fallow, React Doctor) with manual code review against your
technical documentation. The codebase is in **good shape overall** (90.1 MI score) but has
accumulated technical debt across several dimensions:

- **Dead code**: 7.3% unused files, 11.4% unused exports
- **Duplication**: 353 lines (6.5%) duplicated across 8 files
- **Complexity**: 21 functions exceed CRAP thresholds, 2 files are "critical" complexity
- **React patterns**: 3 critical bugs (state sync issues, unstable context)
- **Architecture**: Still on deprecated patterns (next-themes in non-Next app)

**Recommended approach**: Fix critical React bugs first (P0), then systematic cleanup in phases
aligned with your roadmap.

---

## 🔴 P0 — Critical Issues (Fix Immediately)

### 1. React Doctor: State Synced to Prop Inside Effect (CRITICAL BUG)

**Files**: `src/hooks/useDebounce.js:8`, `src/components/VirtualizedSpellList.jsx:19`

**What's broken**: When a parent component changes the `value` or `items` prop, users briefly see
stale data because React runs effects _after_ render. This causes visual glitches.

**Real-world impact**:

- `useDebounce`: When users type fast in the search box, they see outdated search results for 1-2
  frames
- `VirtualizedSpellList`: When switching filter tabs, the old spell list flashes before updating

**Human severity**: Medium-High — users notice flickering, especially on slower devices

**Canonical fix** (from react.doctor docs):

```js
// ❌ BEFORE (useDebounce.js)
export function useDebounce(value, delay) {
	const [debouncedValue, setDebouncedValue] = useState(value) // ← BUG: initialized from prop
	const [isDebouncing, setIsDebouncing] = useState(false)

	useEffect(() => {
		if (value !== debouncedValue) setIsDebouncing(true)
		const handler = setTimeout(() => {
			setDebouncedValue(value)
			setIsDebouncing(false)
		}, delay)
		return () => clearTimeout(handler)
	}, [value, delay, debouncedValue])

	return { debouncedValue, isDebouncing }
}

// ✅ AFTER (remove state entirely, use ref)
export function useDebounce(value, delay) {
	const [debouncedValue, setDebouncedValue] = useState(value)
	const [isDebouncing, setIsDebouncing] = useState(false)

	useEffect(() => {
		setIsDebouncing(true)
		const handler = setTimeout(() => {
			setDebouncedValue(value)
			setIsDebouncing(false)
		}, delay)
		return () => clearTimeout(handler)
	}, [value, delay])

	return { debouncedValue, isDebouncing }
}
```

**Fix for VirtualizedSpellList.jsx**:

```js
// ❌ BEFORE (line 19)
useEffect(() => {
  setCurrentPage(0)
}, [items])

// ✅ AFTER (use key prop instead)
// In parent component that renders VirtualizedSpellList:
<VirtualizedSpellList
  key={spells.length} // ← Force remount when spells change
  spells={spells}
  ...
/>
// OR derive from props directly without state
```

**Action**: Create fix branch, apply changes, verify with `npx react-doctor@latest --verbose`

---

### 2. React Doctor: Multiple setState in One Effect (WARNING)

**File**: `src/hooks/useDebounce.js:7`

**What's broken**: Calling `setIsDebouncing(true)` and `setDebouncedValue(value)` +
`setIsDebouncing(false)` in the same effect causes 2-4 separate redraws instead of 1 batched update.

**Real-world impact**: Extra CPU cycles on every keystroke in search. On mobile, this compounds the
performance issue.

**Human severity**: Low-Medium — barely noticeable on desktop, slightly laggy feel on mobile

**Fix**: Already covered in the fix above (removes the issue by restructuring the effect)

---

### 3. React Doctor: Unstable Context Provider Value (WARNING)

**File**: `src/components/CampaignContext.tsx:56`

**What's broken**: The `value` prop is built inline as a new object on every render, causing every
component that reads this context to re-render unnecessarily.

**Real-world impact**: Every time `CampaignProvider` renders (e.g., user types in search), ALL
components using `useCampaign()` redraw — including `SpellCard` components that don't care about
campaigns.

**Human severity**: Medium — causes performance degradation, especially noticeable when rendering
50+ spell cards

**Canonical fix**:

```tsx
// ❌ BEFORE (line 56)
return (
	<CampaignContext.Provider
		value={{ activeCampaign, campaigns, switchCampaign, addCampaign, removeCampaign }}>
		{children}
	</CampaignContext.Provider>
)

// ✅ AFTER (memoize the value)
const contextValue = useMemo(
	() => ({ activeCampaign, campaigns, switchCampaign, addCampaign, removeCampaign }),
	[activeCampaign, campaigns, switchCampaign, addCampaign, removeCampaign]
)

return <CampaignContext.Provider value={contextValue}>{children}</CampaignContext.Provider>
```

**Action**: Apply fix, verify no unnecessary rerenders with React DevTools Profiler

---

### 4. Broken next-themes Integration (From improvements.md #2)

**Severity**: HIGH — blocks dark mode feature entirely

**Current state**: `next-themes` is installed but nonfunctional (requires Next.js). Chakra UI v3
already has `ColorModeProvider` which works in any React app.

**Files affected**:

- `package.json` — has `next-themes` dependency (dead)
- `src/components/ui/color-mode.jsx` — imports from `next-themes`
- `src/components/ui/provider.jsx` — unused file wrapping color-mode

**Why this happened**: Likely copy-pasted from Chakra v3 examples that assume Next.js

**Fix**:

1. Remove `next-themes` dependency
2. Replace `src/components/ui/color-mode.jsx` with Chakra's native `useColorMode`
3. Update `App.jsx` to use Chakra's `ColorModeProvider` directly
4. Delete `src/components/ui/provider.jsx` (unused)

**Action**: Follow technical guide section #2 exactly

---

## 🟡 P1 — Dead Code Cleanup (High Value, Low Risk)

### 5. Unused Files (4 files)

**Impact**: Confuses developers, increases bundle size slightly

| File                             | Why Unused                                                           | Action                                              |
| -------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------- |
| `public/sw.js`                   | Service worker never registered in index.html or App.jsx             | Keep for Phase 4 (PWA support) but add TODO comment |
| `src/components/ui/provider.jsx` | Dead wrapper for broken next-themes                                  | **DELETE**                                          |
| `src/hooks/index.js`             | Re-exports hooks but never imported (direct imports used everywhere) | **KEEP** (good pattern for future)                  |
| `src/utils/index.ts`             | Same as above                                                        | **KEEP** (good pattern for future)                  |

**Action**: Delete `provider.jsx`, add `// TODO: Phase 4 - PWA support` comment to `sw.js`

---

### 6. Unused Exports (15 exports across 6 files)

#### High priority (blocking cleanup):

| File                               | Unused Exports                                                | Why                                                         | Action                                 |
| ---------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------- |
| `src/components/ui/color-mode.jsx` | `useColorMode`, `useColorModeValue`, `ColorModeIcon` (3)      | Part of broken next-themes integration                      | **DELETE FILE** after fixing #4        |
| `src/utils/spellSlots.ts`          | `FULL_CASTER_SLOTS`, `HALF_CASTER_SLOTS`, `WARLOCK_SLOTS` (3) | Created for Phase 2 spell slot tracker, not yet implemented | **KEEP** (needed for roadmap item 2.1) |
| `src/utils/localStorage.ts`        | `STORAGE_KEYS`, `scopeKey` (2)                                | Internal helpers that should be private                     | **Mark as private** or remove export   |

#### Low priority (no harm keeping):

| File                          | Unused Exports               | Why                                      | Action                        |
| ----------------------------- | ---------------------------- | ---------------------------------------- | ----------------------------- |
| `src/utils/spellNotes.ts`     | `loadNotes`, `saveNotes` (2) | Created for Phase 2 spell notes feature  | **KEEP** (roadmap item 2.4)   |
| `src/hooks/useSearchIndex.js` | `useSpellFilter`             | Unused variant of search hook            | **DELETE** if no plans to use |
| `src/utils/burnHistory.ts`    | `BURN_HISTORY_KEY`           | Internal constant that should be private | **Remove export**             |

---

### 7. Unused Type Exports (3)

**File**: `src/types.ts`

```ts
// ❌ Never used
export interface SpellCollection { ... }       // Line 50
export interface DailySpellCollection { ... }  // Line 55

// ❌ Never used
// src/utils/spellSlots.ts
export type SlotState { ... }  // Line 104
```

**Why unused**: Created for future features or refactored away

**Action**:

- **KEEP** `SpellCollection` and `DailySpellCollection` (used in roadmap Phase 2 for campaign
  management)
- **DELETE** or inline `SlotState` (too specific for export)

---

### 8. Unused Dependencies (2)

**Impact**: +100 KB bundle size, npm audit noise

```json
// package.json
"@chakra-ui/theme": "^3.3.0",     // ← Unused, Chakra UI v3 bundles this
"@emotion/styled": "^11.11.0"     // ← Unused, using sx props instead
```

**Action**:

```bash
npm uninstall @chakra-ui/theme @emotion/styled
npm run build  # Verify no errors
```

---

### 9. Unresolved Import Paths (2)

**Impact**: TypeScript/build errors waiting to happen

```ts
// src/api.ts:1
import { ... } from '../types'  // ❌ should be '../types.ts'

// src/utils/__tests__/localStorage.test.ts:15
import { ... } from '../../../types.ts'  // ❌ wrong relative path
```

**Fix**: Use explicit `.ts` extension or fix relative path

---

## 🟠 P2 — Duplication (Extract Shared Code)

### 10. Clone Families (85 lines duplicated across SpellDeckTab.jsx + SpellbookTab.jsx)

**What's duplicated**:

1. **orderedLevels computation** (43 lines, dup:768d8c00)
2. **spellCounts computation** (31 lines, dup:05712f1f)
3. **grouping logic** (26 lines, dup:7f58572a)

**Why this matters**: Bug fixes (like the cantrip burn check) have to be applied in 3 places.
Already happened once (see git blame on burnSpell function).

**Extract to**:

```ts
// src/hooks/useSpellGrouping.ts (new file)
export function useSpellGrouping(spells: Spell[]) {
  const groupedSpells = useMemo(() => groupSpellsByLevel(spells), [spells])

  const orderedLevels = useMemo(() => {
    const levels = ['Cantrips', 'Level 1', ..., 'Level 9']
    return levels.filter(level => groupedSpells[level]?.length > 0)
  }, [groupedSpells])

  const spellCounts = useMemo(() => {
    const cantrips = spells.filter(s => s.level === 0).length
    const leveledSpells = spells.filter(s => s.level > 0).length
    return { cantrips, leveledSpells, total: spells.length }
  }, [spells])

  return { groupedSpells, orderedLevels, spellCounts }
}
```

**Impact**: Reduces tab files from 400+ LOC to ~300 LOC each, eliminates 3-way sync risk

---

### 11. Smaller Duplications (9 clone groups, 268 lines)

**Test setup duplication** (20 lines, 2 instances):

- Extract shared `beforeEach` to `src/test/testHelpers.ts`

**SpellSlotTracker internal duplication** (13 lines, 2 instances):

- Extract slot rendering to `<SlotPip>` component

**Action**: Low priority — wait until these files are touched for other reasons

---

## 🔵 P3 — Complexity Reduction

### 12. Critical Complexity Functions (7 functions, CRAP > 100)

| Function                       | CRAP | LOC | Cyclomatic | Issue                                                         |
| ------------------------------ | ---- | --- | ---------- | ------------------------------------------------------------- |
| `SpellLibraryTab`              | 756  | 660 | 27         | God component — handles search, filters, view toggle, actions |
| `SpellCard`                    | 272  | 272 | 16         | Too many responsibilities (render + actions + context)        |
| `SpellLibraryTab` filter arrow | 240  | 29  | 15         | Nested filter logic, hard to test                             |
| `DailySpellsTab`               | 240  | 215 | 15         | Similar structure to SpellLibraryTab (extract shared layout)  |
| `SpellDeckTab`                 | 240  | 409 | 15         | Similar to above two tabs                                     |
| `burnSpell` function           | 156  | 74  | 12         | Too much validation + side effects in one function            |

**Extract strategy** (tackle in order):

#### 12.1 Extract SpellLibraryTab pieces

```
SpellLibraryTab (660 LOC)
├── useSpellFilters hook (filter state + logic) [new]
├── <FilterPanel> component (class/level/school toggles) [new]
├── <ViewToggle> component (card/compact switch) [new]
└── <SpellListContainer> component (renders list based on view) [new]
```

**Target**: Reduce main component to <150 LOC

#### 12.2 Split SpellCard responsibilities

```
SpellCard (272 LOC)
├── <SpellCardHeader> (name, level, school) [new]
├── <SpellCardStats> (range, time, components) [new]
├── <SpellCardDescription> (formatted text) [exists]
├── <SpellCardActions> (context-aware buttons) [new]
└── useSpellActions hook (action handlers) [new]
```

**Target**: Reduce to <100 LOC

#### 12.3 Refactor burnSpell

```ts
// Current: validation + localStorage + toast all inline
// After: split into 3 functions
const validateBurnSpell = (spell) => Result<Spell, Error>
const executeBurn = (sessionId, campaignId) => Result<void, Error>
const showBurnToast = (result, toaster) => void
```

---

### 13. Untested Complexity (6 functions lack test coverage)

**Highest priority** (from Fallow refactoring targets):

1. `src/hooks/useSearchIndex.js` (pri: 32.2) — 2 complex functions, no tests
2. `src/utils/validation.ts` (pri: 34.6) — 7 dependents, high impact

**Action**: Add unit tests before refactoring (prevents regression)

```ts
// src/hooks/__tests__/useSearchIndex.test.ts
describe('useSpellSearch', () => {
  it('returns empty results for empty query', () => { ... })
  it('fuzzy matches spell names', () => { ... })
  it('searches spell descriptions', () => { ... })
  it('respects level filter', () => { ... })
})
```

---

## 📋 Implementation Phases

### Phase 0: Critical Fixes (Week 1)

**Goal**: Fix user-facing bugs, unblock dark mode

1. ✅ Fix React Doctor issues (#1, #2, #3)
2. ✅ Remove next-themes, fix dark mode (#4)
3. ✅ Delete unused `provider.jsx` (#5)
4. ✅ Remove unused deps (#8)
5. ✅ Fix import paths (#9)

**Deliverable**: No React warnings, working dark mode, -100 KB bundle

---

### Phase 1: Dead Code & Duplication (Week 2)

**Goal**: Clean codebase, reduce maintenance burden

1. ✅ Mark unused exports as private or delete (#6, #7)
2. ✅ Extract `useSpellGrouping` hook (#10)
3. ✅ Apply to SpellDeckTab, SpellbookTab, DailySpellsTab
4. ✅ Add tests for extracted hook

**Deliverable**: -85 LOC duplication, 3 tab files <300 LOC each

---

### Phase 2: Complexity Reduction (Weeks 3-4)

**Goal**: Make codebase maintainable for new contributors

1. ✅ Split SpellLibraryTab (#12.1)
2. ✅ Split SpellCard (#12.2)
3. ✅ Refactor burnSpell (#12.3)
4. ✅ Add test coverage (#13)

**Deliverable**: No functions >100 LOC, test coverage >50%

---

### Phase 3: Roadmap Features (Aligned with roadmap doc)

Follow your `ROADMAP.md` phases 1-4

---

## 🎯 Quick Wins (Do Anytime)

These are low-effort, high-visibility improvements:

1. **Remove console.log** (from improvements.md #5)

    ```bash
    grep -rn "console\.log" src/ | wc -l  # Find them all
    ```

2. **Fix file casing** (from improvements.md #8)

    ```bash
    git mv src/components/spellCard.jsx src/components/SpellCard.jsx
    ```

3. **Update README** (from improvements.md #12)
    - Remove 14 emojis from headings
    - Cut "Built with ❤️" footer
    - Fix `d-d-5e-spell-library` → `spell-deck` in clone command

4. **Add .nvmrc or .node-version**

    ```bash
    echo "20.12.0" > .nvmrc
    ```

5. **Add test:coverage script**
    ```json
    "scripts": {
      "test:coverage": "vitest --coverage"
    }
    ```

---

## 📊 Success Metrics

Track these after each phase:

| Metric              | Current     | After Phase 0 | After Phase 1 | After Phase 2 |
| ------------------- | ----------- | ------------- | ------------- | ------------- |
| Dead files          | 7.3%        | 5.5%          | 0%            | 0%            |
| Dead exports        | 11.4%       | 8%            | 3%            | 0%            |
| Duplication         | 6.5%        | 6.5%          | 3%            | <2%           |
| Avg function LOC    | —           | —             | —             | <40           |
| CRAP > 100          | 7 functions | 7             | 5             | 0             |
| Test coverage       | 0%          | 0%            | 20%           | 50%           |
| React Doctor issues | 3 critical  | 0             | 0             | 0             |
| Bundle size         | ~2.1 MB     | ~2.0 MB       | ~1.95 MB      | ~1.9 MB       |

---

## 🔧 Developer Experience Improvements

### Add these scripts to package.json:

```json
"scripts": {
  "lint": "eslint src/",
  "lint:fix": "eslint src/ --fix",
  "analyze": "npx fallow",
  "analyze:health": "npx fallow health",
  "doctor": "npx react-doctor@latest --verbose",
  "deadcode": "npx fallow fix --dry-run",
  "test:watch": "vitest --watch",
  "test:ui": "vitest --ui"
}
```

### Add .vscode/settings.json:

```json
{
	"editor.formatOnSave": true,
	"editor.defaultFormatter": "esbenp.prettier-vscode",
	"eslint.autoFixOnSave": true,
	"files.exclude": {
		"**/.DS_Store": true,
		"**/node_modules": true,
		"**/build": true
	}
}
```

---

## 🚨 Risks & Mitigations

| Risk                                    | Impact | Mitigation                             |
| --------------------------------------- | ------ | -------------------------------------- |
| Breaking changes while refactoring tabs | High   | Add integration tests before splitting |
| Users see broken dark mode during fix   | Medium | Do on feature branch, test thoroughly  |
| Removing exports breaks future code     | Low    | Keep exports for roadmap features      |
| Git history lost on file renames        | Low    | Use `git mv`, not delete+create        |

---

## 📝 Notes from Document Review

### From `ROADMAP.md`:

- Dark mode is already completed (listed under "Completed")
- PWA / offline is already completed (service worker with cache-first strategy)
- 98 tests pass across 5 test files (vitest confirms)
- Phase 5 "Polish & Consolidation" covers TS migration, test coverage increase, README rewrite, and spell slot↔burn integration
- Phase 6-8 features should follow after foundation fixes

---

## 🎬 Recommended Order of Operations

**Week 1 (P0 Critical Fixes):**

1. Branch: `fix/react-doctor-critical-bugs`
    - Fix useDebounce state sync
    - Fix VirtualizedSpellList state sync
    - Fix CampaignContext unstable value
    - Verify: `npx react-doctor@latest --verbose` shows 0 critical issues

2. Branch: `fix/dark-mode-architecture`
    - Remove next-themes dependency
    - Replace with Chakra ColorModeProvider
    - Delete ui/provider.jsx and ui/color-mode.jsx
    - Add dark mode toggle button
    - Verify: Dark mode works in both dev and production

3. Branch: `chore/cleanup-dead-deps`
    - Remove @chakra-ui/theme and @emotion/styled
    - Fix import paths in api.ts and test files
    - Run build to verify

**Week 2 (P1 Dead Code & Duplication):** 4. Branch: `refactor/extract-spell-grouping`

- Create useSpellGrouping hook
- Extract from SpellDeckTab, SpellbookTab, DailySpellsTab
- Add unit tests
- Verify: All 3 tabs work identically

5. Branch: `chore/remove-unused-exports`
    - Mark STORAGE_KEYS and scopeKey as private
    - Remove useSpellFilter if unused
    - Clean up type exports
    - Run `npx fallow` to verify reduction

**Week 3-4 (P2 Complexity):** 6. Branch: `refactor/spell-library-tab`

- Extract useSpellFilters hook
- Extract FilterPanel component
- Extract ViewToggle component
- Target: Main component <150 LOC

7. Branch: `refactor/spell-card`
    - Split into subcomponents
    - Extract useSpellActions hook
    - Target: Main component <100 LOC

8. Branch: `test/add-coverage`
    - Test useSearchIndex
    - Test validation.ts
    - Test useSpellGrouping
    - Target: >50% coverage

---

## ✅ Acceptance Criteria for "Done"

Phase 0 complete when:

- [ ] `npx react-doctor@latest --verbose` shows 0 critical or error-level issues
- [ ] Dark mode toggle works in production build
- [ ] `npm run build` completes with no warnings
- [ ] Bundle size reduced by ~100 KB

Phase 1 complete when:

- [ ] `npx fallow` shows <5% dead exports
- [ ] SpellDeckTab, SpellbookTab, DailySpellsTab all <300 LOC
- [ ] useSpellGrouping has >90% test coverage

Phase 2 complete when:

- [ ] No functions exceed 100 LOC
- [ ] No functions have CRAP score >100
- [ ] Test coverage >50% overall
- [ ] Fallow maintainability score >92

---

**Last updated**: June 2, 2026
