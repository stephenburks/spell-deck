# DeepSeek Review Prompt — Audit Validation & Enhancement

> Use this prompt with your DeepSeek model to validate and improve the audit recommendations

---

## Your Task

You are a senior principal engineer conducting a peer review of a codebase audit and implementation
plan. Your goal is to validate the recommendations, identify gaps, challenge assumptions, and
suggest improvements before implementation begins.

## Context

A comprehensive audit was performed on the **spell-deck** project (a D&D 5e spell reference PWA
built with React 18, Vite, Chakra UI v3, TypeScript/JavaScript mix). The audit combined:

1. **Fallow static analysis** — identified dead code, duplication, and complexity
2. **React Doctor analysis** — found 3 critical React pattern violations
3. **Manual code review** — against existing technical documentation

Four audit documents were produced:

- `AUDIT_SUMMARY.md` — Executive summary
- `CODEBASE_AUDIT.md` — Comprehensive analysis (~500 lines)
- `REACT_DOCTOR_FIXES.md` — Detailed React bug explanations
- `ACTION_PLAN.md` — Step-by-step implementation guide

## Your Review Scope

### 1. Validate React Doctor Fixes

Review the 3 critical React issues and proposed fixes in `REACT_DOCTOR_FIXES.md`:

**Issue #1**: State synced to prop inside effect (`useDebounce.js`, `VirtualizedSpellList.jsx`)

- **Challenge**: Is the proposed fix the canonical solution?
- **Check**: Are there edge cases not covered?
- **Verify**: Does the `key` prop solution for VirtualizedSpellList have performance implications?

**Issue #2**: Multiple setState calls in one effect (`useDebounce.js`)

- **Challenge**: Does React 18 automatic batching actually solve this?
- **Check**: Should we use `flushSync` or `unstable_batchedUpdates` anywhere?

**Issue #3**: Unstable context provider value (`CampaignContext.tsx`)

- **Challenge**: Are `useCallback` dependencies correct?
- **Check**: Could we use reducer pattern instead for better performance?
- **Verify**: Does wrapping all functions in `useCallback` create memory pressure?

**Questions to answer**:

1. Are there alternative solutions that are simpler or more performant?
2. Do the fixes introduce new problems?
3. Are there React 18/19 features we should leverage instead?
4. Should we add React DevTools profiling data collection before/after?

---

### 2. Evaluate Dead Code Removal Strategy

Review Section #5-9 in `CODEBASE_AUDIT.md` (Dead Code Cleanup):

**Files marked for deletion**:

- `src/components/ui/provider.jsx` — marked "DELETE"
- `src/components/ui/color-mode.jsx` — marked "DELETE FILE after fixing #4"

**Files marked "KEEP"**:

- `public/sw.js` — kept for "Phase 4 PWA support"
- `src/hooks/index.js` — kept as "good pattern for future"
- `src/utils/index.ts` — kept as "good pattern for future"

**Unused exports marked "KEEP"**:

- `FULL_CASTER_SLOTS`, `HALF_CASTER_SLOTS`, `WARLOCK_SLOTS` — "needed for roadmap item 2.1"
- `loadNotes`, `saveNotes` — "roadmap item 2.4"

**Challenge these decisions**:

1. Is it wise to keep unused code for future features 3-4 months away?
2. What's the maintenance cost vs. benefit?
3. Should we use feature flags or branches instead?
4. Is the `sw.js` service worker actually usable or does it need a complete rewrite?

**Questions to answer**:

1. What's the real cost of removing and re-adding code later vs. keeping dead code?
2. Are the "roadmap" justifications valid or optimistic?
3. Should we have a "dead code quarantine" branch instead?

---

### 3. Assess Duplication Extraction Strategy

Review Section #10-11 in `CODEBASE_AUDIT.md` (Duplication):

**Proposed solution**: Extract `useSpellGrouping` hook from 3 tab components

**Clone groups identified**:

- 43 lines: `orderedLevels` computation
- 31 lines: `spellCounts` computation
- 26 lines: grouping logic

**Challenge**:

1. Is a custom hook the right abstraction? Could this be a utility function?
2. Does extracting 85 lines justify the added indirection?
3. Are there other duplication patterns not caught by Fallow?

**Review the proposed hook** in `ACTION_PLAN.md` Phase P1:

```ts
export function useSpellGrouping(spells: Spell[] | SessionSpell[]) {
  const groupedSpells = useMemo(() => groupSpellsByLevel(spells), [spells])
  const orderedLevels = useMemo(() => { ... }, [groupedSpells])
  const spellCounts = useMemo(() => { ... }, [spells])
  return { groupedSpells, orderedLevels, spellCounts }
}
```

**Questions to answer**:

1. Does this hook have the right API? Too much? Too little?
2. Should `orderedLevels` be configurable (different sorting, filtering)?
3. Is triple `useMemo` overkill for this use case?
4. Could we use `@tanstack/react-virtual` instead of custom virtualization?

---

### 4. Validate Complexity Reduction Targets

Review Section #12 in `CODEBASE_AUDIT.md` (Critical Complexity Functions):

**Targets**:

- `SpellLibraryTab`: 660 LOC, 27 cyclomatic, 756 CRAP → target <150 LOC
- `SpellCard`: 272 LOC, 16 cyclomatic, 272 CRAP → target <100 LOC
- `burnSpell`: 74 LOC, 12 cyclomatic, 156 CRAP → target 3 functions <20 LOC

**Proposed extraction for SpellLibraryTab**:

```
├── useSpellFilters hook (filter state + logic)
├── <FilterPanel> component (class/level/school toggles)
├── <ViewToggle> component (card/compact switch)
└── <SpellListContainer> component (renders list based on view)
```

**Challenge**:

1. Is this the right level of granularity?
2. Could we over-abstract and make it harder to follow?
3. Should we use composition (render props, children) instead?
4. Are there proven patterns from similar apps (D&D Beyond, dndbeyond-spell-lookup)?

**For SpellCard split**:

1. Will 4 sub-components actually improve readability or just spread logic?
2. Should actions be colocated or separated?
3. How do we prevent prop drilling?

**Questions to answer**:

1. Are the LOC targets arbitrary or data-driven?
2. Is there a better splitting strategy than what's proposed?
3. Should we refactor incrementally (extract one piece at a time) or all at once?
4. What's the testing strategy for extracted components?

---

### 5. Critique the Implementation Timeline

Review the timeline in `ACTION_PLAN.md`:

**Proposed schedule**:

- Week 1: P0 fixes (React bugs + dark mode)
- Week 2: P1 duplication removal
- Weeks 3-4: P2 complexity reduction
- Ongoing: P3 test coverage

**Total: 4 weeks before resuming feature work**

**Challenge**:

1. Is 4 weeks of cleanup justified before shipping new features?
2. Can we interleave cleanup with feature work?
3. What's the opportunity cost of delaying roadmap Phase 1?
4. Should we do "just enough" cleanup to unblock features?

**Alternative approach**:

- Week 1: P0 critical fixes only
- Week 2: Ship roadmap Phase 1 features (compact view, URL filters)
- Week 3-4: Cleanup as needed to support new features

**Questions to answer**:

1. What's the minimum viable cleanup to unblock feature development?
2. Can we ship P0 fixes and move on?
3. Should we do P2 (complexity) in smaller chunks alongside features?
4. What's the user-facing value of each cleanup phase?

---

### 6. Evaluate Missing Considerations

**Review for gaps**:

1. **Performance metrics**: No actual profiling data provided
    - Should we collect baseline metrics before implementing fixes?
    - Tools: Lighthouse, Web Vitals, React DevTools Profiler
    - Metrics: LCP, FID, CLS, bundle size, render time

2. **Migration risks**:
    - Dark mode switch could break user-facing UI
    - VirtualizedSpellList refactor could affect scroll position
    - Context refactor could break dependent components
    - What's the rollback strategy?

3. **User testing**:
    - No mention of A/B testing or canary deployments
    - Should we ship P0 fixes to 10% of users first?
    - How do we measure user impact?

4. **Type safety**:
    - Audit mentions TypeScript migration in P3 but doesn't prioritize it
    - Should we add types during refactoring to prevent regressions?

5. **Accessibility**:
    - No mention of WCAG compliance checks
    - Dark mode: check color contrast ratios
    - Keyboard navigation: verify after refactors

6. **Mobile-first**:
    - Audit focuses on desktop React DevTools
    - Should we test on actual mobile devices?
    - Do we have mobile-specific test devices/simulators?

**Questions to answer**:

1. What's missing from the audit that could cause problems?
2. Should we add a "validation" phase after each P0-P2 phase?
3. Do we need a staging environment or feature flags?

---

### 7. Deep Dive: Dark Mode Implementation

The audit proposes removing `next-themes` and using Chakra UI's `ColorModeProvider`. Review the
proposed implementation in `ACTION_PLAN.md` Phase P0-B.

**Specific concerns**:

1. **Theme file structure**: Is the semantic token approach correct?

    ```js
    'bg.surface': { value: { _light: 'white', _dark: 'gray.900' } }
    ```

    - Is this the Chakra v3 recommended pattern?
    - Should we use CSS variables instead?
    - How do we ensure color contrast meets WCAG AA?

2. **App.jsx provider order**:

    ```jsx
    <ChakraProvider>
      <ColorModeProvider>
        <CampaignProvider>
          <QueryClientProvider>
    ```

    - Is this the correct nesting order?
    - Does ColorModeProvider need to be inside ChakraProvider?

3. **ColorModeToggle component**:
    - Should it use `useColorMode` from Chakra or build a custom hook?
    - Where should it live in the component tree?
    - Should we add a tooltip explaining the feature?

4. **Persistence**:
    - The plan says "persist preference to localStorage"
    - Does Chakra handle this automatically?
    - Do we need a custom storage key?

**Questions to answer**:

1. Is the dark mode implementation production-ready or a quick fix?
2. Should we use a more robust color system (e.g., Radix Colors)?
3. Do we need to update CSS files to use semantic tokens?
4. What happens to inline `color="gray.600"` values?

---

### 8. Code Review: Proposed Fixes

**Review the exact code changes** in `ACTION_PLAN.md` and `REACT_DOCTOR_FIXES.md`:

#### useDebounce Fix:

```js
// Proposed
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

**Questions**:

1. Does `setIsDebouncing(true)` on every value change cause unnecessary renders?
2. Should we check if `value !== debouncedValue` before setting `isDebouncing`?
3. Is there a simpler implementation using `useDeferredValue` (React 18)?

#### CampaignContext Fix:

```tsx
// Proposed
const switchCampaign = useCallback((id: string) => {
  setActiveCampaign(id)
  setActive(id)
  window.dispatchEvent(...)
}, [])
```

**Questions**:

1. Is the empty dependency array correct? `setActiveCampaign` and `setActive` are stable?
2. Should we use a reducer instead of multiple `useState` calls?
3. Does the custom event dispatch need error handling?

---

## Your Deliverables

Please provide:

### 1. **Validation Report** (approve or challenge each fix)

For each issue in sections 1-8:

- ✅ Approved as-is
- ⚠️ Approved with modifications (specify)
- ❌ Rejected (provide alternative)

### 2. **Risk Assessment**

Rate each phase on risk (Low/Medium/High):

- P0-A: React Doctor fixes
- P0-B: Dark mode implementation
- P0-C: Import path fixes
- P1: Duplication extraction
- P2: Complexity reduction

### 3. **Missing Issues**

Identify anything the original audit missed:

- Security concerns
- Performance regressions
- Breaking changes
- Deployment risks

### 4. **Alternative Approaches**

For any rejected recommendations, provide:

- Why the original approach is suboptimal
- A better solution with justification
- Trade-offs and migration path

### 5. **Priority Re-ordering** (if needed)

Should the implementation order change? For example:

- Should we do type safety (TS migration) before complexity reduction?
- Should we ship features before cleanup?
- Can we skip any phases entirely?

### 6. **Enhanced Timeline**

Revise the 4-week timeline if needed:

- Include validation/testing time
- Add rollback checkpoints
- Suggest incremental shipping strategy

### 7. **Additional Recommendations**

What should be added to the plan:

- Performance benchmarking steps
- User testing strategy
- Rollback procedures
- Documentation updates

---

## Review Guidelines

**Be critical**:

- Question assumptions
- Challenge "obvious" fixes
- Look for hidden complexity
- Consider edge cases

**Be constructive**:

- If you reject something, propose an alternative
- Explain trade-offs clearly
- Reference React/Chakra docs where relevant

**Be practical**:

- Consider the solo developer context
- Balance perfection vs. shipping
- Weigh technical debt vs. feature velocity

**Be thorough**:

- Review code snippets line by line
- Check for TypeScript errors
- Verify React 18 best practices
- Consider mobile/accessibility

---

## Specific Questions to Answer

1. **Is the useDebounce fix correct?** Should we use `useDeferredValue` instead?
2. **Is extracting useSpellGrouping worth it?** 85 lines seems borderline.
3. **Is 4 weeks too long for cleanup?** Can we ship features sooner?
4. **Should we add TypeScript gradually** during refactoring or wait?
5. **Is the dark mode implementation complete** or will it need rework later?
6. **Are there Chakra UI v3 patterns** we're missing?
7. **Should we use React 19** features if upgrading is easy?
8. **What's the biggest risk** not addressed in the audit?

---

## Files to Review

Read these files from the spell-deck repository:

1. `AUDIT_SUMMARY.md` — Overview
2. `CODEBASE_AUDIT.md` — Full audit (focus on P0-P2 sections)
3. `REACT_DOCTOR_FIXES.md` — React bug details
4. `ACTION_PLAN.md` — Implementation steps
5. `ROADMAP.md` — Feature roadmap

Then review the actual source code for:

- `src/hooks/useDebounce.js`
- `src/components/VirtualizedSpellList.jsx`
- `src/components/CampaignContext.tsx`
- `src/components/tabs/SpellDeckTab.jsx`
- `src/components/tabs/SpellbookTab.jsx`

---

## Output Format

Structure your review as:

```markdown
# Audit Review — [Your Name/Model]

## Executive Summary

[2-3 paragraphs: overall assessment, biggest concerns, go/no-go recommendation]

## Section-by-Section Review

### 1. React Doctor Fixes

[Detailed review with approve/modify/reject for each issue]

### 2. Dead Code Strategy

[Review with recommendations]

### 3. Duplication Extraction

[Review with code analysis]

### 4. Complexity Reduction

[Review with alternative approaches]

### 5. Timeline & Prioritization

[Critique with revised schedule if needed]

### 6. Missing Considerations

[New issues found, gaps identified]

### 7. Dark Mode Implementation

[Detailed code review]

### 8. Code-Level Review

[Line-by-line feedback on proposed changes]

## Risk Assessment Matrix

[Table with risk ratings]

## Alternative Recommendations

[Better approaches for rejected items]

## Final Verdict

- Overall confidence: High/Medium/Low
- Recommended next steps: [prioritized list]
- Must-fix-before-proceeding: [blockers]
```

---

## Success Criteria

Your review is successful if it:

1. ✅ Validates or invalidates each proposed fix with reasoning
2. ✅ Identifies at least 2-3 gaps or risks not covered
3. ✅ Provides actionable alternatives for any rejected recommendations
4. ✅ Gives a clear go/no-go recommendation
5. ✅ Improves the implementation plan's chances of success

---

**Ready?** Start your review by reading `AUDIT_SUMMARY.md` first, then dive into the detailed
documents. Focus on correctness, completeness, and practicality.
