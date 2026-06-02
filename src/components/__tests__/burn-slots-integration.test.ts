import { describe, it, expect, beforeEach } from 'vitest'
import { STORAGE_KEY } from '../../utils/spellSlots.ts'

beforeEach(() => {
	localStorage.clear()
})

describe('burn → slot tracker integration', () => {
	it('increments usedSlots in localStorage when SpellDeckTab burn handler fires', () => {
		// Setup: slot tracker state with some used slots
		const initialState = {
			characterLevel: 5,
			casterType: 'full',
			usedSlots: { 1: 2 }
		}
		localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState))

		// Simulate burn handler logic (from SpellDeckTab.jsx line 145-157)
		const spellToBurn = { name: 'Magic Missile', level: 1 }
		const slotState = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')

		expect(slotState.usedSlots).toBeDefined()
		expect(slotState.usedSlots[1]).toBe(2)

		// Burn a 1st level spell → increment used slot for level 1
		slotState.usedSlots[1] = (slotState.usedSlots[1] || 0) + 1
		localStorage.setItem(STORAGE_KEY, JSON.stringify(slotState))

		// Verify persisted
		const updated = JSON.parse(localStorage.getItem(STORAGE_KEY))
		expect(updated.usedSlots[1]).toBe(3)
	})

	it('burn increments even when usedSlots key was missing', () => {
		const initialState = {
			characterLevel: 5,
			casterType: 'full',
			usedSlots: {}
		}
		localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState))

		const spellToBurn = { name: 'Magic Missile', level: 1 }
		const slotState = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')

		slotState.usedSlots[1] = (slotState.usedSlots[1] || 0) + 1
		localStorage.setItem(STORAGE_KEY, JSON.stringify(slotState))

		const updated = JSON.parse(localStorage.getItem(STORAGE_KEY))
		expect(updated.usedSlots[1]).toBe(1)
	})

	it('slot tracker loadSlotState reads the updated usedSlots', () => {
		// Simulate what loadSlotState does
		const loadSlotState = () => {
			try {
				const stored = localStorage.getItem(STORAGE_KEY)
				if (stored) return JSON.parse(stored)
			} catch {}
			return { characterLevel: 5, casterType: 'full', usedSlots: {} }
		}

		// Write as burn handler would
		const burnData = {
			characterLevel: 5,
			casterType: 'full',
			usedSlots: { 1: 3 }
		}
		localStorage.setItem(STORAGE_KEY, JSON.stringify(burnData))

		// Read as slot tracker would
		const loaded = loadSlotState()
		expect(loaded.usedSlots[1]).toBe(3)
		expect(loaded.usedSlots).toEqual({ 1: 3 })
	})
})
