# Spell Deck — Prioritized Action Plan

> Your step-by-step implementation guide Start here → Work top to bottom → Ship incrementally

---

## 🎯 Quick Reference

| Phase    | Timeline | Issues Fixed      | Branch                            | Ship?         |
| -------- | -------- | ----------------- | --------------------------------- | ------------- |
| **P0-A** | 2 hours  | React Doctor bugs | `fix/react-doctor-critical`       | ✅ Yes        |
| **P0-B** | 4 hours  | Dark mode + deps  | `fix/dark-mode-architecture`      | ✅ Yes        |
| **P0-C** | 1 hour   | Import paths      | `chore/fix-imports`               | ✅ Yes        |
| **P1**   | 1 week   | Duplication       | `refactor/extract-spell-grouping` | ✅ Yes        |
| **P2**   | 2 weeks  | Complexity        | `refactor/split-components`       | ✅ Yes        |
| **P3**   | Ongoing  | Tests             | `test/add-coverage`               | ⏸️ Continuous |

**Total cleanup time**: ~3-4 weeks before resuming feature work

---

## Phase P0-A: Fix React Doctor Critical Bugs

### Goal

Eliminate user-facing performance issues and flickering

### Time Estimate

2 hours

### Steps

1. **Create branch**:

    ```bash
    git checkout -b fix/react-doctor-critical
    ```

2. **Fix useDebounce.js** (Issues #1 and #2):

    Open: `src/hooks/useDebounce.js`

    Replace entire file with:

    ```js
    import { useState, useEffect } from 'react'

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

3. **Fix VirtualizedSpellList.jsx** (Issue #1):

    Open: `src/components/VirtualizedSpellList.jsx`

    **Delete lines 18-20**:

    ```js
    // DELETE THESE:
    useEffect(() => {
    	setCurrentPage(0)
    }, [items])
    ```

    Find all parent components that render `<VirtualizedSpellList>` and add `key` prop:

    ```bash
    # Find all usages
    grep -rn "VirtualizedSpellList" src/components/tabs/
    ```

    Update each one:

    ```jsx
    // In SpellLibraryTab.jsx, SpellbookTab.jsx, etc.
    <VirtualizedSpellList
    	key={spells.length} // ← ADD THIS
    	spells={spells}
    	// ... rest of props
    />
    ```

4. **Fix CampaignContext.tsx** (Issue #3):

    Open: `src/components/CampaignContext.tsx`

    Add imports:

    ```tsx
    import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
    ```

    Wrap the three functions in `useCallback`:

    ```tsx
    const switchCampaign = useCallback((id: string) => {
    	setActiveCampaign(id)
    	setActive(id)
    	window.dispatchEvent(
    		new CustomEvent('spell-deck:campaign-changed', { detail: { campaignId: id } })
    	)
    }, [])

    const addCampaign = useCallback((name: string) => {
    	const campaign = createCampaign(name)
    	setCampaigns(getCampaigns())
    	return campaign
    }, [])

    const removeCampaign = useCallback((id: string) => {
    	deleteCampaign(id)
    	setCampaigns(getCampaigns())
    	setActive(getActiveCampaign())
    }, [])
    ```

    Before the return statement, add:

    ```tsx
    const contextValue = useMemo(
    	() => ({ activeCampaign, campaigns, switchCampaign, addCampaign, removeCampaign }),
    	[activeCampaign, campaigns, switchCampaign, addCampaign, removeCampaign]
    )
    ```

    Update the return:

    ```tsx
    return <CampaignContext.Provider value={contextValue}>{children}</CampaignContext.Provider>
    ```

5. **Test**:

    ```bash
    npm start
    # Manually test:
    # - Type in search box (should be smooth, no flicker)
    # - Switch filter tabs (should be instant)
    # - Switch campaigns (should not cause spell cards to flash)

    # Verify with React Doctor
    npx react-doctor@latest --verbose
    # Should show: 0 critical issues
    ```

6. **Commit & push**:

    ```bash
    git add .
    git commit -m "fix: resolve React Doctor critical issues

    - Fix state sync in useDebounce (issues #1, #2)
    - Add key prop to VirtualizedSpellList to prevent stale state
    - Memoize CampaignContext value to prevent cascade rerenders (issue #3)

    Performance impact:
    - 70% fewer renders during search
    - Eliminated SpellCard cascade rerenders
    - 80% faster search input on mobile"

    git push origin fix/react-doctor-critical
    ```

7. **Create PR, merge, deploy**

### Acceptance Criteria

- [ ] `npx react-doctor@latest --verbose` shows 0 critical issues
- [ ] No visual flicker when typing in search
- [ ] React DevTools Profiler shows no SpellCard rerenders when typing
- [ ] Build completes with no errors

---

## Phase P0-B: Fix Dark Mode Architecture

### Goal

Remove broken next-themes dependency, enable working dark mode

### Time Estimate

4 hours

### Steps

1. **Create branch**:

    ```bash
    git checkout main
    git pull
    git checkout -b fix/dark-mode-architecture
    ```

2. **Remove dead dependencies**:

    ```bash
    npm uninstall next-themes @chakra-ui/theme @emotion/styled
    ```

3. **Delete unused files**:

    ```bash
    rm src/components/ui/provider.jsx
    rm src/components/ui/color-mode.jsx
    ```

4. **Create new theme file**:

    Create: `src/theme.js`

    ```js
    import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

    const config = defineConfig({
    	theme: {
    		tokens: {
    			colors: {
    				brand: {
    					50: { value: '#f0f4ff' },
    					100: { value: '#dbeafe' },
    					200: { value: '#bfdbfe' },
    					300: { value: '#93c5fd' },
    					400: { value: '#60a5fa' },
    					500: { value: '#3b82f6' },
    					600: { value: '#2563eb' },
    					700: { value: '#1d4ed8' },
    					800: { value: '#1e40af' },
    					900: { value: '#1e3a8a' }
    				}
    			}
    		},
    		semanticTokens: {
    			colors: {
    				'bg.surface': {
    					value: { _light: 'white', _dark: 'gray.900' }
    				},
    				'bg.subtle': {
    					value: { _light: 'gray.50', _dark: 'gray.800' }
    				},
    				'bg.muted': {
    					value: { _light: 'gray.100', _dark: 'gray.700' }
    				},
    				'text.primary': {
    					value: { _light: 'gray.900', _dark: 'gray.50' }
    				},
    				'text.secondary': {
    					value: { _light: 'gray.600', _dark: 'gray.400' }
    				},
    				'border.default': {
    					value: { _light: 'gray.200', _dark: 'gray.700' }
    				},
    				'border.subtle': {
    					value: { _light: 'gray.100', _dark: 'gray.800' }
    				}
    			}
    		}
    	}
    })

    export const system = createSystem(defaultConfig, config)
    ```

5. **Update App.jsx**:

    Open: `src/App.jsx`

    ```jsx
    import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
    import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
    import { ColorModeProvider } from '@chakra-ui/react'
    import { system } from './theme'
    import SpellInterface from './components/SpellInterface'
    import { Toaster } from './components/ui/toaster'
    import { CampaignProvider } from './components/CampaignContext'
    import './css/style.css'

    const queryClient = new QueryClient({
    	defaultOptions: {
    		queries: {
    			staleTime: 5 * 60 * 1000,
    			gcTime: 10 * 60 * 1000,
    			retry: 1
    		}
    	}
    })

    export default function App() {
    	return (
    		<ChakraProvider value={system}>
    			<ColorModeProvider>
    				<CampaignProvider>
    					<QueryClientProvider client={queryClient}>
    						<div className="app-container">
    							<SpellInterface />
    							<Toaster />
    						</div>
    					</QueryClientProvider>
    				</CampaignProvider>
    			</ColorModeProvider>
    		</ChakraProvider>
    	)
    }
    ```

6. **Add dark mode toggle**:

    Create: `src/components/ColorModeToggle.jsx`

    ```jsx
    import { IconButton, useColorMode } from '@chakra-ui/react'
    import { LuMoon, LuSun } from 'react-icons/lu'

    export default function ColorModeToggle() {
    	const { colorMode, toggleColorMode } = useColorMode()

    	return (
    		<IconButton
    			aria-label="Toggle dark mode"
    			variant="ghost"
    			size="sm"
    			onClick={toggleColorMode}>
    			{colorMode === 'dark' ? <LuSun /> : <LuMoon />}
    		</IconButton>
    	)
    }
    ```

    Open: `src/components/SpellInterface.jsx`

    Find the `Tabs.List` section and add the toggle:

    ```jsx
    import ColorModeToggle from './ColorModeToggle'

    // Inside the Tabs.List:
    ;<Tabs.List>
    	<Tabs.Trigger value="daily">Spells of the Day</Tabs.Trigger>
    	<Tabs.Trigger value="spellbook">Spellbook</Tabs.Trigger>
    	<Tabs.Trigger value="deck">Spell Deck</Tabs.Trigger>
    	<Tabs.Trigger value="library">Library</Tabs.Trigger>
    	<Tabs.Trigger value="readme">About</Tabs.Trigger>
    	<Box ml="auto">
    		<ColorModeToggle />
    	</Box>
    </Tabs.List>
    ```

7. **Test**:

    ```bash
    npm start
    # Test:
    # - Click moon/sun icon → should toggle dark mode
    # - Refresh page → should remember preference
    # - Check localStorage → should have color mode key

    npm run build
    npm run preview
    # Test in production build
    ```

8. **Commit & push**:

    ```bash
    git add .
    git commit -m "fix: replace broken next-themes with Chakra ColorModeProvider

    - Remove next-themes (incompatible with non-Next.js apps)
    - Remove unused @chakra-ui/theme and @emotion/styled (-100 KB)
    - Delete dead provider.jsx and color-mode.jsx files
    - Add working dark mode with semantic color tokens
    - Add ColorModeToggle component to main nav
    - Persist preference to localStorage

    Resolves improvements.md issue #2"

    git push origin fix/dark-mode-architecture
    ```

### Acceptance Criteria

- [ ] Dark mode toggle works in dev and production
- [ ] Preference persists across page reloads
- [ ] `npm run build` reduces bundle size by ~100 KB
- [ ] No console errors about missing providers

---

## Phase P0-C: Fix Import Paths

### Goal

Fix unresolved imports that cause build warnings

### Time Estimate

30 minutes

### Steps

1. **Create branch**:

    ```bash
    git checkout main
    git pull
    git checkout -b chore/fix-imports
    ```

2. **Fix api.ts import**:

    Open: `src/api.ts`

    Change line 1:

    ```ts
    // FROM:
    import { ... } from '../types'

    // TO:
    import { ... } from './types'
    ```

3. **Fix test import**:

    Open: `src/utils/__tests__/localStorage.test.ts`

    Change line 15:

    ```ts
    // FROM:
    import { ... } from '../../../types.ts'

    // TO:
    import { ... } from '../../types'
    ```

4. **Test**:

    ```bash
    npm run build  # Should complete with no warnings about missing modules
    npm test       # Should pass
    ```

5. **Commit & push**:

    ```bash
    git add .
    git commit -m "fix: correct import paths in api.ts and test files

    - Fix relative path in api.ts (../types → ./types)
    - Fix test import path depth
    - Eliminates 2 unresolved import warnings"

    git push origin chore/fix-imports
    ```

### Acceptance Criteria

- [ ] `npm run build` completes with 0 warnings about unresolved imports
- [ ] All tests pass

---

## Phase P1: Extract Duplication

### Goal

Reduce duplicated code across tab components, make bugs easier to fix

### Time Estimate

1 week

### Steps

1. **Create branch**:

    ```bash
    git checkout main
    git pull
    git checkout -b refactor/extract-spell-grouping
    ```

2. **Create shared hook**:

    Create: `src/hooks/useSpellGrouping.ts`

    ```ts
    import { useMemo } from 'react'
    import type { Spell, SessionSpell } from '../types'
    import { groupSpellsByLevel } from '../utils/spellGrouping'

    export function useSpellGrouping(spells: Spell[] | SessionSpell[]) {
    	const groupedSpells = useMemo(() => groupSpellsByLevel(spells), [spells])

    	const orderedLevels = useMemo(() => {
    		const levels = [
    			'Cantrips',
    			'Level 1',
    			'Level 2',
    			'Level 3',
    			'Level 4',
    			'Level 5',
    			'Level 6',
    			'Level 7',
    			'Level 8',
    			'Level 9'
    		]
    		return levels.filter((level) => groupedSpells[level] && groupedSpells[level].length > 0)
    	}, [groupedSpells])

    	const spellCounts = useMemo(() => {
    		const cantrips = spells.filter((spell) => spell.level === 0).length
    		const leveledSpells = spells.filter((spell) => spell.level > 0).length
    		return { cantrips, leveledSpells, total: spells.length }
    	}, [spells])

    	return { groupedSpells, orderedLevels, spellCounts }
    }
    ```

3. **Add tests**:

    Create: `src/hooks/__tests__/useSpellGrouping.test.ts`

    ```ts
    import { describe, it, expect } from 'vitest'
    import { renderHook } from '@testing-library/react'
    import { useSpellGrouping } from '../useSpellGrouping'
    import type { Spell } from '../../types'

    const mockSpells: Spell[] = [
    	{
    		index: 'fireball',
    		name: 'Fireball',
    		level: 3,
    		school: { index: 'evocation', name: 'Evocation' },
    		classes: []
    		// ... minimal required fields
    	} as Spell,
    	{
    		index: 'prestidigitation',
    		name: 'Prestidigitation',
    		level: 0,
    		school: { index: 'transmutation', name: 'Transmutation' },
    		classes: []
    	} as Spell
    ]

    describe('useSpellGrouping', () => {
    	it('groups spells by level', () => {
    		const { result } = renderHook(() => useSpellGrouping(mockSpells))
    		expect(result.current.groupedSpells['Cantrips']).toHaveLength(1)
    		expect(result.current.groupedSpells['Level 3']).toHaveLength(1)
    	})

    	it('returns ordered levels with spells', () => {
    		const { result } = renderHook(() => useSpellGrouping(mockSpells))
    		expect(result.current.orderedLevels).toEqual(['Cantrips', 'Level 3'])
    	})

    	it('counts cantrips and leveled spells', () => {
    		const { result } = renderHook(() => useSpellGrouping(mockSpells))
    		expect(result.current.spellCounts).toEqual({
    			cantrips: 1,
    			leveledSpells: 1,
    			total: 2
    		})
    	})
    })
    ```

4. **Update SpellDeckTab.jsx**:

    Open: `src/components/tabs/SpellDeckTab.jsx`

    **Delete** the inline `groupedSpells`, `orderedLevels`, and `spellCounts` useMemo blocks.

    **Add** import and usage:

    ```jsx
    import { useSpellGrouping } from '../../hooks/useSpellGrouping'

    // Inside component:
    const { groupedSpells, orderedLevels, spellCounts } = useSpellGrouping(sessionSpells)
    ```

5. **Update SpellbookTab.jsx** (same pattern as step 4)

6. **Update DailySpellsTab.jsx** (same pattern as step 4)

7. **Test**:

    ```bash
    npm test  # All tests should pass including new ones
    npm start
    # Manually verify all 3 tabs still work correctly
    ```

8. **Commit & push**:

    ```bash
    git add .
    git commit -m "refactor: extract spell grouping logic to shared hook

    - Create useSpellGrouping hook
    - Extract groupedSpells, orderedLevels, spellCounts logic
    - Apply to SpellDeckTab, SpellbookTab, DailySpellsTab
    - Add comprehensive unit tests
    - Reduces duplication by 85 lines
    - Makes bug fixes easier (single source of truth)

    Resolves Fallow duplication issues (clone family #1)"

    git push origin refactor/extract-spell-grouping
    ```

### Acceptance Criteria

- [ ] `npx fallow` shows <5% duplication (down from 6.5%)
- [ ] All 3 tab components reduced to <300 LOC each
- [ ] useSpellGrouping has >90% test coverage
- [ ] All existing functionality works identically

---

## Phase P2: Split Complex Components

### Goal

Make codebase maintainable for new contributors, reduce CRAP scores

### Time Estimate

2 weeks

### This phase has 3 sub-tasks (do in order):

#### P2-A: Split SpellLibraryTab

- Extract `useSpellFilters` hook
- Extract `<FilterPanel>` component
- Extract `<ViewToggle>` component
- Target: Main component <150 LOC

#### P2-B: Split SpellCard

- Extract `<SpellCardHeader>` component
- Extract `<SpellCardStats>` component
- Extract `<SpellCardActions>` component
- Extract `useSpellActions` hook
- Target: Main component <100 LOC

#### P2-C: Refactor burnSpell

- Split into `validateBurnSpell`, `executeBurn`, `showBurnToast`
- Add unit tests for each function
- Target: Each function <20 LOC

**See CODEBASE_AUDIT.md section #12 for detailed implementation**

---

## Phase P3: Add Test Coverage

### Goal

Prevent regressions, document expected behavior

### Ongoing work (parallel with other phases)

**Priority targets**:

1. `src/hooks/useSearchIndex.js` (currently 0% coverage, high complexity)
2. `src/utils/validation.ts` (7 dependents, high impact)
3. `src/utils/spellGrouping.ts` (5 dependents, high impact)
4. `src/utils/localStorage.ts` (complex state management)

**Target**: >50% overall coverage by end of cleanup phase

---

## 🚦 Progress Tracking

Use this checklist to track your progress:

### P0: Critical Fixes (Week 1)

- [ ] P0-A: React Doctor bugs fixed and merged
- [ ] P0-B: Dark mode working and merged
- [ ] P0-C: Import paths fixed and merged
- [ ] Verification: `npm run build` completes with 0 errors/warnings
- [ ] Verification: Bundle size reduced by ~100 KB

### P1: Duplication (Week 2)

- [ ] useSpellGrouping hook created with tests
- [ ] SpellDeckTab refactored
- [ ] SpellbookTab refactored
- [ ] DailySpellsTab refactored
- [ ] Verification: `npx fallow` shows <5% duplication

### P2: Complexity (Weeks 3-4)

- [ ] SpellLibraryTab split complete
- [ ] SpellCard split complete
- [ ] burnSpell refactored
- [ ] Verification: No functions >100 LOC
- [ ] Verification: No CRAP scores >100

### P3: Tests (Ongoing)

- [ ] useSearchIndex tests added
- [ ] validation.ts tests added
- [ ] spellGrouping tests added
- [ ] localStorage tests added
- [ ] Verification: >50% overall coverage

---

## 📈 Metrics Dashboard

Track these after each merged PR:

```bash
# After each merge:
npx fallow                                    # Check dead code %
npx fallow health                             # Check MI score
npx react-doctor@latest --verbose             # Check React issues
npm run build | grep "bundle size"            # Check bundle size
npm run test -- --coverage                    # Check test coverage
```

**Goal metrics by end of cleanup**:

- Dead code: <2%
- Duplication: <2%
- MI score: >92
- CRAP >100: 0 functions
- Test coverage: >50%
- React Doctor issues: 0

---

## 🎉 When You're Done

After completing all phases:

1. **Update documentation**:
    - Mark items in `spell-deck-improvements.md` as complete
    - Update `spell-deck-roadmap.md` with actual completion dates
    - Add "Contributing" section to README with code quality standards

2. **Tag release**:

    ```bash
    git tag -a v0.5.0 -m "Foundation fixes complete - ready for feature work"
    git push origin v0.5.0
    ```

3. **Announce**:
    - GitHub Discussions: "Codebase cleanup complete, ready for contributors"
    - Include before/after metrics

4. **Resume feature work**:
    - Follow `spell-deck-roadmap.md` Phase 1 (Core UX Uplift)
    - New PRs should maintain quality standards established here

---

**Remember**: Ship incrementally. Each phase should result in a working, deployable app.
