import { Badge, Card, Heading, Stat, StatLabel } from '@chakra-ui/react'
import { Tooltip } from './ui/tooltip.jsx'
import { Description } from './card-features/description.jsx'

const createBadgeCopy = (spell) => {
	const badges = []
	if (spell.level > 0) badges.push(`Spell Level ${spell.level}`)
	if (spell.school.name) badges.push(`(${spell.school.name})`)
	if (spell.level === 0) badges.push('cantrip')
	return badges.join(' ')
}

export default function SpellCard({ spell }) {
	return (
		<Card.Root className="spell-card" variant="outline">
			{spell.concentration === true && (
				<Tooltip content="Concentration" interactive>
					<p>Concentration Testing</p>
				</Tooltip>
			)}
			<Card.Header>
				<Heading as="h2" size="md">
					{spell.name}
				</Heading>
			</Card.Header>

			<Badge variant="surface">{createBadgeCopy(spell)}</Badge>

			<div className="section-divider"></div>

			<Card.Body>
				<Description spell={spell} />
			</Card.Body>
			<Card.Footer>
				<div className="spell-classes">
					{spell.classes.map((spellClass) => (
						// <Tooltip key={spellClass.index} hasArrow label={`Spell Class: ${spellClass.name}`}>
						<Badge marginRight="0.25rem" variant="subtle" colorScheme="teal">
							{spellClass.name}
						</Badge>
						// </Tooltip>
					))}
				</div>
			</Card.Footer>
		</Card.Root>
	)
}
