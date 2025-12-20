/**
 * Utility functions index
 * Exports all utility functions for the spell interface
 */

// LocalStorage utilities
export {
	STORAGE_KEYS,
	safeLoadFromStorage,
	safeSaveToStorage,
	loadSpellbook,
	saveSpellbook,
	loadSessionDeck,
	saveSessionDeck,
	loadDailySpells,
	saveDailySpells,
	clearAllSpellData,
	addSpellToSpellbook,
	removeSpellFromSpellbook,
	addSpellToSessionDeck,
	removeSpellFromSessionDeck,
	initializeLocalStorage
} from './localStorage.js'

// Validation utilities
export { validateSpellObject, validateSessionSpell, getValidSpells } from './validation.js'

// Spell grouping utilities
export {
	getLevelLabel,
	groupSpellsByLevel,
	getOrderedSpellGroups,
	getSpellsForLevel,
	countSpellsByLevel,
	generateSessionId,
	addSessionId,
	removeSessionId
} from './spellGrouping.js'

// API utilities
export { getAllSpellIndexes, getSpellsByIndexes } from '../api.js'
