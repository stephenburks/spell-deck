import type { Spell, SessionSpell } from '../types'

export const mergeAdditionalSpells = (apiSpells: Spell[] = [], customSpells: Spell[] = []): Spell[] => {
	const combined = [...apiSpells, ...customSpells]

	const uniqueSpells = combined.reduce<Spell[]>((acc, spell) => {
		if (!acc.some((s) => s.index === spell.index)) {
			acc.push(spell)
		}
		return acc
	}, [])

	return uniqueSpells.sort((a, b) => a.name.localeCompare(b.name))
}
