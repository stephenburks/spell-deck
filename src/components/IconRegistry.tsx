import type React from 'react'
import type { FC, SVGProps } from 'react'

// Icon registry — maps icon names to SVG components
// Uses Vite's SVGR-like import for SVG files as React components

// Import spell SVGs as React components
import Abjuration from '../assets/icons/spell/abjuration.svg'
import Concentration from '../assets/icons/spell/concentration.svg'
import Conjuration from '../assets/icons/spell/conjuration.svg'
import Consumed from '../assets/icons/spell/consumed.svg'
import Cost from '../assets/icons/spell/cost.svg'
import Divination from '../assets/icons/spell/divination.svg'
import Enchantment from '../assets/icons/spell/enchantment.svg'
import Evocation from '../assets/icons/spell/evocation.svg'
import Illusion from '../assets/icons/spell/illusion.svg'
import Instantaneous from '../assets/icons/spell/instantaneous.svg'
import Material from '../assets/icons/spell/material.svg'
import Necromancy from '../assets/icons/spell/necromancy.svg'
import Octagon from '../assets/icons/spell/octagon.svg'
import Ritual from '../assets/icons/spell/ritual.svg'
import Somatic from '../assets/icons/spell/somatic.svg'
import Transmutation from '../assets/icons/spell/transmutation.svg'
import Upcast from '../assets/icons/spell/upcast.svg'
import Vocal from '../assets/icons/spell/vocal.svg'

// Import class SVGs as React components
import Artificer from '../assets/icons/classes/artificer.svg'
import Barbarian from '../assets/icons/classes/barbarian.svg'
import Bard from '../assets/icons/classes/bard.svg'
import Cleric from '../assets/icons/classes/cleric.svg'
import Druid from '../assets/icons/classes/druid.svg'
import Fighter from '../assets/icons/classes/fighter.svg'
import Monk from '../assets/icons/classes/monk.svg'
import Paladin from '../assets/icons/classes/paladin.svg'
import Ranger from '../assets/icons/classes/ranger.svg'
import Rogue from '../assets/icons/classes/rogue.svg'
import Sorcerer from '../assets/icons/classes/sorcerer.svg'
import Warlock from '../assets/icons/classes/warlock.svg'
import Wizard from '../assets/icons/classes/wizard.svg'

// Import UI SVGs as React components
import CastingTime from '../assets/icons/ui/casting-time.svg'
import Components from '../assets/icons/ui/components.svg'
import Duration from '../assets/icons/ui/duration.svg'
import Range from '../assets/icons/ui/range.svg'

// Import tab SVGs as React components
import SpellsOfTheDay from '../assets/icons/tabs/spells-of-the-day.svg'
import Spellbook from '../assets/icons/tabs/spellbook.svg'
import SpellDeck from '../assets/icons/tabs/spell-deck.svg'
import SpellLibrary from '../assets/icons/tabs/spell-library.svg'
import Readme from '../assets/icons/tabs/readme.svg'

type IconFolder = 'spell' | 'classes' | 'ui' | 'tabs'

interface IconProps {
	name: string
	folder?: IconFolder
	className?: string
	size?: number
	color?: string
	'aria-label'?: string
	[key: string]: unknown
}

type IconComponentType = FC<SVGProps<SVGSVGElement>>

// Icon registry — typed record of folder → name → SVG component
const iconRegistry: Record<IconFolder, Record<string, IconComponentType>> = {
	spell: {
		abjuration: Abjuration,
		concentration: Concentration,
		conjuration: Conjuration,
		consumed: Consumed,
		cost: Cost,
		divination: Divination,
		enchantment: Enchantment,
		evocation: Evocation,
		illusion: Illusion,
		instantaneous: Instantaneous,
		material: Material,
		necromancy: Necromancy,
		octagon: Octagon,
		ritual: Ritual,
		somatic: Somatic,
		transmutation: Transmutation,
		upcast: Upcast,
		vocal: Vocal
	},
	classes: {
		artificer: Artificer,
		barbarian: Barbarian,
		bard: Bard,
		cleric: Cleric,
		druid: Druid,
		fighter: Fighter,
		monk: Monk,
		paladin: Paladin,
		ranger: Ranger,
		rogue: Rogue,
		sorcerer: Sorcerer,
		warlock: Warlock,
		wizard: Wizard
	},
	ui: {
		'casting-time': CastingTime,
		components: Components,
		duration: Duration,
		range: Range,
		concentration: Concentration // Also available in UI for spell components
	},
	tabs: {
		'spells-of-the-day': SpellsOfTheDay,
		spellbook: Spellbook,
		'session-deck': SpellDeck,
		'spell-deck': SpellLibrary,
		readme: Readme
	}
}

const Icon = ({
	name,
	folder = 'spell',
	className = '',
	size = 24,
	color = 'currentColor',
	...props
}: IconProps) => {
	const IconComponent = iconRegistry[folder]?.[name]

	if (!IconComponent) {
		console.warn(`Icon not found: ${folder}/${name}`)
		return (
			<div
				className={`inline-flex items-center justify-center ${className}`}
				style={{ width: size, height: size }}
				{...props}>
				<span style={{ fontSize: size * 0.6 }}>?</span>
			</div>
		)
	}

	return (
		<IconComponent
			className={className}
			width={size}
			height={size}
			fill={color}
			role={props['aria-label'] ? 'img' : undefined}
			aria-hidden={props['aria-label'] ? undefined : true}
			focusable={false}
			{...props}
		/>
	)
}

export default Icon
