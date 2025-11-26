import { Badge, Card, Heading, Stat } from '@chakra-ui/react'
import { Tooltip } from './ui/tooltip.jsx'
import { Description } from './card-features/description.jsx'
import { renderIcon } from './utilityComponents.jsx'

const createBadgeCopy = (spell) => {
	const badges = []
	if (spell.level > 0) badges.push(`Spell Level ${spell.level}`)
	if (spell.school.name) badges.push(`(${spell.school.name})`)
	if (spell.level === 0) badges.push('cantrip')
	return badges.join(' ')
}

export default function SpellCard({ spell }) {
	const spellClass = spell.classes[0]

	return (
		<div className={`spell-card__container spell-card__container-` + spellClass.index}>
			<div class="spell-card-inner">
				<Card.Root className="spell-card">
					{spell.concentration === true && (
						<Tooltip content="Concentration Required" interactive>
							<div className="concentration-indicator">{renderIcon('ConcentrationIcon')}</div>
						</Tooltip>
					)}

					<Card.Header>
						<Heading as="h2" size="md">
							{spell.name}
						</Heading>

						<Badge variant="surface">{createBadgeCopy(spell)}</Badge>
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
						<div className="spell-card__level">
							<Tooltip content="Spell Level" interactive>
								<Stat.Root>
									<Stat.ValueText>{spell.level}</Stat.ValueText>
								</Stat.Root>
							</Tooltip>
						</div>
						<div className="spell-card__classes">
							<Tooltip key={spellClass.index} content={'Spell Class: ' + spellClass.name}>
								<Badge marginRight="0.25rem" variant="outline" size="md">
									{spellClass.name}
								</Badge>
							</Tooltip>
						</div>
					</Card.Footer>
				</Card.Root>
			</div>
		</div>
	)
}
