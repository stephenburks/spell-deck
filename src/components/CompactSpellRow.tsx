import { Badge, HStack, Button, Text, Box } from '@chakra-ui/react'
import { Tooltip } from './ui/tooltip.jsx'
import Icon from './IconRegistry'
import type { Spell } from '../types'

export type CompactSpellContext = 'daily' | 'library' | 'book' | 'deck' | 'custom'

interface CompactSpellRowProps {
	spell: Spell
	context?: CompactSpellContext
	onAction?: (actionType: string, spell: Spell) => void
	sessionId?: string
}

export default function CompactSpellRow({
	spell,
	context,
	onAction,
	sessionId
}: CompactSpellRowProps) {
	const levelLabel = spell.level === 0 ? 'Cantrip' : `Lv ${spell.level}`
	const schoolClass = spell.school?.name?.toLowerCase()

	const getActions = () => {
		if (!context || !onAction) return []

		switch (context) {
			case 'daily':
				return [
					{ label: 'Add to Spellbook', action: 'addToSpellbook', copy: '+ Spellbook', variant: 'surface' },
					{ label: 'Add to Session', action: 'addToSession', copy: '+ Session', variant: 'subtle' }
				]
			case 'library':
				return [
					{ label: 'Add to Spellbook', action: 'addToSpellbook', copy: 'Spellbook', variant: 'surface' },
					{ label: 'Add to Session', action: 'addToSession', copy: 'Session', variant: 'subtle' }
				]
			case 'book':
				return [
					{ label: 'Remove from Spellbook', action: 'removeFromSpellbook', copy: 'Remove', variant: 'subtle' }
				]
		case 'deck':
			return [
				{ label: 'Remove from Deck', action: 'removeFromSessionDeck', copy: 'Remove', variant: 'subtle' },
				{ label: 'Burn Spell', action: 'burnSpell', copy: 'Burn', variant: 'surface' }
			]
		case 'custom':
			return [
				{ label: 'Edit Spell', action: 'editCustomSpell', copy: 'Edit', variant: 'surface' },
				{ label: 'Delete Spell', action: 'deleteCustomSpell', copy: 'Delete', variant: 'subtle' }
			]
		default:
				return []
		}
	}

	const actions = getActions()

	return (
		<Box
			className="compact-spell-row"
			display="flex"
			alignItems="center"
			justifyContent="space-between"
			py={2}
			px={4}
			borderWidth="1px"
			borderColor="border.default"
			borderRadius="md"
			bg="bg.surface"
			gap={3}
		>
			<HStack gap={3} flex="1" minW={0}>
				<Badge variant="subtle" minW="48px" textAlign="center">
					{levelLabel}
				</Badge>

				{schoolClass && (
					<Icon name={schoolClass} folder="spell" size={20} aria-hidden />
				)}

				<Text fontWeight="semibold" truncate>
					{spell.name}
				</Text>

			<Text fontSize="sm" color="text.secondary" hideBelow="md">
				{spell.school?.name}
			</Text>

			{spell.index?.startsWith('custom-') && (
				<Badge variant="solid" colorPalette="purple" size="sm">
					Custom
				</Badge>
			)}
		</HStack>

			<HStack gap={1} flexShrink={0}>
				{actions.map((act) => (
					<Tooltip key={act.action} content={act.label}>
						<Button
							size="xs"
							variant={act.variant}
							onClick={() => onAction(act.action, spell)}
						>
							{act.copy}
						</Button>
					</Tooltip>
				))}
			</HStack>
		</Box>
	)
}
