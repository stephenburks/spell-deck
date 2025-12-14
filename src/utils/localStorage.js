/**
 * LocalStorage management utilities for the spell interface
 * Handles three data stores: spellbook, session-deck, daily-spells
 */

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
	return safeSaveToStorage(STORAGE_KEYS.SPELLBOOK, data)
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
	return safeSaveToStorage(STORAGE_KEYS.SESSION_DECK, data)
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
