import type { Spell, SessionSpell } from '../types'

export { validateSpellObject, validateSessionSpell, getValidSpells } from './validation.ts'

export {
	getLevelLabel,
	groupSpellsByLevel,
	getOrderedSpellGroups,
	getSpellsForLevel,
	countSpellsByLevel,
	generateSessionId,
	addSessionId,
	removeSessionId
} from './spellGrouping.ts'

export { mergeAdditionalSpells } from './additionalSpells.ts'

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
} from './localStorage.ts'
