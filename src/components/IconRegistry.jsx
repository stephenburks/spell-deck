import React from 'react'

// Import spell SVGs as React components
import Abjuration from '../assets/icons/spell/abjuration.svg?react'
import Concentration from '../assets/icons/spell/concentration.svg?react'
import Conjuration from '../assets/icons/spell/conjuration.svg?react'
import Consumed from '../assets/icons/spell/consumed.svg?react'
import Cost from '../assets/icons/spell/cost.svg?react'
import Divination from '../assets/icons/spell/divination.svg?react'
import Enchantment from '../assets/icons/spell/enchantment.svg?react'
import Evocation from '../assets/icons/spell/evocation.svg?react'
import Illusion from '../assets/icons/spell/illusion.svg?react'
import Instantaneous from '../assets/icons/spell/instantaneous.svg?react'
import Material from '../assets/icons/spell/material.svg?react'
import Necromancy from '../assets/icons/spell/necromancy.svg?react'
import Octagon from '../assets/icons/spell/octagon.svg?react'
import Ritual from '../assets/icons/spell/ritual.svg?react'
import Somatic from '../assets/icons/spell/somatic.svg?react'
import Transmutation from '../assets/icons/spell/transmutation.svg?react'
import Upcast from '../assets/icons/spell/upcast.svg?react'
import Vocal from '../assets/icons/spell/vocal.svg?react'

// Import class SVGs as React components
import Artificer from '../assets/icons/classes/artificer.svg?react'
import Barbarian from '../assets/icons/classes/barbarian.svg?react'
import Bard from '../assets/icons/classes/bard.svg?react'
import Cleric from '../assets/icons/classes/cleric.svg?react'
import Druid from '../assets/icons/classes/druid.svg?react'
import Fighter from '../assets/icons/classes/fighter.svg?react'
import Monk from '../assets/icons/classes/monk.svg?react'
import Paladin from '../assets/icons/classes/paladin.svg?react'
import Ranger from '../assets/icons/classes/ranger.svg?react'
import Rogue from '../assets/icons/classes/rogue.svg?react'
import Sorcerer from '../assets/icons/classes/sorcerer.svg?react'
import Warlock from '../assets/icons/classes/warlock.svg?react'
import Wizard from '../assets/icons/classes/wizard.svg?react'

// Import UI SVGs as React components
import CastingTime from '../assets/icons/ui/casting-time.svg?react'
import Components from '../assets/icons/ui/components.svg?react'
import Duration from '../assets/icons/ui/duration.svg?react'
import Range from '../assets/icons/ui/range.svg?react'

// Import tab SVGs as React components
import SpellsOfTheDay from '../assets/icons/tabs/spells-of-the-day.svg?react'
import Spellbook from '../assets/icons/tabs/spellbook.svg?react'
import SpellDeck from '../assets/icons/tabs/spell-deck.svg?react'
import SpellLibrary from '../assets/icons/tabs/spell-library.svg?react'
import Readme from '../assets/icons/tabs/readme.svg?react'

// Icon registry
const iconRegistry = {
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
}) => {
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
			style={{ color }}
			{...props}
		/>
	)
}

export default Icon
