import type { Spell } from '../types'

export const validateSpellObject = (spell: unknown): spell is Spell => {
	return (
		spell !== null &&
		spell !== undefined &&
		typeof spell === 'object' &&
		'index' in spell &&
		typeof (spell as Spell).index === 'string' &&
		(spell as Spell).index.trim() !== '' &&
		'name' in spell &&
		typeof (spell as Spell).name === 'string' &&
		(spell as Spell).name.trim() !== '' &&
		'level' in spell &&
		typeof (spell as Spell).level === 'number' &&
		Number.isInteger((spell as Spell).level) &&
		(spell as Spell).level >= 0 &&
		(spell as Spell).level <= 9
	)
}

export const validateSessionSpell = (spell: unknown): spell is Spell & { sessionId: string } => {
	if (!validateSpellObject(spell)) return false
	const sessionSpell = spell as Spell & { sessionId?: string }
	return typeof sessionSpell.sessionId === 'string' && sessionSpell.sessionId.trim() !== ''
}

export const getValidSpells = (spells: unknown): Spell[] => {
	return Array.isArray(spells) ? spells.filter(validateSpellObject) : []
}
