import type { Spell } from '../types'

const SPELLS_DATA_URL = `${import.meta.env.BASE_URL}data/spells.json`

export async function getAllSpellDetails(): Promise<Spell[]> {
	const response = await fetch(SPELLS_DATA_URL)
	if (!response.ok) {
		throw new Error(`Failed to load spell data: ${response.status}`)
	}
	return response.json() as Promise<Spell[]>
}
