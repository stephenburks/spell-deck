import { getActiveCampaign, safeLoadFromStorage, safeSaveToStorage } from './localStorage.js'
import { validateSpellObject } from './validation.js'
import type { Spell } from '../types'

const CUSTOM_SPELLS_KEY = 'spell-deck-custom-spells'

const getCustomSpellsKey = (campaignId?: string): string => {
	const id = campaignId || getActiveCampaign()
	return `${CUSTOM_SPELLS_KEY}-${id}`
}

export const loadCustomSpells = (campaignId?: string): Spell[] => {
	const key = getCustomSpellsKey(campaignId)
	return safeLoadFromStorage<Spell[]>(key, [])
}

export const saveCustomSpells = (spells: Spell[], campaignId?: string): boolean => {
	const key = getCustomSpellsKey(campaignId)
	return safeSaveToStorage(key, spells)
}

export const generateCustomSpellIndex = (): string =>
	`custom-${Date.now()}`

export const addCustomSpell = (spell: Spell, campaignId?: string): Spell | null => {
	const withIndex = {
		...spell,
		index: spell.index || generateCustomSpellIndex()
	}

	if (!validateSpellObject(withIndex)) return null

	const spells = loadCustomSpells(campaignId)

	// Check for duplicate index
	if (spells.some((s) => s.index === withIndex.index)) return null

	spells.push(withIndex)
	if (!saveCustomSpells(spells, campaignId)) return null
	return withIndex
}

export const updateCustomSpell = (
	index: string,
	updates: Partial<Spell>,
	campaignId?: string
): Spell | null => {
	const spells = loadCustomSpells(campaignId)
	const idx = spells.findIndex((s) => s.index === index)
	if (idx === -1) return null

	const updated = { ...spells[idx], ...updates }
	if (!validateSpellObject(updated)) return null

	spells[idx] = updated
	if (!saveCustomSpells(spells, campaignId)) return null
	return updated
}

export const deleteCustomSpell = (index: string, campaignId?: string): boolean => {
	const spells = loadCustomSpells(campaignId)
	const filtered = spells.filter((s) => s.index !== index)
	if (filtered.length === spells.length) return false
	return saveCustomSpells(filtered, campaignId)
}

export const exportCustomSpellsJson = (campaignId?: string): string => {
	const spells = loadCustomSpells(campaignId)
	return JSON.stringify(spells, null, 2)
}

export const importCustomSpellsJson = (
	json: string,
	campaignId?: string
): { imported: number; errors: string[] } => {
	const errors: string[] = []
	let parsed: unknown

	try {
		parsed = JSON.parse(json)
	} catch {
		return { imported: 0, errors: ['Invalid JSON format'] }
	}

	if (!Array.isArray(parsed)) {
		return { imported: 0, errors: ['JSON must contain an array of spells'] }
	}

	const validSpells: Spell[] = []
	for (let i = 0; i < parsed.length; i++) {
		const spell = parsed[i]
		if (!validateSpellObject(spell)) {
			errors.push(`Spell at index ${i} failed validation`)
			continue
		}
		// Ensure custom index
		if (!spell.index || !spell.index.startsWith('custom-')) {
			spell.index = generateCustomSpellIndex()
		}
		validSpells.push(spell)
	}

	if (validSpells.length === 0) {
		return { imported: 0, errors }
	}

	const existing = loadCustomSpells(campaignId)
	const existingIndices = new Set(existing.map((s) => s.index))

	for (const spell of validSpells) {
		if (existingIndices.has(spell.index)) {
			spell.index = generateCustomSpellIndex()
		}
		existing.push(spell)
		existingIndices.add(spell.index)
	}

	if (!saveCustomSpells(existing, campaignId)) {
		return { imported: 0, errors: [...errors, 'Failed to save to localStorage'] }
	}

	return { imported: validSpells.length, errors }
}
