import { Badge, Card, CardBody, CardFooter, CardHeader, Heading, Stat, StatNumber } from "@chakra-ui/react"
import { Tooltip } from "./components/ui/tooltip.jsx"
import { renderSVG } from "./utilityComponents.jsx";

const createBadgeCopy = (spell) => {
  const badges = [];
  if (spell.level > 0) badges.push(`Spell Level ${spell.level}`);
  if (spell.school.name) badges.push(`(${spell.school.name})`);
  if (spell.level === 0) badges.push("cantrip");

  const badgeString = badges.join(" ");
  return badgeString;
}

export default function SpellCard({ spell }) {
  const pages = [];
  const spellDesc = spell.desc.join("\n\n");
  // spell.desc.forEach((paragraph) => {
  //   spellDesc.join({paragraph});
  // });
  console.log(spellDesc);


  return (
    <Card className="spell-card" variant="outline">
      <CardHeader>
        <Heading as="h2" size="md">{spell.name}</Heading>
      </CardHeader>
      
      <Badge variant="surface">{createBadgeCopy(spell)}</Badge>
      
      <div className="section-divider"></div>
      
      <CardBody>
        <div className="stats">
          <Tooltip showArrow content="Casting Time">
            <Stat>
              {renderSVG("CastingTimeIcon")}
              <StatNumber>{spell.casting_time}</StatNumber>
            </Stat>
          </Tooltip>
          <Tooltip showArrow content="Range">
            <Stat>
              {renderSVG("RangeIcon")}
              <StatNumber>{spell.range}</StatNumber>
            </Stat>
          </Tooltip>
          <Tooltip showArrow content="Components">
            <Stat>
              {renderSVG("ComponentIcon")}
              <StatNumber>{spell.components.join(", ")}</StatNumber>
            </Stat>
          </Tooltip>
          <Tooltip showArrow content="Duration">
            <Stat>
              {renderSVG("DurationIcon")}
              <StatNumber>{spell.duration}</StatNumber>
            </Stat>
          </Tooltip>
        </div>
        <div className="description">
            {console.log(spell.desc)}
            {console.log(spell.desc.length)}
            {spell.desc.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
        </div>
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
            <Tooltip key={spellClass.index} showArrow content={'Spell Class: ' + spellClass.name}>
              <Badge marginRight="0.25rem" variant="subtle" colorScheme="teal">
                {spellClass.name}
              </Badge>
            </Tooltip>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}