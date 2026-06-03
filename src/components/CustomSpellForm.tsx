import { useState } from 'react'
import {
	Box,
	Button,
	Field,
	Input,
	Textarea,
	Select,
	Checkbox,
	HStack,
	VStack,
	createListCollection,
	AccordionRoot,
	AccordionItem,
	AccordionItemTrigger,
	AccordionItemContent,
	AccordionItemIndicator,
	Text
} from '@chakra-ui/react'
import Icon from './IconRegistry'
import type { Spell, SpellSchool, SpellClass } from '../types'

const SCHOOLS = [
	'Abjuration', 'Conjuration', 'Divination', 'Enchantment',
	'Evocation', 'Illusion', 'Necromancy', 'Transmutation'
]

const CLASS_NAMES = [
	'Artificer', 'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter',
	'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'
]

const LEVEL_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
	label: i === 0 ? 'Cantrip (0)' : `Level ${i}`,
	value: i.toString()
}))

const schoolCollection = createListCollection({
	items: SCHOOLS.map((s) => ({ label: s, value: s.toLowerCase() }))
})

const levelCollection = createListCollection({ items: LEVEL_OPTIONS })

interface CustomSpellFormProps {
	initialSpell?: Spell | null
	onSave: (spell: Spell) => void
	onCancel: () => void
}

export default function CustomSpellForm({
	initialSpell,
	onSave,
	onCancel
}: CustomSpellFormProps) {
	const isEditing = Boolean(initialSpell)

	const [name, setName] = useState(initialSpell?.name || '')
	const [level, setLevel] = useState((initialSpell?.level ?? 1).toString())
	const [school, setSchool] = useState(initialSpell?.school?.name?.toLowerCase() || 'evocation')
	const [castingTime, setCastingTime] = useState(initialSpell?.casting_time || '1 action')
	const [range, setRange] = useState(initialSpell?.range || 'Touch')
	const [duration, setDuration] = useState(initialSpell?.duration || 'Instantaneous')
	const [componentsV, setComponentsV] = useState(
		initialSpell?.components?.includes('V') ?? true
	)
	const [componentsS, setComponentsS] = useState(
		initialSpell?.components?.includes('S') ?? true
	)
	const [componentsM, setComponentsM] = useState(
		initialSpell?.components?.includes('M') ?? false
	)
	const [material, setMaterial] = useState(initialSpell?.material || '')
	const [ritual, setRitual] = useState(initialSpell?.ritual ?? false)
	const [concentration, setConcentration] = useState(initialSpell?.concentration ?? false)
	const [description, setDescription] = useState(initialSpell?.desc?.join('\n\n') || '')
	const [higherLevel, setHigherLevel] = useState(initialSpell?.higher_level?.join('\n\n') || '')
	const [attackType, setAttackType] = useState(initialSpell?.attack_type || '')
	const [selectedClasses, setSelectedClasses] = useState<string[]>(
		initialSpell?.classes?.map((c) => c.name) || []
	)

	const [nameError, setNameError] = useState('')
	const [descError, setDescError] = useState('')

	const validate = (): boolean => {
		let valid = true
		if (!name.trim()) {
			setNameError('Spell name is required')
			valid = false
		} else {
			setNameError('')
		}
		if (!description.trim()) {
			setDescError('Description is required')
			valid = false
		} else {
			setDescError('')
		}
		return valid
	}

	const toggleClass = (className: string) => {
		setSelectedClasses((prev) =>
			prev.includes(className)
				? prev.filter((c) => c !== className)
				: [...prev, className]
		)
	}

	const buildComponents = (): string[] => {
		const comps: string[] = []
		if (componentsV) comps.push('V')
		if (componentsS) comps.push('S')
		if (componentsM) comps.push('M')
		return comps
	}

	const handleSubmit = () => {
		if (!validate()) return

		const spell: Spell = {
			index: initialSpell?.index || '',
			name: name.trim(),
			level: parseInt(level, 10),
			school: {
				index: school,
				name: school.charAt(0).toUpperCase() + school.slice(1)
			} as SpellSchool,
			casting_time: castingTime,
			range,
			duration,
			components: buildComponents(),
			desc: description.trim() ? description.trim().split('\n\n').filter(Boolean) : [],
			higher_level: higherLevel.trim()
				? higherLevel.trim().split('\n\n').filter(Boolean)
				: undefined,
			ritual,
			concentration,
			material: material.trim() || undefined,
			attack_type: attackType.trim() || undefined,
			classes: selectedClasses.map((name) => ({
				index: name.toLowerCase(),
				name
			}) as SpellClass)
		}

		onSave(spell)
	}

	return (
		<VStack gap={4} align="stretch" maxH="70vh" overflowY="auto" px={1}>
			{/* Required fields */}
			<Field.Root required invalid={!!nameError}>
				<Field.Label>Spell Name</Field.Label>
				<Input
					value={name}
					onChange={(e) => { setName(e.target.value); setNameError('') }}
					placeholder="e.g. Ray of Sickness"
					autoFocus
				/>
				{nameError && <Field.ErrorText>{nameError}</Field.ErrorText>}
			</Field.Root>

			<HStack gap={4}>
				<Field.Root required flex="1">
					<Field.Label>Level</Field.Label>
					<Select.Root
						collection={levelCollection}
						value={[level]}
						onValueChange={(details) => setLevel(details.value[0])}
					>
						<Select.HiddenSelect />
						<Select.Control>
							<Select.Trigger>
								<Select.ValueText />
							</Select.Trigger>
							<Select.IndicatorGroup>
								<Select.Indicator />
							</Select.IndicatorGroup>
						</Select.Control>
						<Select.Positioner>
							<Select.Content>
								{LEVEL_OPTIONS.map((opt) => (
									<Select.Item key={opt.value} item={opt}>
										{opt.label}
									</Select.Item>
								))}
							</Select.Content>
						</Select.Positioner>
					</Select.Root>
				</Field.Root>

				<Field.Root required flex="1">
					<Field.Label>School</Field.Label>
					<Select.Root
						collection={schoolCollection}
						value={[school]}
						onValueChange={(details) => setSchool(details.value[0])}
					>
						<Select.HiddenSelect />
						<Select.Control>
							<Select.Trigger>
								<Select.ValueText />
							</Select.Trigger>
							<Select.IndicatorGroup>
								<Select.Indicator />
							</Select.IndicatorGroup>
						</Select.Control>
						<Select.Positioner>
							<Select.Content>
								{SCHOOLS.map((s) => (
									<Select.Item key={s.toLowerCase()} item={{ label: s, value: s.toLowerCase() }}>
										<HStack gap={1}>
											<Icon name={s.toLowerCase()} folder="spell" size={16} />
											<Text>{s}</Text>
										</HStack>
									</Select.Item>
								))}
							</Select.Content>
						</Select.Positioner>
					</Select.Root>
				</Field.Root>
			</HStack>

			<HStack gap={4}>
				<Field.Root required flex="1">
					<Field.Label>Casting Time</Field.Label>
					<Input
						value={castingTime}
						onChange={(e) => setCastingTime(e.target.value)}
						placeholder="1 action"
					/>
				</Field.Root>
				<Field.Root required flex="1">
					<Field.Label>Range</Field.Label>
					<Input
						value={range}
						onChange={(e) => setRange(e.target.value)}
						placeholder="Touch"
					/>
				</Field.Root>
			</HStack>

			<Field.Root required>
				<Field.Label>Duration</Field.Label>
				<Input
					value={duration}
					onChange={(e) => setDuration(e.target.value)}
					placeholder="Instantaneous"
				/>
			</Field.Root>

			{/* Components */}
			<Field.Root>
				<Field.Label>Components</Field.Label>
				<HStack gap={4}>
					<Checkbox checked={componentsV} onCheckedChange={(e) => setComponentsV(!!e.checked)}>
						Verbal (V)
					</Checkbox>
					<Checkbox checked={componentsS} onCheckedChange={(e) => setComponentsS(!!e.checked)}>
						Somatic (S)
					</Checkbox>
					<Checkbox checked={componentsM} onCheckedChange={(e) => setComponentsM(!!e.checked)}>
						Material (M)
					</Checkbox>
				</HStack>
			</Field.Root>

			{componentsM && (
				<Field.Root>
					<Field.Label>Material Component</Field.Label>
					<Input
						value={material}
						onChange={(e) => setMaterial(e.target.value)}
						placeholder="A diamond worth 300gp"
					/>
				</Field.Root>
			)}

			<HStack gap={4}>
				<Checkbox checked={ritual} onCheckedChange={(e) => setRitual(!!e.checked)}>
					Ritual
				</Checkbox>
				<Checkbox checked={concentration} onCheckedChange={(e) => setConcentration(!!e.checked)}>
					Concentration
				</Checkbox>
			</HStack>

			{/* Description */}
			<Field.Root required invalid={!!descError}>
				<Field.Label>Description</Field.Label>
				<Textarea
					value={description}
					onChange={(e) => { setDescription(e.target.value); setDescError('') }}
					placeholder="Describe the spell effect..."
					rows={4}
				/>
				{descError && <Field.ErrorText>{descError}</Field.ErrorText>}
				<Field.HelperText>Separate paragraphs with blank lines</Field.HelperText>
			</Field.Root>

			{/* Higher Level */}
			<Field.Root>
				<Field.Label>At Higher Levels</Field.Label>
				<Textarea
					value={higherLevel}
					onChange={(e) => setHigherLevel(e.target.value)}
					placeholder="When cast at higher levels..."
					rows={2}
				/>
			</Field.Root>

			{/* Attack Type */}
			<Field.Root>
				<Field.Label>Attack Type</Field.Label>
				<Input
					value={attackType}
					onChange={(e) => setAttackType(e.target.value)}
					placeholder="ranged, melee, or leave blank"
				/>
			</Field.Root>

			{/* Classes */}
			<Field.Root>
				<Field.Label>Classes</Field.Label>
				<Box>
					<HStack gap={1} flexWrap="wrap">
						{CLASS_NAMES.map((cls) => {
							const isSelected = selectedClasses.includes(cls)
							return (
								<Button
									key={cls}
									size="xs"
									variant={isSelected ? 'solid' : 'outline'}
									onClick={() => toggleClass(cls)}
									aria-pressed={isSelected}
								>
									<Icon name={cls.toLowerCase()} folder="classes" size={16} />
									<Text ml={1}>{cls}</Text>
								</Button>
							)
						})}
					</HStack>
				</Box>
			</Field.Root>

			{/* Form actions */}
			<HStack gap={2} justifyContent="flex-end" pt={2}>
				<Button variant="ghost" onClick={onCancel}>
					Cancel
				</Button>
				<Button colorPalette="blue" onClick={handleSubmit}>
					{isEditing ? 'Save Changes' : 'Create Spell'}
				</Button>
			</HStack>
		</VStack>
	)
}
