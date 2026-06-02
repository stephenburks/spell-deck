export interface SpellSchool {
	index: string
	name: string
}

export interface SpellClass {
	index: string
	name: string
}

export interface SpellDamage {
	damage_type?: SpellSchool
	damage_at_slot_level?: Record<number, string>
	damage_at_character_level?: Record<number, string>
}

export interface Spell {
	index: string
	name: string
	desc: string[]
	higher_level?: string[]
	range: string
	components: string[]
	material?: string
	ritual: boolean
	duration: string
	concentration: boolean
	casting_time: string
	level: number
	school: SpellSchool
	classes: SpellClass[]
	subclasses?: SpellClass[]
	attack_type?: string
	damage?: SpellDamage
	dc?: {
		dc_type: SpellSchool
		dc_success: string
	}
	area_of_effect?: {
		type: string
		size: number
	}
	heal_at_slot_level?: Record<string, string>
}

export interface SessionSpell extends Spell {
	sessionId: string
}

export interface SpellCollection {
	spells: (Spell | SessionSpell)[]
	lastModified: number
}

export interface DailySpellCollection {
	spells: Spell[]
	generatedDate: string | null
	lastModified: number
}
