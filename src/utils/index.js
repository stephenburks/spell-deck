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
	initializeLocalStorage
} from './localStorage.js'

// Validation utilities
export {
	validateSpellObject,
	validateSpellArray,
	validateSessionSpell,
	validateSessionSpellArray,
	validateSpellbookData,
	validateSessionDeckData,
	validateDailySpellsData,
	sanitizeSpellObject,
	sanitizeSpellArray
} from './validation.js'

// Spell grouping utilities
export {
	getLevelOrder,
	getLevelLabel,
	isCantrip,
	isLeveledSpell,
	groupSpellsByLevel,
	getOrderedSpellGroups,
	getSpellsForLevel,
	getCantrips,
	getLeveledSpells,
	countSpellsByLevel,
	getTotalSpellCount,
	generateSessionId,
	addSessionId,
	removeSessionId
} from './spellGrouping.js'
