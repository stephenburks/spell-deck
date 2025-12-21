/**
 * LocalStorage management utilities for spell data
 */

import { addSessionId } from './spellGrouping.js'

export const STORAGE_KEYS = {
	SPELLBOOK: 'user-spellbook',
	SESSION_DECK: 'session-deck',
	DAILY_SPELLS: 'daily-spells'
}

/**
 * Safely load data from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if loading fails
 * @returns {*} Parsed data or default value
 */
export const safeLoadFromStorage = (key, defaultValue) => {
	try {
		const stored = localStorage.getItem(key)
		return stored ? JSON.parse(stored) : defaultValue
	} catch (error) {
		console.warn(`Failed to load ${key}:`, error)
		return defaultValue
	}
}

/**
 * Safely save data to localStorage
 * @param {string} key - Storage key
 * @param {*} data - Data to save
 * @returns {boolean} Success status
 */
export const safeSaveToStorage = (key, data) => {
	try {
		localStorage.setItem(key, JSON.stringify(data))
		return true
	} catch (error) {
		console.error(`Failed to save ${key}:`, error)
		return false
	}
}

/**
 * Create data structure with timestamp
 * @param {Array} spells - Spells array
 * @param {string} generatedDate - Optional date for daily spells
 * @returns {Object} Data structure with metadata
 */
const createDataStructure = (spells, generatedDate = null) => ({
	spells,
	...(generatedDate && { generatedDate }),
	lastModified: new Date().toISOString()
})

/**
 * Load spellbook data
 * @returns {Object} Spellbook data
 */
export const loadSpellbook = () =>
	safeLoadFromStorage(STORAGE_KEYS.SPELLBOOK, createDataStructure([]))

/**
 * Save spellbook data
 * @param {Array} spells - Spells array
 * @returns {boolean} Success status
 */
export const saveSpellbook = (spells) =>
	safeSaveToStorage(STORAGE_KEYS.SPELLBOOK, createDataStructure(spells))

/**
 * Load spell deck data
 * @returns {Object} Spell deck data
 */
export const loadSessionDeck = () =>
	safeLoadFromStorage(STORAGE_KEYS.SESSION_DECK, createDataStructure([]))

/**
 * Save spell deck data
 * @param {Array} spells - Spells array
 * @returns {boolean} Success status
 */
export const saveSessionDeck = (spells) =>
	safeSaveToStorage(STORAGE_KEYS.SESSION_DECK, createDataStructure(spells))

/**
 * Load daily spells data
 * @returns {Object} Daily spells data
 */
export const loadDailySpells = () =>
	safeLoadFromStorage(STORAGE_KEYS.DAILY_SPELLS, createDataStructure([], null))

/**
 * Save daily spells data
 * @param {Array} spells - Spells array
 * @param {string} generatedDate - Generation date
 * @returns {boolean} Success status
 */
export const saveDailySpells = (spells, generatedDate) =>
	safeSaveToStorage(STORAGE_KEYS.DAILY_SPELLS, createDataStructure(spells, generatedDate))

/**
 * Generic function to add spell to a collection
 * @param {string} storageKey - Storage key
 * @param {Function} loadFn - Load function
 * @param {Function} saveFn - Save function
 * @param {Object} spell - Spell to add
 * @param {Function} prepareSpell - Optional spell preparation function
 * @param {Function} checkDuplicate - Duplicate check function
 * @returns {Object} Operation result
 */
const addSpellToCollection = (
	storageKey,
	loadFn,
	saveFn,
	spell,
	prepareSpell = null,
	checkDuplicate = null
) => {
	try {
		const data = loadFn()
		const currentSpells = data.spells || []

		// Check for duplicates if function provided
		if (checkDuplicate && checkDuplicate(currentSpells, spell)) {
			return {
				success: false,
				message: `"${spell.name}" is already in your collection.`
			}
		}

		// Prepare spell if function provided
		const spellToAdd = prepareSpell ? prepareSpell(spell) : spell
		if (!spellToAdd) {
			return {
				success: false,
				message: 'Failed to prepare spell.'
			}
		}

		const updatedSpells = [...currentSpells, spellToAdd]
		const success = saveFn(updatedSpells)

		return {
			success,
			message: success ? `"${spell.name}" added successfully.` : 'Failed to save changes.',
			spells: updatedSpells,
			...(prepareSpell && { sessionSpell: spellToAdd })
		}
	} catch (error) {
		console.error(`Failed to add spell to ${storageKey}:`, error)
		return {
			success: false,
			message: 'Failed to add spell.'
		}
	}
}

/**
 * Generic function to remove spell from collection
 * @param {Function} loadFn - Load function
 * @param {Function} saveFn - Save function
 * @param {Function} filterFn - Filter function to remove spell
 * @returns {Object} Operation result
 */
const removeSpellFromCollection = (loadFn, saveFn, filterFn) => {
	try {
		const data = loadFn()
		const currentSpells = data.spells || []
		const updatedSpells = currentSpells.filter(filterFn)
		const success = saveFn(updatedSpells)

		return {
			success,
			message: success ? 'Spell removed successfully.' : 'Failed to save changes.',
			spells: updatedSpells
		}
	} catch (error) {
		console.error('Failed to remove spell:', error)
		return {
			success: false,
			message: 'Failed to remove spell.'
		}
	}
}

/**
 * Add spell to spellbook
 * @param {Object} spell - Spell object
 * @returns {Object} Operation result
 */
export const addSpellToSpellbook = (spell) =>
	addSpellToCollection(
		STORAGE_KEYS.SPELLBOOK,
		loadSpellbook,
		saveSpellbook,
		spell,
		null,
		(spells, spell) => spells.some((s) => s.index === spell.index)
	)

/**
 * Remove spell from spellbook
 * @param {string} spellIndex - Spell index
 * @returns {Object} Operation result
 */
export const removeSpellFromSpellbook = (spellIndex) =>
	removeSpellFromCollection(loadSpellbook, saveSpellbook, (spell) => spell.index !== spellIndex)

/**
 * Add spell to spell deck
 * @param {Object} spell - Spell object
 * @returns {Object} Operation result
 */
export const addSpellToSessionDeck = (spell) =>
	addSpellToCollection(
		STORAGE_KEYS.SESSION_DECK,
		loadSessionDeck,
		saveSessionDeck,
		spell,
		addSessionId
	)

/**
 * Remove spell from spell deck
 * @param {string} sessionId - Session ID
 * @returns {Object} Operation result
 */
export const removeSpellFromSessionDeck = (sessionId) =>
	removeSpellFromCollection(
		loadSessionDeck,
		saveSessionDeck,
		(spell) => spell.sessionId !== sessionId
	)

/**
 * Clear all spell data from localStorage
 * @returns {boolean} Success status
 */
export const clearAllSpellData = () => {
	try {
		Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
		return true
	} catch (error) {
		console.error('Failed to clear spell data:', error)
		return false
	}
}

/**
 * Initialize localStorage with empty structures if needed
 * @returns {Object} Initialization status
 */
export const initializeLocalStorage = () => {
	const results = {}

	Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
		const data = safeLoadFromStorage(key, null)
		if (!data?.spells || !Array.isArray(data.spells)) {
			const defaultData =
				key === STORAGE_KEYS.DAILY_SPELLS
					? createDataStructure([], null)
					: createDataStructure([])
			results[name.toLowerCase()] = safeSaveToStorage(key, defaultData)
		} else {
			results[name.toLowerCase()] = true
		}
	})

	return results
}
