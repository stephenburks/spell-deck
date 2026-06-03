import { useQuery } from '@tanstack/react-query'
import { getAllSpellDetails } from '../api'
import { mergeAdditionalSpells } from '../utils/additionalSpells'
import type { Spell } from '../types'

const CUSTOM_SPELLS: Spell[] = [
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

export function useAllSpells() {
	const queryResult = useQuery({
		queryKey: ['allSpells'],
		queryFn: getAllSpellDetails,
		staleTime: Infinity,
		gcTime: 24 * 60 * 60 * 1000,
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
	})

	const allSpells = mergeAdditionalSpells(queryResult.data, CUSTOM_SPELLS)

	return {
		...queryResult,
		spells: allSpells,
		isLoaded: !!queryResult.data && !queryResult.isLoading,
		hasError: !!queryResult.error,
		spellCount: allSpells.length,
		getSpellsByLevel: (level: number) => {
			return allSpells.filter((spell: Spell) => spell.level === level)
		},
		searchSpells: (searchTerm: string) => {
			if (!searchTerm) return allSpells
			const term = searchTerm.toLowerCase()
			return allSpells.filter(
				(spell: Spell) =>
					spell.name.toLowerCase().includes(term) ||
					spell.desc?.some((desc: string) => desc.toLowerCase().includes(term))
			)
		}
	}
}
