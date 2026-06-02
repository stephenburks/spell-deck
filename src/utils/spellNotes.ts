const NOTES_KEY = 'spell-deck-notes'

export const loadNotes = () => {
	try {
		const stored = localStorage.getItem(NOTES_KEY)
		return stored ? JSON.parse(stored) : {}
	} catch {
		return {}
	}
}

export const saveNotes = (notes) => {
	localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
}

export const getSpellNote = (spellIndex) => {
	const notes = loadNotes()
	return notes[spellIndex] || ''
}

export const setSpellNote = (spellIndex, note) => {
	const notes = loadNotes()
	if (note.trim()) {
		notes[spellIndex] = note.trim()
	} else {
		delete notes[spellIndex]
	}
	saveNotes(notes)
}
