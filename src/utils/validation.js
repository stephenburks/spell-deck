/**
 * Essential data validation functions for spell objects
 * Ensures data integrity for spells from external API
 */

/**
 * Validate a spell object has required fields
 * @param {Object} spell - Spell object to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validateSpellObject = (spell) => {
	return (
		spell &&
		typeof spell === 'object' &&
		typeof spell.index === 'string' &&
		spell.index.trim() !== '' &&
		typeof spell.name === 'string' &&
		spell.name.trim() !== '' &&
		typeof spell.level === 'number' &&
		Number.isInteger(spell.level) &&
		spell.level >= 0 &&
		spell.level <= 9
	)
}

/**
 * Validate session spell object (includes sessionId)
 * @param {Object} sessionSpell - Session spell object to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validateSessionSpell = (sessionSpell) => {
	return (
		validateSpellObject(sessionSpell) &&
		typeof sessionSpell.sessionId === 'string' &&
		sessionSpell.sessionId.trim() !== ''
	)
}

/**
 * Filter array to only valid spell objects
 * @param {Array} spells - Array of spell objects to filter
 * @returns {Array} Array of valid spell objects
 */
export const getValidSpells = (spells) => {
	return Array.isArray(spells) ? spells.filter(validateSpellObject) : []
}
