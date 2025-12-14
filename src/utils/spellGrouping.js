/**
 * Spell grouping utilities for level-based organization
 * Handles grouping spells by level (Cantrips, Level 1-9)
 */

/**
 * Get the ordered list of spell levels for consistent display
 * @returns {Array<string>} Ordered array of level labels
 */
export const getLevelOrder = () => [
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
 * Get the display label for a spell level
 * @param {number} level - Spell level (0-9)
 * @returns {string} Display label for the level
 */
export const getLevelLabel = (level) => {
	if (level === 0) {
		return 'Cantrips'
	}
	if (level >= 1 && level <= 9) {
		return `Level ${level}`
	}
	return 'Unknown Level'
}

/**
 * Check if a spell is a cantrip (level 0)
 * @param {Object} spell - Spell object
 * @returns {boolean} True if spell is a cantrip
 */
export const isCantrip = (spell) => {
	return spell && spell.level === 0
}

/**
 * Check if a spell is a leveled spell (levels 1-9)
 * @param {Object} spell - Spell object
 * @returns {boolean} True if spell is a leveled spell
 */
export const isLeveledSpell = (spell) => {
	return spell && spell.level >= 1 && spell.level <= 9
}

/**
 * Group spells by their level with alphabetical sorting within each level
 * @param {Array} spells - Array of spell objects
 * @returns {Object} Object with level labels as keys and sorted spell arrays as values
 */
export const groupSpellsByLevel = (spells) => {
	if (!Array.isArray(spells)) {
		return {}
	}

	// Group spells by level
	const grouped = spells.reduce((acc, spell) => {
		if (!spell || typeof spell.level !== 'number') {
			return acc
		}

		const levelKey = getLevelLabel(spell.level)
		if (!acc[levelKey]) {
			acc[levelKey] = []
		}
		acc[levelKey].push(spell)
		return acc
	}, {})

	// Sort spells within each level alphabetically by name
	Object.keys(grouped).forEach((level) => {
		grouped[level].sort((a, b) => {
			const nameA = a.name || ''
			const nameB = b.name || ''
			return nameA.localeCompare(nameB)
		})
	})

	return grouped
}

/**
 * Get spells organized by level in the correct display order
 * @param {Array} spells - Array of spell objects
 * @returns {Array<Object>} Array of objects with level and spells properties
 */
export const getOrderedSpellGroups = (spells) => {
	const grouped = groupSpellsByLevel(spells)
	const levelOrder = getLevelOrder()

	return levelOrder
		.filter((level) => grouped[level] && grouped[level].length > 0)
		.map((level) => ({
			level,
			spells: grouped[level],
			count: grouped[level].length
		}))
}

/**
 * Get spells for a specific level
 * @param {Array} spells - Array of spell objects
 * @param {number} level - Spell level to filter by (0-9)
 * @returns {Array} Array of spells for the specified level, sorted alphabetically
 */
export const getSpellsForLevel = (spells, level) => {
	if (!Array.isArray(spells) || typeof level !== 'number') {
		return []
	}

	return spells
		.filter((spell) => spell && spell.level === level)
		.sort((a, b) => {
			const nameA = a.name || ''
			const nameB = b.name || ''
			return nameA.localeCompare(nameB)
		})
}

/**
 * Get cantrips from a spell array
 * @param {Array} spells - Array of spell objects
 * @returns {Array} Array of cantrip spells, sorted alphabetically
 */
export const getCantrips = (spells) => {
	return getSpellsForLevel(spells, 0)
}

/**
 * Get leveled spells (levels 1-9) from a spell array
 * @param {Array} spells - Array of spell objects
 * @returns {Array} Array of leveled spells, sorted alphabetically
 */
export const getLeveledSpells = (spells) => {
	if (!Array.isArray(spells)) {
		return []
	}

	return spells
		.filter((spell) => spell && spell.level >= 1 && spell.level <= 9)
		.sort((a, b) => {
			// First sort by level, then by name
			if (a.level !== b.level) {
				return a.level - b.level
			}
			const nameA = a.name || ''
			const nameB = b.name || ''
			return nameA.localeCompare(nameB)
		})
}

/**
 * Count spells by level
 * @param {Array} spells - Array of spell objects
 * @returns {Object} Object with level labels as keys and counts as values
 */
export const countSpellsByLevel = (spells) => {
	if (!Array.isArray(spells)) {
		return {}
	}

	const counts = {}
	const levelOrder = getLevelOrder()

	// Initialize all levels with 0
	levelOrder.forEach((level) => {
		counts[level] = 0
	})

	// Count spells for each level
	spells.forEach((spell) => {
		if (spell && typeof spell.level === 'number') {
			const levelKey = getLevelLabel(spell.level)
			if (counts.hasOwnProperty(levelKey)) {
				counts[levelKey]++
			}
		}
	})

	return counts
}

/**
 * Get total spell count
 * @param {Array} spells - Array of spell objects
 * @returns {number} Total number of valid spells
 */
export const getTotalSpellCount = (spells) => {
	if (!Array.isArray(spells)) {
		return 0
	}

	return spells.filter(
		(spell) => spell && typeof spell.level === 'number' && spell.level >= 0 && spell.level <= 9
	).length
}

/**
 * Generate a unique session ID for session spells
 * @returns {string} Unique session ID in format: timestamp_random
 */
export const generateSessionId = () => {
	const timestamp = Date.now()
	const random = Math.floor(Math.random() * 1000)
	return `${timestamp}_${random}`
}

/**
 * Add session ID to a spell object for session deck usage
 * @param {Object} spell - Spell object
 * @returns {Object} Spell object with added sessionId property
 */
export const addSessionId = (spell) => {
	if (!spell || typeof spell !== 'object') {
		return null
	}

	return {
		...spell,
		sessionId: generateSessionId()
	}
}

/**
 * Remove session ID from a spell object (for moving from session to spellbook)
 * @param {Object} sessionSpell - Session spell object with sessionId
 * @returns {Object} Spell object without sessionId property
 */
export const removeSessionId = (sessionSpell) => {
	if (!sessionSpell || typeof sessionSpell !== 'object') {
		return null
	}

	const { sessionId, ...spell } = sessionSpell
	return spell
}
