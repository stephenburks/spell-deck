/**
 * Data validation functions for spell objects and arrays
 * Ensures data integrity for the spell interface
 */

/**
 * Validate a single spell object
 * @param {Object} spell - Spell object to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validateSpellObject = (spell) => {
	if (!spell || typeof spell !== 'object') {
		return false
	}

	// Required fields based on API structure
	const requiredFields = {
		index: 'string',
		name: 'string',
		level: 'number'
	}

	// Check required fields
	for (const [field, type] of Object.entries(requiredFields)) {
		if (!(field in spell) || typeof spell[field] !== type) {
			return false
		}
	}

	// Validate level range (0-9 for D&D 5e)
	if (spell.level < 0 || spell.level > 9 || !Number.isInteger(spell.level)) {
		return false
	}

	// Validate index format (should be kebab-case string)
	if (!spell.index || typeof spell.index !== 'string' || spell.index.trim() === '') {
		return false
	}

	// Validate name format
	if (!spell.name || typeof spell.name !== 'string' || spell.name.trim() === '') {
		return false
	}

	return true
}

/**
 * Validate an array of spell objects
 * @param {Array} spells - Array of spell objects to validate
 * @returns {boolean} True if all spells are valid, false otherwise
 */
export const validateSpellArray = (spells) => {
	if (!Array.isArray(spells)) {
		return false
	}

	return spells.every(validateSpellObject)
}

/**
 * Validate session spell object (includes sessionId)
 * @param {Object} sessionSpell - Session spell object to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validateSessionSpell = (sessionSpell) => {
	if (!validateSpellObject(sessionSpell)) {
		return false
	}

	// Session spells must have a sessionId
	if (!sessionSpell.sessionId || typeof sessionSpell.sessionId !== 'string') {
		return false
	}

	// SessionId should follow the format: timestamp_random
	const sessionIdPattern = /^\d+_\d+$/
	if (!sessionIdPattern.test(sessionSpell.sessionId)) {
		return false
	}

	return true
}

/**
 * Validate an array of session spell objects
 * @param {Array} sessionSpells - Array of session spell objects to validate
 * @returns {boolean} True if all session spells are valid, false otherwise
 */
export const validateSessionSpellArray = (sessionSpells) => {
	if (!Array.isArray(sessionSpells)) {
		return false
	}

	return sessionSpells.every(validateSessionSpell)
}

/**
 * Validate spellbook data structure
 * @param {Object} spellbookData - Spellbook data object
 * @returns {boolean} True if valid, false otherwise
 */
export const validateSpellbookData = (spellbookData) => {
	if (!spellbookData || typeof spellbookData !== 'object') {
		return false
	}

	// Check required structure
	if (!('spells' in spellbookData) || !('lastModified' in spellbookData)) {
		return false
	}

	// Validate spells array
	if (!validateSpellArray(spellbookData.spells)) {
		return false
	}

	// Validate lastModified timestamp
	if (typeof spellbookData.lastModified !== 'string') {
		return false
	}

	// Check if lastModified is a valid ISO date string
	const date = new Date(spellbookData.lastModified)
	if (isNaN(date.getTime())) {
		return false
	}

	return true
}

/**
 * Validate session deck data structure
 * @param {Object} sessionDeckData - Session deck data object
 * @returns {boolean} True if valid, false otherwise
 */
export const validateSessionDeckData = (sessionDeckData) => {
	if (!sessionDeckData || typeof sessionDeckData !== 'object') {
		return false
	}

	// Check required structure
	if (!('spells' in sessionDeckData) || !('lastModified' in sessionDeckData)) {
		return false
	}

	// Validate session spells array
	if (!validateSessionSpellArray(sessionDeckData.spells)) {
		return false
	}

	// Validate lastModified timestamp
	if (typeof sessionDeckData.lastModified !== 'string') {
		return false
	}

	// Check if lastModified is a valid ISO date string
	const date = new Date(sessionDeckData.lastModified)
	if (isNaN(date.getTime())) {
		return false
	}

	return true
}

/**
 * Validate daily spells data structure
 * @param {Object} dailySpellsData - Daily spells data object
 * @returns {boolean} True if valid, false otherwise
 */
export const validateDailySpellsData = (dailySpellsData) => {
	if (!dailySpellsData || typeof dailySpellsData !== 'object') {
		return false
	}

	// Check required structure
	if (
		!('spells' in dailySpellsData) ||
		!('generatedDate' in dailySpellsData) ||
		!('lastModified' in dailySpellsData)
	) {
		return false
	}

	// Validate spells array (should be exactly 12 spells or empty)
	if (!validateSpellArray(dailySpellsData.spells)) {
		return false
	}

	if (dailySpellsData.spells.length !== 0 && dailySpellsData.spells.length !== 12) {
		return false
	}

	// Validate generatedDate format (YYYY-MM-DD or null)
	if (dailySpellsData.generatedDate !== null) {
		if (typeof dailySpellsData.generatedDate !== 'string') {
			return false
		}

		const datePattern = /^\d{4}-\d{2}-\d{2}$/
		if (!datePattern.test(dailySpellsData.generatedDate)) {
			return false
		}

		// Check if it's a valid date
		const date = new Date(dailySpellsData.generatedDate)
		if (isNaN(date.getTime())) {
			return false
		}
	}

	// Validate lastModified timestamp
	if (typeof dailySpellsData.lastModified !== 'string') {
		return false
	}

	// Check if lastModified is a valid ISO date string
	const date = new Date(dailySpellsData.lastModified)
	if (isNaN(date.getTime())) {
		return false
	}

	return true
}

/**
 * Sanitize and clean spell object (remove invalid fields, ensure required fields)
 * @param {Object} spell - Spell object to sanitize
 * @returns {Object|null} Sanitized spell object or null if invalid
 */
export const sanitizeSpellObject = (spell) => {
	if (!spell || typeof spell !== 'object') {
		return null
	}

	// Extract and validate required fields
	const sanitized = {
		index: spell.index,
		name: spell.name,
		level: spell.level
	}

	// Validate the sanitized object
	if (!validateSpellObject(sanitized)) {
		return null
	}

	// Add optional fields if they exist and are valid
	const optionalFields = [
		'desc',
		'higher_level',
		'range',
		'components',
		'material',
		'ritual',
		'duration',
		'concentration',
		'casting_time',
		'attack_type',
		'damage',
		'school',
		'classes',
		'subclasses',
		'url',
		'sessionId' // For session deck spells
	]

	optionalFields.forEach((field) => {
		if (field in spell) {
			sanitized[field] = spell[field]
		}
	})

	return sanitized
}

/**
 * Sanitize an array of spell objects
 * @param {Array} spells - Array of spell objects to sanitize
 * @returns {Array} Array of sanitized spell objects (invalid ones removed)
 */
export const sanitizeSpellArray = (spells) => {
	if (!Array.isArray(spells)) {
		return []
	}

	return spells.map(sanitizeSpellObject).filter((spell) => spell !== null)
}
