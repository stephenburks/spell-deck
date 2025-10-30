import {
	Badge,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Heading,
	Stat,
	StatNumber
} from '@chakra-ui/react'
import { Tooltip } from './components/ui/tooltip.jsx'
import { renderIcon } from './utilityComponents.jsx'
import { Description } from './components/card-features/description.jsx'

const createBadgeCopy = (spell) => {
	const badges = []
	if (spell.level > 0) badges.push(`Spell Level ${spell.level}`)
	if (spell.school.name) badges.push(`(${spell.school.name})`)
	if (spell.level === 0) badges.push('cantrip')

	const badgeString = badges.join(' ')
	return badgeString
}

export default function SpellCard({ spell }) {
	return (
		<Card className="spell-card" variant="outline">

			{spell.concentration === true && (
				<Tooltip showArrow content="Concentration Required">
					<div className="concentration-icon">
						{renderIcon('ConcentrationIcon')}
					</div>
				</Tooltip>
			)}
			
			<CardHeader>
				<Heading as="h2" size="md">
					{spell.name}
				</Heading>
			</CardHeader>

			<Badge variant="surface">{createBadgeCopy(spell)}</Badge>

			<div className="section-divider"></div>

			<CardBody>
				<div className="stats">
					<Tooltip showArrow content="Casting Time">
						<Stat>
							{renderIcon('CastingTimeIcon')}
							<StatNumber>{spell.casting_time}</StatNumber>
						</Stat>
					</Tooltip>
					<Tooltip showArrow content="Range">
						<Stat>
							{renderIcon('RangeIcon')}
							<StatNumber>{spell.range}</StatNumber>
						</Stat>
					</Tooltip>
					<Tooltip showArrow content="Components">
						<Stat>
							{renderIcon('ComponentIcon')}
							<StatNumber>
								{spell.components.join(', ')}
							</StatNumber>
						</Stat>
					</Tooltip>
					<Tooltip showArrow content="Duration">
						<Stat>
							{renderIcon('DurationIcon')}
							<StatNumber>{spell.duration}</StatNumber>
						</Stat>
					</Tooltip>
				</div>
				<Description spell={spell} />
			</CardBody>
			<CardFooter>
				<div className="spell-level">
					<Tooltip showArrow content="Spell Level">
						<Stat>
							<StatNumber>{spell.level}</StatNumber>
						</Stat>
					</Tooltip>
				</div>
				<div className="spell-classes">
					{spell.classes.map((spellClass) => (
						<Tooltip
							key={spellClass.index}
							showArrow
							content={'Spell Class: ' + spellClass.name}>
							<Badge
								marginRight="0.25rem"
								variant="subtle"
								colorScheme="teal">
								{spellClass.name}
							</Badge>
						</Tooltip>
					))}
				</div>
			</CardFooter>
		</Card>
	)
}
