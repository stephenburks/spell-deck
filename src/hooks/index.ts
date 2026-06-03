/**
 * Hooks index
 * Exports all custom hooks for the spell interface
 */

// Spell data hooks
export { useAllSpells } from './useAllSpells'
export { useDailySpells } from './useDailySpells'

// Search hooks (Fuse.js powered)
export { useSpellSearchIndex, useSpellSearch } from './useSearchIndex'

// Utility hooks
export { useDebounce } from './useDebounce'
