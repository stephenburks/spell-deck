/**
 * Spell grouping utilities for level-based organization
 */

const SPELL_LEVELS = [
	'Cantrips',
	'Level 1',
	'Level 2',
	'Level 3',
	'Level 4',
	'Level 5',
	'Level 6',
	'Level 7',
	'Level 8',
	'Level 9'
]

/**
 * Get display label for a spell level
 * @param {number} level - Spell level (0-9)
 * @returns {string} Display label
 */
export const getLevelLabel = (level) => {
	return level === 0 ? 'Cantrips' : `Level ${level}`
}

/**
 * Group spells by level with alphabetical sorting
 * @param {Array} spells - Array of spell objects
 * @returns {Object} Grouped spells by level
 */
export const groupSpellsByLevel = (spells) => {
	if (!Array.isArray(spells)) return {}

	const grouped = spells.reduce((acc, spell) => {
		if (!spell || typeof spell.level !== 'number') return acc

		const levelKey = getLevelLabel(spell.level)
		if (!acc[levelKey]) acc[levelKey] = []
		acc[levelKey].push(spell)
		return acc
	}, {})

	// Sort alphabetically within each level
	Object.values(grouped).forEach((levelSpells) => {
		levelSpells.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
	})

	return grouped
}

/**
 * Get spells organized by level in display order
 * @param {Array} spells - Array of spell objects
 * @returns {Array} Ordered spell groups with metadata
 */
export const getOrderedSpellGroups = (spells) => {
	const grouped = groupSpellsByLevel(spells)

	return SPELL_LEVELS.filter((level) => grouped[level]?.length > 0).map((level) => ({
		level,
		spells: grouped[level],
		count: grouped[level].length
	}))
}

/**
 * Get spells for a specific level, sorted alphabetically
 * @param {Array} spells - Array of spell objects
 * @param {number} level - Spell level (0-9)
 * @returns {Array} Filtered and sorted spells
 */
export const getSpellsForLevel = (spells, level) => {
	if (!Array.isArray(spells)) return []

	return spells
		.filter((spell) => spell?.level === level)
		.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
}

/**
 * Count spells by level
 * @param {Array} spells - Array of spell objects
 * @returns {Object} Counts by level
 */
export const countSpellsByLevel = (spells) => {
	if (!Array.isArray(spells)) return {}

	const counts = Object.fromEntries(SPELL_LEVELS.map((level) => [level, 0]))

	spells.forEach((spell) => {
		if (spell?.level >= 0 && spell?.level <= 9) {
			counts[getLevelLabel(spell.level)]++
		}
	})

	return counts
}

/**
 * Generate unique session ID
 * @returns {string} Unique session ID
 */
export const generateSessionId = () => `${Date.now()}_${Math.floor(Math.random() * 1000)}`

/**
 * Add session ID to spell object
 * @param {Object} spell - Spell object
 * @returns {Object|null} Spell with sessionId or null if invalid
 */
export const addSessionId = (spell) => {
	return spell && typeof spell === 'object' ? { ...spell, sessionId: generateSessionId() } : null
}

/**
 * Remove session ID from spell object
 * @param {Object} sessionSpell - Session spell object
 * @returns {Object|null} Spell without sessionId or null if invalid
 */
export const removeSessionId = (sessionSpell) => {
	if (!sessionSpell || typeof sessionSpell !== 'object') return null

	const { sessionId, ...spell } = sessionSpell
	return spell
}
