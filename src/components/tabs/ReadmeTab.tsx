import { Box, Heading, Text, Link, ListRoot, ListItem } from '@chakra-ui/react'

export default function ReadmeTab() {
	return (
		<Box p={6} mx="auto" lineHeight="1.6" color="gray.800" textAlign="left">
			<Heading as="h1" size="lg" mb={4}>
				How to Use Your Spell Library
			</Heading>

			<Text mb={6} color="gray.600">
				A spell management tool for D&D 5e players and DMs. Everything runs in your browser
				and saves locally - no accounts needed.
			</Text>

			<ListRoot ml={12}>
				<ListItem>
					<Heading as="h2" size="md" mb={3}>
						🎲 Spells of the Day
					</Heading>
					<Text mb={4}>
						Start here to discover new spells! Each day features curated spell
						selections organized by class. Perfect for finding inspiration or learning
						about spells you might have missed.
					</Text>
				</ListItem>

				<ListItem>
					<Heading as="h2" size="md" mb={3}>
						📚 Personal Spellbook
					</Heading>
					<Text mb={4}>
						Save your favorite spells for quick reference. Click the bookmark icon on
						any spell to add it to your collection. Great for building character spell
						lists or keeping track of spells you want to remember.
					</Text>
				</ListItem>

				<ListItem>
					<Heading as="h2" size="md" mb={3}>
						⚔️ Spell Deck
					</Heading>
					<Text mb={4}>
						Use this during gameplay to manage your prepared spells and track spell
						slots. "Burn" leveled spells when used, while cantrips stay available for
						unlimited use. Perfect for active sessions.
					</Text>
				</ListItem>

				<ListItem>
					<Heading as="h2" size="md" mb={3}>
						🔍 Complete Spell Database
					</Heading>
					<Text mb={4}>
						Browse all D&D 5e spells with powerful search and filtering. Search by name,
						description, or components. Filter by class, level, or magic school. Each
						spell shows full details including range, duration, and complete
						descriptions.
					</Text>
				</ListItem>
			</ListRoot>

			<Box my={8}>
				<Heading as="h2" size="md" mb={3}>
					💡 Tips
				</Heading>
				<ListRoot ml={12}>
					<ListItem mb={2}>
						All your saved spells and preferences stay in your browser
					</ListItem>
					<ListItem mb={2}>Works offline after the first load</ListItem>
					<ListItem mb={2}>
						Use the search to find spells by effect (like "healing" or "fire")
					</ListItem>
					<ListItem mb={6}>
						Bookmark spells from any tab to build your collection
					</ListItem>
				</ListRoot>
			</Box>

			<Box
				p={4}
				bg="blue.50"
				borderRadius="md"
				borderLeft="4px solid"
				borderColor="blue.400"
				mb={6}>
				<Text fontSize="sm" color="blue.800">
					<strong>Want more details?</strong> Check out the{' '}
					<Link
						href="https://github.com/stephenburks/spell-deck"
						target="_blank"
						rel="noopener noreferrer"
						color="blue.600"
						textDecoration="underline">
						full README
					</Link>{' '}
					for technical details, development info, and project roadmap.
				</Text>
			</Box>

			<Text color="gray.500" fontSize="sm" textAlign="center" mt={6}>
				Built for the D&D community • Open Source • Privacy-first
			</Text>
		</Box>
	)
}
