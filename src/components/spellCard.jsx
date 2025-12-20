import { useMemo } from 'react'
import { Badge, Card, Heading, Stat, Button, HStack } from '@chakra-ui/react'
import { Tooltip } from './ui/tooltip.jsx'
import { Description } from './card-features/description.jsx'
import { renderIcon } from './utilityComponents.jsx'

// Helper function to render class icons
const renderClassIcon = (className) => {
	const classKey = className.toLowerCase()

	return <div className={`class-icon class-icon--${classKey}`} aria-label={className} />
}

const createBadgeCopy = (spell) => {
	const badges = []
	if (spell.level > 0) badges.push(`Spell Level ${spell.level}`)
	if (spell.school.name) badges.push(`(${spell.school.name})`)
	if (spell.level === 0) badges.push('cantrip')
	return badges.join(' ')
}

export default function SpellCard({
	spell,
	currentClass,
	context,
	onAction,
	sessionId,
	isCantrip
}) {
	const badgeText = useMemo(() => createBadgeCopy(spell), [spell])

	const spellClass = useMemo(() => {
		if (currentClass) {
			// Find the matching class object from the spell's classes array
			const matchingClass = spell.classes.find(
				(cls) => cls.name.toLowerCase() === currentClass.toLowerCase()
			)
			return matchingClass || spell.classes[0] // Fallback to first if not found
		}
		return spell.classes[0]
	}, [spell, currentClass])

	// Determine if this is a cantrip (level 0 spell)
	const spellIsCantrip = useMemo(() => spell.level === 0, [spell.level])

	// Get context-specific actions
	const getContextActions = useMemo(() => {
		if (!context || !onAction) return []

		switch (context) {
			case 'daily':
				return [
					{
						label: 'Add to Spellbook',
						action: 'addToSpellbook',
						copy: '+ Spellbook',
						variant: 'surface'
					},
					{
						label: 'Add to Session',
						action: 'addToSession',
						copy: '+ Session',
						variant: 'solid'
					}
				]
			case 'spellbook':
				return [
					{
						label: 'Remove from Spellbook',
						action: 'removeFromSpellbook',
						copy: 'Remove Spell',
						variant: 'surface'
					},
					{
						label: 'Add to Session',
						action: 'addToSession',
						copy: '+ Session',
						variant: 'solid'
					}
				]
			case 'session':
				if (spellIsCantrip) {
					return [] // Cantrips have no burn action, just visual indicator
				}
				return [
					{
						label: 'Burn Spell',
						action: 'burnSpell',
						copy: 'Burn Spell',
						variant: 'surface'
					}
				]
			case 'deck':
				return [
					{
						label: 'Add to Spellbook',
						action: 'addToSpellbook',
						copy: '+ Spellbook',
						variant: 'surface'
					},
					{
						label: 'Add to Session',
						action: 'addToSession',
						copy: '+ Session',
						variant: 'solid'
					}
				]
			default:
				return []
		}
	}, [context, onAction, spellIsCantrip])

	// Handle action button clicks
	const handleAction = (actionType) => {
		if (onAction) {
			onAction(actionType, spell, sessionId)
		}
	}

	// Get container class with cantrip styling for session context
	const getContainerClass = () => {
		let baseClass = `spell-card__container spell-card__container-${spellClass.index}`

		if (context === 'session' && spellIsCantrip) {
			baseClass += ' spell-card__container--cantrip'
		}

		return baseClass
	}

	return (
		<div className={getContainerClass()}>
			<div className="spell-card-inner">
				<Card.Root className="spell-card">
					{spell.concentration === true && (
						<Tooltip content="Concentration Required" interactive>
							<div className="concentration-indicator">
								{renderIcon('ConcentrationIcon')}
							</div>
						</Tooltip>
					)}

					<div className="spell-card__level">
						<Tooltip content="Spell Level" interactive>
							<Stat.Root>
								<Stat.ValueText>
									{spell.level === 0 ? 'C' : spell.level}
								</Stat.ValueText>
							</Stat.Root>
						</Tooltip>
					</div>

					<Card.Header>
						<Heading as="h2" size="md">
							{spell.name}
						</Heading>

						<Badge variant="surface">{badgeText}</Badge>
					</Card.Header>

					<div className="section-divider"></div>

					<Card.Body>
						<div className="stats-grid">
							<Tooltip showArrow content="Casting Time">
								<Stat.Root>
									{renderIcon('CastingTimeIcon')}
									<Stat.ValueText>{spell.casting_time}</Stat.ValueText>
								</Stat.Root>
							</Tooltip>
							<Tooltip showArrow content="Range">
								<Stat.Root>
									{renderIcon('RangeIcon')}
									<Stat.ValueText>{spell.range}</Stat.ValueText>
								</Stat.Root>
							</Tooltip>
							<Tooltip showArrow content="Components">
								<Stat.Root>
									{renderIcon('ComponentIcon')}
									<Stat.ValueText>{spell.components.join(', ')}</Stat.ValueText>
								</Stat.Root>
							</Tooltip>
							<Tooltip showArrow content="Duration">
								<Stat.Root>
									{renderIcon('DurationIcon')}
									<Stat.ValueText>{spell.duration}</Stat.ValueText>
								</Stat.Root>
							</Tooltip>
						</div>
						<Description spell={spell} />
					</Card.Body>
					<Card.Footer>
						{/* <div className="spell-card__level">
							<Tooltip content="Spell Level" interactive>
								<Stat.Root>
									<Stat.ValueText>
										{spell.level === 0 ? 'C' : spell.level}
									</Stat.ValueText>
								</Stat.Root>
							</Tooltip>
						</div> */}
						<div className="spell-card__classes">
							{spell.classes && spell.classes.length > 0 ? (
								spell.classes.map((classItem, index) => (
									<Tooltip
										key={classItem.index || index}
										content={`Spell Class: ${classItem.name}`}>
										<div
											className={`class-icon-container class-icon-container--${classItem.name.toLowerCase()}`}>
											{renderClassIcon(classItem.name)}
										</div>
									</Tooltip>
								))
							) : (
								<Badge marginRight="0.25rem" variant="outline" size="md">
									Unknown Class
								</Badge>
							)}
						</div>

						{/* Cantrip indicator for session context */}
						{context === 'session' && spellIsCantrip && (
							<div className="spell-card__cantrip-indicator">
								<Badge variant="solid" colorScheme="green" size="sm">
									Unlimited Use
								</Badge>
							</div>
						)}

						{/* Context-specific action buttons */}
						{getContextActions.length > 0 && (
							<div className="spell-card__actions">
								<HStack spacing={2}>
									{getContextActions.map((action, index) => (
										<Button
											key={index}
											size="sm"
											variant={action.variant}
											onClick={() => handleAction(action.action)}>
											{action.copy}
										</Button>
									))}
								</HStack>
							</div>
						)}
					</Card.Footer>
				</Card.Root>
			</div>
		</div>
	)
}
