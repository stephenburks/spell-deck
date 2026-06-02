import type { Spell, SessionSpell } from '../types'
import { addSessionId } from './spellGrouping.ts'

export const STORAGE_KEYS = {
	SPELLBOOK: 'user-spellbook',
	SESSION_DECK: 'session-deck',
	DAILY_SPELLS: 'daily-spells'
} as const

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]

export interface SpellCollectionData {
	spells: Spell[]
	lastModified: string
}

export interface DailySpellData {
	spells: Spell[]
	generatedDate: string | null
	lastModified: string
}

export interface OperationResult {
	success: boolean
	message: string
	spells?: Spell[]
	sessionSpell?: SessionSpell
}

export const safeLoadFromStorage = <T>(key: string, defaultValue: T): T => {
	try {
		const stored = localStorage.getItem(key)
		return stored ? (JSON.parse(stored) as T) : defaultValue
	} catch (error) {
		console.warn(`Failed to load ${key}:`, error)
		return defaultValue
	}
}

export const safeSaveToStorage = (key: string, data: unknown): boolean => {
	try {
		localStorage.setItem(key, JSON.stringify(data))
		return true
	} catch (error) {
		console.error(`Failed to save ${key}:`, error)
		return false
	}
}

const createDataStructure = (spells: Spell[], generatedDate: string | null = null) => ({
	spells,
	...(generatedDate !== null && { generatedDate }),
	lastModified: new Date().toISOString()
})

export const loadSpellbook = (): SpellCollectionData =>
	safeLoadFromStorage(STORAGE_KEYS.SPELLBOOK, createDataStructure([]))

export const saveSpellbook = (spells: Spell[]): boolean =>
	safeSaveToStorage(STORAGE_KEYS.SPELLBOOK, createDataStructure(spells))

export const loadSessionDeck = (): SpellCollectionData & { spells: SessionSpell[] } =>
	safeLoadFromStorage(STORAGE_KEYS.SESSION_DECK, createDataStructure([]) as ReturnType<typeof createDataStructure> & { spells: SessionSpell[] })

export const saveSessionDeck = (spells: SessionSpell[]): boolean =>
	safeSaveToStorage(STORAGE_KEYS.SESSION_DECK, createDataStructure(spells))

export const loadDailySpells = (): DailySpellData =>
	safeLoadFromStorage(STORAGE_KEYS.DAILY_SPELLS, createDataStructure([], null))

export const saveDailySpells = (spells: Spell[], generatedDate: string): boolean =>
	safeSaveToStorage(STORAGE_KEYS.DAILY_SPELLS, createDataStructure(spells, generatedDate))

const addSpellToCollection = (
	storageKey: StorageKey,
	loadFn: () => { spells: Spell[] },
	saveFn: (spells: Spell[]) => boolean,
	spell: Spell,
	prepareSpell: ((spell: Spell) => SessionSpell | null) | null = null,
	checkDuplicate: ((spells: Spell[], spell: Spell) => boolean) | null = null
): OperationResult => {
	try {
		const data = loadFn()
		const currentSpells = data.spells || []

		if (checkDuplicate && checkDuplicate(currentSpells, spell)) {
			return {
				success: false,
				message: `"${spell.name}" is already in your collection.`
			}
		}

		const spellToAdd = prepareSpell ? prepareSpell(spell) : spell
		if (!spellToAdd) {
			return {
				success: false,
				message: 'Failed to prepare spell.'
			}
		}

		const updatedSpells = [...currentSpells, spellToAdd]
		const success = saveFn(updatedSpells as Spell[])

		return {
			success,
			message: success ? `"${spell.name}" added successfully.` : 'Failed to save changes.',
			spells: updatedSpells as Spell[],
			...(prepareSpell && { sessionSpell: spellToAdd as SessionSpell })
		}
	} catch (error) {
		console.error(`Failed to add spell to ${storageKey}:`, error)
		return {
			success: false,
			message: 'Failed to add spell.'
		}
	}
}

const removeSpellFromCollection = (
	loadFn: () => { spells: (Spell | SessionSpell)[] },
	saveFn: (spells: Spell[]) => boolean,
	filterFn: (spell: Spell | SessionSpell) => boolean
): OperationResult => {
	try {
		const data = loadFn()
		const currentSpells = data.spells || []
		const updatedSpells = currentSpells.filter(filterFn)
		const success = saveFn(updatedSpells as Spell[])

		return {
			success,
			message: success ? 'Spell removed successfully.' : 'Failed to save changes.',
			spells: updatedSpells as Spell[]
		}
	} catch (error) {
		console.error('Failed to remove spell:', error)
		return {
			success: false,
			message: 'Failed to remove spell.'
		}
	}
}

export const addSpellToSpellbook = (spell: Spell): OperationResult =>
	addSpellToCollection(
		STORAGE_KEYS.SPELLBOOK,
		loadSpellbook,
		saveSpellbook,
		spell,
		null,
		(spells, s) => spells.some((existing) => existing.index === s.index)
	)

export const removeSpellFromSpellbook = (spellIndex: string): OperationResult =>
	removeSpellFromCollection(loadSpellbook, saveSpellbook, (spell) => spell.index !== spellIndex)

export const addSpellToSessionDeck = (spell: Spell): OperationResult =>
	addSpellToCollection(
		STORAGE_KEYS.SESSION_DECK,
		loadSessionDeck,
		saveSessionDeck as (spells: Spell[]) => boolean,
		spell,
		addSessionId
	)

export const removeSpellFromSessionDeck = (sessionId: string): OperationResult =>
	removeSpellFromCollection(
		loadSessionDeck,
		saveSessionDeck as (spells: Spell[]) => boolean,
		(spell) => (spell as SessionSpell).sessionId !== sessionId
	)

export const clearAllSpellData = (): boolean => {
	try {
		Object.values(STORAGE_KEYS).forEach((key: string) => localStorage.removeItem(key))
		return true
	} catch (error) {
		console.error('Failed to clear spell data:', error)
		return false
	}
}

export const initializeLocalStorage = (): Record<string, boolean> => {
	const results: Record<string, boolean> = {}

	Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
		const data = safeLoadFromStorage<{ spells?: unknown } | null>(key, null)
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
