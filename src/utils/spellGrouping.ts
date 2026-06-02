import type { Spell, SessionSpell } from '../types'

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
] as const

type LevelLabel = (typeof SPELL_LEVELS)[number]

export const getLevelLabel = (level: number): string => {
	return level === 0 ? 'Cantrips' : `Level ${level}`
}

export const groupSpellsByLevel = (spells: unknown): Partial<Record<string, Spell[]>> => {
	if (!Array.isArray(spells)) return {}

	const grouped: Record<string, Spell[]> = {}

	for (const spell of spells) {
		if (!spell || typeof (spell as Spell)?.level !== 'number') continue
		const levelKey = getLevelLabel((spell as Spell).level)
		if (!grouped[levelKey]) grouped[levelKey] = []
		grouped[levelKey].push(spell as Spell)
	}

	for (const levelSpells of Object.values(grouped)) {
		levelSpells.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
	}

	return grouped
}

export interface SpellGroup {
	level: string
	spells: Spell[]
	count: number
}

export const getOrderedSpellGroups = (spells: unknown): SpellGroup[] => {
	const grouped = groupSpellsByLevel(spells)

	return SPELL_LEVELS.filter((level) => grouped[level]?.length).map((level) => ({
		level,
		spells: grouped[level] as Spell[],
		count: (grouped[level] as Spell[]).length
	}))
}

export const getSpellsForLevel = (spells: unknown, level: number): Spell[] => {
	if (!Array.isArray(spells)) return []

	return spells
		.filter((spell): spell is Spell => (spell as Spell)?.level === level)
		.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
}

export const countSpellsByLevel = (spells: unknown): Record<string, number> => {
	const counts: Record<string, number> = Object.fromEntries(
		SPELL_LEVELS.map((level) => [level, 0])
	)

	if (!Array.isArray(spells)) return counts

	for (const spell of spells) {
		const s = spell as Spell | undefined
		if (s?.level !== undefined && s.level >= 0 && s.level <= 9) {
			counts[getLevelLabel(s.level)]++
		}
	}

	return counts
}

export const generateSessionId = (): string =>
	`${Date.now()}_${Math.floor(Math.random() * 1000)}`

export const addSessionId = (spell: unknown): SessionSpell | null => {
	if (!spell || typeof spell !== 'object') return null
	return { ...(spell as Spell), sessionId: generateSessionId() }
}

export const removeSessionId = (spell: unknown): Spell | null => {
	if (!spell || typeof spell !== 'object') return null
	const { sessionId, ...rest } = spell as SessionSpell
	return rest as Spell
}
