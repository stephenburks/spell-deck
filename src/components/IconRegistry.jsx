import React from 'react'

// Import spell SVGs as React components
import { ReactComponent as Abjuration } from './icons/spell/abjuration.svg'
import { ReactComponent as Concentration } from './icons/spell/concentration.svg'
import { ReactComponent as Conjuration } from './icons/spell/conjuration.svg'
import { ReactComponent as Consumed } from './icons/spell/consumed.svg'
import { ReactComponent as Cost } from './icons/spell/cost.svg'
import { ReactComponent as Divination } from './icons/spell/divination.svg'
import { ReactComponent as Enchantment } from './icons/spell/enchantment.svg'
import { ReactComponent as Evocation } from './icons/spell/evocation.svg'
import { ReactComponent as Illusion } from './icons/spell/illusion.svg'
import { ReactComponent as Instantaneous } from './icons/spell/instantaneous.svg'
import { ReactComponent as Material } from './icons/spell/material.svg'
import { ReactComponent as Necromancy } from './icons/spell/necromancy.svg'
import { ReactComponent as Octagon } from './icons/spell/octagon.svg'
import { ReactComponent as Ritual } from './icons/spell/ritual.svg'
import { ReactComponent as Somatic } from './icons/spell/somatic.svg'
import { ReactComponent as Transmutation } from './icons/spell/transmutation.svg'
import { ReactComponent as Upcast } from './icons/spell/upcast.svg'
import { ReactComponent as Vocal } from './icons/spell/vocal.svg'

// Import class SVGs as React components
import { ReactComponent as Artificer } from './icons/classes/artificer.svg'
import { ReactComponent as Barbarian } from './icons/classes/barbarian.svg'
import { ReactComponent as Bard } from './icons/classes/bard.svg'
import { ReactComponent as Cleric } from './icons/classes/cleric.svg'
import { ReactComponent as Druid } from './icons/classes/druid.svg'
import { ReactComponent as Fighter } from './icons/classes/fighter.svg'
import { ReactComponent as Monk } from './icons/classes/monk.svg'
import { ReactComponent as Paladin } from './icons/classes/paladin.svg'
import { ReactComponent as Ranger } from './icons/classes/ranger.svg'
import { ReactComponent as Rogue } from './icons/classes/rogue.svg'
import { ReactComponent as Sorcerer } from './icons/classes/sorcerer.svg'
import { ReactComponent as Warlock } from './icons/classes/warlock.svg'
import { ReactComponent as Wizard } from './icons/classes/wizard.svg'

// Import UI SVGs as React components
import { ReactComponent as CastingTime } from './icons/ui/casting-time.svg'
import { ReactComponent as Components } from './icons/ui/components.svg'
import { ReactComponent as Duration } from './icons/ui/duration.svg'
import { ReactComponent as Range } from './icons/ui/range.svg'

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
