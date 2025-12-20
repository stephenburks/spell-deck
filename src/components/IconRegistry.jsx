import React from 'react'

// Import spell SVGs as React components
import { ReactComponent as Abjuration } from '../assets/icons/spell/abjuration.svg'
import { ReactComponent as Concentration } from '../assets/icons/spell/concentration.svg'
import { ReactComponent as Conjuration } from '../assets/icons/spell/conjuration.svg'
import { ReactComponent as Consumed } from '../assets/icons/spell/consumed.svg'
import { ReactComponent as Cost } from '../assets/icons/spell/cost.svg'
import { ReactComponent as Divination } from '../assets/icons/spell/divination.svg'
import { ReactComponent as Enchantment } from '../assets/icons/spell/enchantment.svg'
import { ReactComponent as Evocation } from '../assets/icons/spell/evocation.svg'
import { ReactComponent as Illusion } from '../assets/icons/spell/illusion.svg'
import { ReactComponent as Instantaneous } from '../assets/icons/spell/instantaneous.svg'
import { ReactComponent as Material } from '../assets/icons/spell/material.svg'
import { ReactComponent as Necromancy } from '../assets/icons/spell/necromancy.svg'
import { ReactComponent as Octagon } from '../assets/icons/spell/octagon.svg'
import { ReactComponent as Ritual } from '../assets/icons/spell/ritual.svg'
import { ReactComponent as Somatic } from '../assets/icons/spell/somatic.svg'
import { ReactComponent as Transmutation } from '../assets/icons/spell/transmutation.svg'
import { ReactComponent as Upcast } from '../assets/icons/spell/upcast.svg'
import { ReactComponent as Vocal } from '../assets/icons/spell/vocal.svg'

// Import class SVGs as React components
import { ReactComponent as Artificer } from '../assets/icons/classes/artificer.svg'
import { ReactComponent as Barbarian } from '../assets/icons/classes/barbarian.svg'
import { ReactComponent as Bard } from '../assets/icons/classes/bard.svg'
import { ReactComponent as Cleric } from '../assets/icons/classes/cleric.svg'
import { ReactComponent as Druid } from '../assets/icons/classes/druid.svg'
import { ReactComponent as Fighter } from '../assets/icons/classes/fighter.svg'
import { ReactComponent as Monk } from '../assets/icons/classes/monk.svg'
import { ReactComponent as Paladin } from '../assets/icons/classes/paladin.svg'
import { ReactComponent as Ranger } from '../assets/icons/classes/ranger.svg'
import { ReactComponent as Rogue } from '../assets/icons/classes/rogue.svg'
import { ReactComponent as Sorcerer } from '../assets/icons/classes/sorcerer.svg'
import { ReactComponent as Warlock } from '../assets/icons/classes/warlock.svg'
import { ReactComponent as Wizard } from '../assets/icons/classes/wizard.svg'

// Import UI SVGs as React components
import { ReactComponent as CastingTime } from '../assets/icons/ui/casting-time.svg'
import { ReactComponent as Components } from '../assets/icons/ui/components.svg'
import { ReactComponent as Duration } from '../assets/icons/ui/duration.svg'
import { ReactComponent as Range } from '../assets/icons/ui/range.svg'

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
