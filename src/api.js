const SPELLS_DATA_URL = `${process.env.PUBLIC_URL}/data/spells.json`

export async function getAllSpellDetails() {
	const response = await fetch(SPELLS_DATA_URL)
	if (!response.ok) {
		throw new Error(`Failed to load spell data: ${response.status}`)
	}
	return response.json()
}
