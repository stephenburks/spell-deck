import { useState, useEffect } from 'react'
import {
	Box,
	Button,
	Heading,
	HStack,
	Select,
	Text,
	VStack,
	createListCollection
} from '@chakra-ui/react'
import { getSlotsForLevel, CASTER_TYPES, STORAGE_KEY } from '../utils/spellSlots'

const loadSlotState = () => {
	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		if (stored) return JSON.parse(stored)
	} catch {}
	return { characterLevel: 5, casterType: 'full', usedSlots: {} }
}

const saveSlotState = (state) => {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

const levelCollection = createListCollection({
	items: Array.from({ length: 20 }, (_, i) => ({
		value: String(i + 1),
		label: String(i + 1)
	}))
})

const casterCollection = createListCollection({ items: CASTER_TYPES })

function getOrdinal(n) {
	const s = ['th', 'st', 'nd', 'rd']
	const v = n % 100
	return s[(v - 20) % 10] || s[v] || s[0]
}

export default function SpellSlotTracker() {
	const [state, setState] = useState(loadSlotState)
	const slots = getSlotsForLevel(state.characterLevel, state.casterType)

	useEffect(() => {
		saveSlotState(state)
	}, [state])

	useEffect(() => {
		const handler = () => setState(loadSlotState())
		window.addEventListener('spell-deck:slot-changed', handler)
		return () => window.removeEventListener('spell-deck:slot-changed', handler)
	}, [])

	const toggleSlot = (spellLevel, slotIndex) => {
		setState((prev) => {
			const key = spellLevel
			const used = prev.usedSlots[key] || 0
			const alreadyUsed = slotIndex < used
			return {
				...prev,
				usedSlots: {
					...prev.usedSlots,
					[key]: alreadyUsed ? used - 1 : slotIndex + 1
				}
			}
		})
	}

	const resetSlots = () => {
		setState((prev) => ({ ...prev, usedSlots: {} }))
	}

	const usedCount = Object.values(state.usedSlots).reduce((a, b) => a + b, 0)
	const totalSlots = slots.reduce((a, b) => a + b, 0)

	return (
		<Box
			p={4}
			borderWidth="1px"
			borderColor="border.default"
			borderRadius="md"
			bg="bg.surface">
			<VStack gap={3} align="stretch">
				<HStack justifyContent="space-between" alignItems="center">
					<Heading as="h3" size="md">
						Spell Slots
					</Heading>
					<Text fontSize="sm" color="text.secondary">
						{usedCount} / {totalSlots} used
					</Text>
				</HStack>

				<HStack gap={3}>
					<Select.Root
						collection={levelCollection}
						size="sm"
						value={[String(state.characterLevel)]}
						onValueChange={(e) =>
							setState((prev) => ({
								...prev,
								characterLevel: Number(e.value[0])
							}))
						}
						width="80px">
						<Select.Label srOnly>Character level</Select.Label>
						<Select.Trigger>
							<Select.ValueText />
						</Select.Trigger>
						<Select.Content>
							{levelCollection.items.map((item) => (
								<Select.Item item={item} key={item.value}>
									{item.label}
								</Select.Item>
							))}
						</Select.Content>
					</Select.Root>

					<Select.Root
						collection={casterCollection}
						size="sm"
						value={[state.casterType]}
						onValueChange={(e) =>
							setState((prev) => ({
								...prev,
								casterType: e.value[0],
								usedSlots: {}
							}))
						}
						flex="1">
						<Select.Label srOnly>Caster type</Select.Label>
						<Select.Trigger>
							<Select.ValueText />
						</Select.Trigger>
						<Select.Content>
							{CASTER_TYPES.map((item) => (
								<Select.Item item={item} key={item.value}>
									{item.label}
								</Select.Item>
							))}
						</Select.Content>
					</Select.Root>
				</HStack>

				{state.casterType === 'warlock' ? (
					<HStack gap={1} flexWrap="wrap">
						{slots.map((count, levelIndex) => {
							if (count === 0) return null
							const spellLevel = levelIndex + 1
							const used = state.usedSlots[spellLevel] || 0
							return (
								<Box key={spellLevel}>
									<Text fontSize="xs" color="text.secondary" mb={1}>
										Lv {spellLevel} slots
									</Text>
									<HStack gap={1}>
										{Array.from({ length: count }).map((_, i) => (
											<Box
												key={i}
												as="button"
												onClick={() => toggleSlot(spellLevel, i)}
												w="32px"
												h="32px"
												borderRadius="md"
												borderWidth="2px"
												borderColor={
													i < used ? 'purple.500' : 'border.default'
												}
												bg={i < used ? 'purple.500' : 'transparent'}
												transition="all 0.15s"
												cursor="pointer"
												_hover={{ borderColor: 'purple.400' }}
												aria-label={`${spellLevel}${getOrdinal(spellLevel)} level slot ${i + 1} of ${count} — ${i < used ? 'used' : 'available'}`}
											/>
										))}
									</HStack>
								</Box>
							)
						})}
					</HStack>
				) : (
					<VStack gap={2} align="stretch">
						{slots.map((count, levelIndex) => {
							if (count === 0) return null
							const spellLevel = levelIndex + 1
							const used = state.usedSlots[spellLevel] || 0
							return (
								<HStack key={spellLevel} gap={2} alignItems="center">
									<Text
										fontSize="sm"
										minW="50px"
										color="text.secondary">
										Lv {spellLevel}
									</Text>
									<HStack gap={1}>
										{Array.from({ length: count }).map((_, i) => (
											<Box
												key={i}
												as="button"
												onClick={() => toggleSlot(spellLevel, i)}
												w="28px"
												h="28px"
												borderRadius="sm"
												borderWidth="2px"
												borderColor={
													i < used ? 'blue.500' : 'border.default'
												}
												bg={i < used ? 'blue.500' : 'transparent'}
												transition="all 0.15s"
												cursor="pointer"
												_hover={{ borderColor: 'blue.400' }}
												aria-label={`${spellLevel}${getOrdinal(spellLevel)} level slot ${i + 1} of ${count} — ${i < used ? 'used' : 'available'}`}
											/>
										))}
									</HStack>
								</HStack>
							)
						})}
					</VStack>
				)}

				{totalSlots > 0 && usedCount > 0 && (
					<Button
						size="xs"
						variant="ghost"
						onClick={resetSlots}
						alignSelf="flex-end">
						Reset slots
					</Button>
				)}
			</VStack>
		</Box>
	)
}
