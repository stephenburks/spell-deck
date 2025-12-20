/**
 * LocalStorage management utilities for the spell interface
 * Handles three data stores: spellbook, session-deck, daily-spells
 */

import { addSessionId } from './spellGrouping.js'

// Storage keys
export const STORAGE_KEYS = {
	SPELLBOOK: 'user-spellbook',
	SESSION_DECK: 'session-deck',
	DAILY_SPELLS: 'daily-spells'
}

/**
 * Safely load data from localStorage with error handling
 * @param {string} key - The localStorage key
 * @param {*} defaultValue - Default value if loading fails
 * @returns {*} Parsed data or default value
 */
export const safeLoadFromStorage = (key, defaultValue) => {
	try {
		const stored = localStorage.getItem(key)
		return stored ? JSON.parse(stored) : defaultValue
	} catch (error) {
		console.warn(`Failed to load ${key} from localStorage:`, error)
		return defaultValue
	}
}

/**
 * Safely save data to localStorage with error handling
 * @param {string} key - The localStorage key
 * @param {*} data - Data to save
 * @returns {boolean} Success status
 */
export const safeSaveToStorage = (key, data) => {
	try {
		localStorage.setItem(key, JSON.stringify(data))
		return true
	} catch (error) {
		console.error(`Failed to save ${key} to localStorage:`, error)
		return false
	}
}

/**
 * Load spellbook data from localStorage
 * @returns {Object} Spellbook data with spells array and metadata
 */
export const loadSpellbook = () => {
	return safeLoadFromStorage(STORAGE_KEYS.SPELLBOOK, {
		spells: [],
		lastModified: new Date().toISOString()
	})
}

/**
 * Save spellbook data to localStorage
 * @param {Array} spells - Array of spell objects
 * @returns {boolean} Success status
 */
export const saveSpellbook = (spells) => {
	const data = {
		spells,
		lastModified: new Date().toISOString()
	}
	const success = safeSaveToStorage(STORAGE_KEYS.SPELLBOOK, data)
	return success
}

/**
 * Load session deck data from localStorage
 * @returns {Object} Session deck data with spells array and metadata
 */
export const loadSessionDeck = () => {
	return safeLoadFromStorage(STORAGE_KEYS.SESSION_DECK, {
		spells: [],
		lastModified: new Date().toISOString()
	})
}

/**
 * Save session deck data to localStorage
 * @param {Array} spells - Array of spell objects with sessionId
 * @returns {boolean} Success status
 */
export const saveSessionDeck = (spells) => {
	const data = {
		spells,
		lastModified: new Date().toISOString()
	}
	const success = safeSaveToStorage(STORAGE_KEYS.SESSION_DECK, data)
	return success
}

/**
 * Load daily spells data from localStorage
 * @returns {Object} Daily spells data with spells array, generation date, and metadata
 */
export const loadDailySpells = () => {
	return safeLoadFromStorage(STORAGE_KEYS.DAILY_SPELLS, {
		spells: [],
		generatedDate: null,
		lastModified: new Date().toISOString()
	})
}

/**
 * Save daily spells data to localStorage
 * @param {Array} spells - Array of 12 spell objects
 * @param {string} generatedDate - Date string in YYYY-MM-DD format
 * @returns {boolean} Success status
 */
export const saveDailySpells = (spells, generatedDate) => {
	const data = {
		spells,
		generatedDate,
		lastModified: new Date().toISOString()
	}
	return safeSaveToStorage(STORAGE_KEYS.DAILY_SPELLS, data)
}

/**
 * Add spell to session deck with sessionId
 * @param {Object} spell - Spell object to add
 * @returns {Object} Result object with success status and message
 */
export const addSpellToSessionDeck = (spell) => {
	console.log('addSpellToSessionDeck: Starting with spell:', spell.name)

	try {
		console.log('addSpellToSessionDeck: Loading session deck data')
		const sessionDeckData = loadSessionDeck()
		const currentSpells = sessionDeckData.spells || []
		console.log('addSpellToSessionDeck: Current session has', currentSpells.length, 'spells')

		// Add sessionId to the spell
		console.log('addSpellToSessionDeck: Adding sessionId to spell')
		const sessionSpell = addSessionId(spell)
		if (!sessionSpell) {
			console.error('addSpellToSessionDeck: Failed to add sessionId')
			return {
				success: false,
				message: 'Failed to prepare spell for session.'
			}
		}
		console.log('addSpellToSessionDeck: SessionId added:', sessionSpell.sessionId)

		// Add to session deck
		const updatedSpells = [...currentSpells, sessionSpell]
		console.log('addSpellToSessionDeck: Saving', updatedSpells.length, 'spells to session deck')
		const success = saveSessionDeck(updatedSpells)

		if (success) {
			console.log('addSpellToSessionDeck: Successfully saved to localStorage')
			return {
				success: true,
				message: `"${spell.name}" added to session.`,
				spells: updatedSpells,
				sessionSpell
			}
		} else {
			console.error('addSpellToSessionDeck: Failed to save to localStorage')
			return {
				success: false,
				message: 'Failed to add spell to session.'
			}
		}
	} catch (error) {
		console.error('addSpellToSessionDeck: Exception occurred:', error)
		return {
			success: false,
			message: 'Failed to add spell to session.'
		}
	}
}

/**
 * Remove spell from session deck by sessionId
 * @param {string} sessionId - Session ID of spell to remove
 * @returns {Object} Result object with success status and message
 */
export const removeSpellFromSessionDeck = (sessionId) => {
	try {
		const sessionDeckData = loadSessionDeck()
		const currentSpells = sessionDeckData.spells || []

		// Find the spell being removed
		const spellToRemove = currentSpells.find((spell) => spell.sessionId === sessionId)

		// Filter out the spell
		const updatedSpells = currentSpells.filter((spell) => spell.sessionId !== sessionId)
		const success = saveSessionDeck(updatedSpells)

		if (success) {
			return {
				success: true,
				message: 'Spell removed from session.',
				spells: updatedSpells
			}
		} else {
			return {
				success: false,
				message: 'Failed to remove spell from session.'
			}
		}
	} catch (error) {
		console.error('Failed to remove spell from session:', error)
		return {
			success: false,
			message: 'Failed to remove spell from session.'
		}
	}
}

/**
 * Clear all spell-related localStorage data
 * @returns {boolean} Success status
 */
export const clearAllSpellData = () => {
	try {
		localStorage.removeItem(STORAGE_KEYS.SPELLBOOK)
		localStorage.removeItem(STORAGE_KEYS.SESSION_DECK)
		localStorage.removeItem(STORAGE_KEYS.DAILY_SPELLS)
		return true
	} catch (error) {
		console.error('Failed to clear spell data from localStorage:', error)
		return false
	}
}

/**
 * Add spell to spellbook with duplicate prevention
 * @param {Object} spell - Spell object to add
 * @returns {Object} Result object with success status and message
 */
export const addSpellToSpellbook = (spell) => {
	try {
		const spellbookData = loadSpellbook()
		const currentSpells = spellbookData.spells || []

		// Check for duplicates
		const isDuplicate = currentSpells.some(
			(existingSpell) => existingSpell.index === spell.index
		)
		if (isDuplicate) {
			return {
				success: false,
				message: `"${spell.name}" is already in your spellbook.`
			}
		}

		// Add spell and save
		const updatedSpells = [...currentSpells, spell]
		const success = saveSpellbook(updatedSpells)

		if (success) {
			return {
				success: true,
				message: `"${spell.name}" added to spellbook.`,
				spells: updatedSpells
			}
		} else {
			return {
				success: false,
				message: 'Failed to save spellbook changes.'
			}
		}
	} catch (error) {
		console.error('Failed to add spell to spellbook:', error)
		return {
			success: false,
			message: 'Failed to add spell to spellbook.'
		}
	}
}

/**
 * Remove spell from spellbook
 * @param {string} spellIndex - Index of spell to remove
 * @returns {Object} Result object with success status and message
 */
export const removeSpellFromSpellbook = (spellIndex) => {
	try {
		const spellbookData = loadSpellbook()
		const currentSpells = spellbookData.spells || []

		// Find the spell being removed
		const spellToRemove = currentSpells.find((spell) => spell.index === spellIndex)

		// Filter out the spell
		const updatedSpells = currentSpells.filter((spell) => spell.index !== spellIndex)
		const success = saveSpellbook(updatedSpells)

		if (success) {
			return {
				success: true,
				message: 'Spell removed from spellbook.',
				spells: updatedSpells
			}
		} else {
			return {
				success: false,
				message: 'Failed to save spellbook changes.'
			}
		}
	} catch (error) {
		console.error('Failed to remove spell from spellbook:', error)
		return {
			success: false,
			message: 'Failed to remove spell from spellbook.'
		}
	}
}

/**
 * Initialize localStorage with empty data structures if they don't exist
 * @returns {Object} Status of initialization for each store
 */
export const initializeLocalStorage = () => {
	const results = {
		spellbook: false,
		sessionDeck: false,
		dailySpells: false
	}

	// Initialize spellbook if it doesn't exist
	const spellbook = loadSpellbook()
	if (!spellbook.spells || !Array.isArray(spellbook.spells)) {
		results.spellbook = saveSpellbook([])
	} else {
		results.spellbook = true
	}

	// Initialize session deck if it doesn't exist
	const sessionDeck = loadSessionDeck()
	if (!sessionDeck.spells || !Array.isArray(sessionDeck.spells)) {
		results.sessionDeck = saveSessionDeck([])
	} else {
		results.sessionDeck = true
	}

	// Initialize daily spells if it doesn't exist
	const dailySpells = loadDailySpells()
	if (!dailySpells.spells || !Array.isArray(dailySpells.spells)) {
		results.dailySpells = saveDailySpells([], null)
	} else {
		results.dailySpells = true
	}

	return results
}
