/**
 * Hooks index
 * Exports all custom hooks for the spell interface
 */

// Spell data hooks
export { useAllSpells } from './useAllSpells.js'
export { useDailySpells } from './useDailySpells.js'

// Search hooks (Fuse.js powered)
export { useSpellSearchIndex, useSpellSearch } from './useSearchIndex.js'
