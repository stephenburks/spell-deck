import { useQuery } from '@tanstack/react-query'
import { getAllSpellDetails } from '../api'
import { mergeAdditionalSpells } from '../utils/additionalSpells'

// Add your custom spells here
const CUSTOM_SPELLS = [
	{
		index: 'ray-of-sickness',
		name: 'Ray of Sickness',
		desc: [
			'A ray of sickening greenish energy lashes out toward a creature within range. Make a ranged spell attack against the target. On a hit, the target takes 2d8 poison damage and must make a Constitution saving throw. On a failed save, it is also poisoned until the end of your next turn.'
		],
		higher_level: [
			'When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d8 for each slot level above 1st.'
		],
		range: '60 feet',
		components: ['V', 'S'],
		ritual: false,
		duration: 'Instantaneous',
		concentration: false,
		casting_time: '1 action',
		level: 1,
		attack_type: 'ranged',
		damage: {
			damage_type: {
				index: 'poison',
				name: 'Poison'
			},
			damage_at_slot_level: {
				1: '2d8',
				2: '3d8',
				3: '4d8',
				4: '5d8',
				5: '6d8',
				6: '7d8',
				7: '8d8',
				8: '9d8',
				9: '10d8'
			}
		},
		school: {
			index: 'necromancy',
			name: 'Necromancy'
		},
		classes: [
			{
				index: 'sorcerer',
				name: 'Sorcerer'
			},
			{
				index: 'wizard',
				name: 'Wizard'
			}
		]
	},
	{
		index: 'toll-the-dead',
		name: 'Toll the Dead',
		desc: [
			'You point at one creature you can see within range, and the sound of a dolorous bell fills the air around it for a moment. The target must succeed on a Wisdom saving throw or take 1d8 necrotic damage. If the target is missing any of its hit points, it instead takes 1d12 necrotic damage.'
		],
		higher_level: [
			"The spell's damage increases by one die when you reach 5th level (2d8 or 2d12), 11th level (3d8 or 3d12), and 17th level (4d8 or 4d12)."
		],
		range: '60 feet',
		components: ['V', 'S'],
		ritual: false,
		duration: 'Instantaneous',
		concentration: false,
		casting_time: '1 action',
		level: 0,
		damage: {
			damage_type: {
				index: 'necrotic',
				name: 'Necrotic'
			}
		},
		school: {
			index: 'necromancy',
			name: 'Necromancy'
		},
		classes: [
			{
				index: 'cleric',
				name: 'Cleric'
			},
			{
				index: 'warlock',
				name: 'Warlock'
			},
			{
				index: 'wizard',
				name: 'Wizard'
			}
		]
	}
]

/**
 * Hook to fetch all spells from the complete spell database
 * Combines spells from all classes, removes duplicates, and provides comprehensive error handling
 *
 * @returns {Object} Query result with data, loading, error states and additional utilities
 */
export function useAllSpells() {
	const queryResult = useQuery({
		queryKey: ['allSpells'],
		queryFn: getAllSpellDetails,
		staleTime: 24 * 60 * 60 * 1000, // 24 hours - spells don't change often
		gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
		retry: 3, // Increased retry attempts for better reliability
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
		// Add network error retry logic
		retryCondition: (error) => {
			// Retry on network errors, timeouts, and 5xx server errors
			return (
				error?.message?.includes('fetch') ||
				error?.message?.includes('network') ||
				error?.message?.includes('timeout') ||
				error?.message?.includes('500') ||
				error?.message?.includes('502') ||
				error?.message?.includes('503') ||
				error?.message?.includes('504')
			)
		}
	})

	// Merge API spells with custom spells
	const allSpells = mergeAdditionalSpells(queryResult.data, CUSTOM_SPELLS)

	// Return enhanced query result with additional utilities
	return {
		...queryResult,
		// Convenience properties for better DX
		spells: allSpells,
		isLoaded: !!queryResult.data && !queryResult.isLoading,
		hasError: !!queryResult.error,
		spellCount: allSpells.length,
		// Helper method to get spells by level
		getSpellsByLevel: (level) => {
			return allSpells.filter((spell) => spell.level === level)
		},
		// Helper method to search spells by name
		searchSpells: (searchTerm) => {
			if (!searchTerm) return allSpells
			const term = searchTerm.toLowerCase()
			return allSpells.filter(
				(spell) =>
					spell.name.toLowerCase().includes(term) ||
					spell.desc?.some((desc) => desc.toLowerCase().includes(term))
			)
		}
	}
}
