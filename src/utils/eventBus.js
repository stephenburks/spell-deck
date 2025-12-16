/**
 * Event bus for cross-component communication
 * Handles real-time updates between tabs without relying on localStorage events
 */

class EventBus {
	constructor() {
		this.events = {}
	}

	// Subscribe to an event
	on(event, callback) {
		if (!this.events[event]) {
			this.events[event] = []
		}
		this.events[event].push(callback)

		// Return unsubscribe function
		return () => {
			this.events[event] = this.events[event].filter((cb) => cb !== callback)
		}
	}

	// Emit an event
	emit(event, data) {
		if (this.events[event]) {
			this.events[event].forEach((callback) => {
				try {
					callback(data)
				} catch (error) {
					console.error(`Error in event listener for ${event}:`, error)
				}
			})
		}
	}

	// Remove all listeners for an event
	off(event) {
		delete this.events[event]
	}

	// Remove all listeners
	clear() {
		this.events = {}
	}
}

// Create singleton instance
const eventBus = new EventBus()

// Event types
export const EVENTS = {
	SPELLBOOK_UPDATED: 'spellbook_updated',
	SESSION_DECK_UPDATED: 'session_deck_updated',
	DAILY_SPELLS_UPDATED: 'daily_spells_updated',
	SPELL_ADDED_TO_SPELLBOOK: 'spell_added_to_spellbook',
	SPELL_REMOVED_FROM_SPELLBOOK: 'spell_removed_from_spellbook',
	SPELL_ADDED_TO_SESSION: 'spell_added_to_session',
	SPELL_BURNED_FROM_SESSION: 'spell_burned_from_session',
	SESSION_CLEARED: 'session_cleared'
}

export default eventBus
