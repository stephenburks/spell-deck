/**
 * Data migration utilities for converting old localStorage formats to new structure
 * Handles migration from old spell interface data to new tabbed interface format
 */

import { STORAGE_KEYS, safeSaveToStorage, safeLoadFromStorage } from './localStorage.js'

// Legacy storage keys that might exist from previous versions
const LEGACY_KEYS = {
	SPELLS: 'spells', // Old general spells cache
	SESSION: 'session', // Old session data
	USER_SESSION: 'user-session', // Alternative old session key
	SPELL_CACHE: 'spell-cache', // Old spell cache
	CLASS_SPELLS: 'class-spells' // Old class-based spell data
}

/**
 * Migrate old session data to new format
 * Converts old session localStorage data to new session-deck format
 * @returns {Object} Migration result with success status and details
 */
export const migrateSessionData = () => {
	const migrationResult = {
		success: false,
		migratedSpells: 0,
		preservedData: null,
		errors: []
	}

	try {
		// Check for existing new format data first
		const existingSessionData = safeLoadFromStorage(STORAGE_KEYS.SESSION_DECK, null)
		if (
			existingSessionData &&
			existingSessionData.spells &&
			existingSessionData.spells.length > 0
		) {
			migrationResult.success = true
			migrationResult.preservedData = existingSessionData
			migrationResult.migratedSpells = existingSessionData.spells.length
			console.log('Session data already in new format, preserving existing data')
			return migrationResult
		}

		// Look for old session data formats
		const legacySessionKeys = [LEGACY_KEYS.SESSION, LEGACY_KEYS.USER_SESSION]
		let oldSessionData = null

		for (const key of legacySessionKeys) {
			const data = safeLoadFromStorage(key, null)
			if (data) {
				oldSessionData = data
				console.log(`Found legacy session data in key: ${key}`)
				break
			}
		}

		if (!oldSessionData) {
			// No old data to migrate, initialize with empty session
			const emptySession = {
				spells: [],
				lastModified: new Date().toISOString()
			}
			const saved = safeSaveToStorage(STORAGE_KEYS.SESSION_DECK, emptySession)
			if (saved) {
				migrationResult.success = true
				migrationResult.preservedData = emptySession
				console.log('No legacy session data found, initialized empty session')
			} else {
				migrationResult.errors.push('Failed to initialize empty session data')
			}
			return migrationResult
		}

		// Convert old session data to new format
		const migratedSpells = convertLegacySessionSpells(oldSessionData)

		const newSessionData = {
			spells: migratedSpells,
			lastModified: new Date().toISOString()
		}

		// Save migrated data
		const saved = safeSaveToStorage(STORAGE_KEYS.SESSION_DECK, newSessionData)
		if (saved) {
			migrationResult.success = true
			migrationResult.migratedSpells = migratedSpells.length
			migrationResult.preservedData = newSessionData
			console.log(`Successfully migrated ${migratedSpells.length} session spells`)

			// Clean up old keys
			legacySessionKeys.forEach((key) => {
				try {
					localStorage.removeItem(key)
					console.log(`Cleaned up legacy key: ${key}`)
				} catch (error) {
					console.warn(`Failed to clean up legacy key ${key}:`, error)
				}
			})
		} else {
			migrationResult.errors.push('Failed to save migrated session data')
		}
	} catch (error) {
		console.error('Session data migration failed:', error)
		migrationResult.errors.push(error.message)
	}

	return migrationResult
}

/**
 * Convert legacy session spell data to new format with sessionIds
 * @param {*} oldData - Legacy session data in various possible formats
 * @returns {Array} Array of spells in new format with sessionIds
 */
function convertLegacySessionSpells(oldData) {
	const migratedSpells = []

	try {
		let spellsToMigrate = []

		// Handle different possible old data formats
		if (Array.isArray(oldData)) {
			// Old data was just an array of spells
			spellsToMigrate = oldData
		} else if (oldData && typeof oldData === 'object') {
			// Old data was an object, look for spells array
			if (Array.isArray(oldData.spells)) {
				spellsToMigrate = oldData.spells
			} else if (Array.isArray(oldData.sessionSpells)) {
				spellsToMigrate = oldData.sessionSpells
			} else if (Array.isArray(oldData.data)) {
				spellsToMigrate = oldData.data
			}
		}

		// Convert each spell to new format
		spellsToMigrate.forEach((spell, index) => {
			if (spell && typeof spell === 'object' && spell.index && spell.name) {
				// Generate unique sessionId for each spell instance
				const sessionId = `${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`

				// Create new format spell with sessionId
				const migratedSpell = {
					...spell,
					sessionId
				}

				// Validate the spell has required fields
				if (validateMigratedSpell(migratedSpell)) {
					migratedSpells.push(migratedSpell)
				} else {
					console.warn('Skipped invalid spell during migration:', spell)
				}
			}
		})
	} catch (error) {
		console.error('Error converting legacy session spells:', error)
	}

	return migratedSpells
}

/**
 * Validate that a migrated spell has all required fields
 * @param {Object} spell - Spell object to validate
 * @returns {boolean} True if spell is valid
 */
function validateMigratedSpell(spell) {
	return (
		spell &&
		typeof spell.index === 'string' &&
		typeof spell.name === 'string' &&
		typeof spell.level === 'number' &&
		spell.level >= 0 &&
		spell.level <= 9 &&
		typeof spell.sessionId === 'string'
	)
}

/**
 * Clean up old localStorage data that's no longer needed
 * @returns {Object} Cleanup result with removed keys and errors
 */
export const cleanupLegacyData = () => {
	const cleanupResult = {
		success: true,
		removedKeys: [],
		errors: []
	}

	// List of all legacy keys to remove
	const keysToRemove = Object.values(LEGACY_KEYS)

	keysToRemove.forEach((key) => {
		try {
			const existingData = localStorage.getItem(key)
			if (existingData !== null) {
				localStorage.removeItem(key)
				cleanupResult.removedKeys.push(key)
				console.log(`Removed legacy localStorage key: ${key}`)
			}
		} catch (error) {
			console.warn(`Failed to remove legacy key ${key}:`, error)
			cleanupResult.errors.push(`${key}: ${error.message}`)
			cleanupResult.success = false
		}
	})

	return cleanupResult
}

/**
 * Run complete migration process
 * Migrates session data and cleans up legacy keys
 * @returns {Object} Complete migration result
 */
export const runCompleteMigration = () => {
	console.log('Starting data migration process...')

	const migrationResult = {
		success: false,
		sessionMigration: null,
		cleanup: null,
		summary: ''
	}

	try {
		// Step 1: Migrate session data
		migrationResult.sessionMigration = migrateSessionData()

		// Step 2: Clean up legacy data (only if session migration succeeded)
		if (migrationResult.sessionMigration.success) {
			migrationResult.cleanup = cleanupLegacyData()
			migrationResult.success = migrationResult.cleanup.success
		} else {
			migrationResult.success = false
		}

		// Generate summary
		const sessionSpells = migrationResult.sessionMigration.migratedSpells || 0
		const removedKeys = migrationResult.cleanup?.removedKeys?.length || 0
		const errors = [
			...(migrationResult.sessionMigration.errors || []),
			...(migrationResult.cleanup?.errors || [])
		]

		if (migrationResult.success && errors.length === 0) {
			migrationResult.summary = `Migration completed successfully. Migrated ${sessionSpells} session spells and removed ${removedKeys} legacy keys.`
		} else {
			migrationResult.summary = `Migration completed with issues. Migrated ${sessionSpells} session spells, removed ${removedKeys} legacy keys, encountered ${errors.length} errors.`
		}

		console.log(migrationResult.summary)
	} catch (error) {
		console.error('Migration process failed:', error)
		migrationResult.success = false
		migrationResult.summary = `Migration failed: ${error.message}`
	}

	return migrationResult
}

/**
 * Check if migration is needed
 * @returns {boolean} True if migration should be run
 */
export const isMigrationNeeded = () => {
	// Check if new format data already exists
	const newSessionData = safeLoadFromStorage(STORAGE_KEYS.SESSION_DECK, null)
	if (newSessionData && newSessionData.spells) {
		return false // New format already exists
	}

	// Check if any legacy keys exist
	const legacyKeys = Object.values(LEGACY_KEYS)
	for (const key of legacyKeys) {
		if (localStorage.getItem(key) !== null) {
			return true // Found legacy data
		}
	}

	return false // No migration needed
}
