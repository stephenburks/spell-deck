import { Box, Heading, Text, Link, Code } from '@chakra-ui/react'

export default function ReadmeTab() {
	return (
		<Box
			p={8}
			mx="auto"
			fontFamily="system-ui, -apple-system, sans-serif"
			lineHeight="1.6"
			color="gray.800"
			textAlign="left">
			<Heading as="h1" size="xl" mb={6} fontWeight="600">
				D&D 5e Spell Deck
			</Heading>

			<Text mb={6}>
				A comprehensive React application for managing Dungeons & Dragons 5th Edition
				spells. Built for players and dungeon masters who want a powerful, intuitive spell
				management system that works entirely in your browser.
			</Text>

			<Heading as="h2" size="lg" mb={4} fontWeight="600">
				Features
			</Heading>

			<Text mb={3}>
				• <strong>Spells of the Day</strong> - Discover new spells with daily randomized
				selections organized by class
			</Text>
			<Text mb={3}>
				• <strong>Personal Spellbook</strong> - Save and organize your favorite spells for
				quick reference
			</Text>
			<Text mb={3}>
				• <strong>Session Deck</strong> - Manage spells during active gameplay with spell
				slot tracking
			</Text>
			<Text mb={3}>
				• <strong>Complete Spell Database</strong> - Search and filter through all D&D 5e
				spells with advanced filtering
			</Text>
			<Text mb={3}>
				• <strong>Class-based Organization</strong> - Browse spells by character class with
				themed styling
			</Text>
			<Text mb={3}>
				• <strong>Detailed Information</strong> - View comprehensive spell details including
				components, range, duration, and descriptions
			</Text>
			<Text mb={3}>
				• <strong>Local Storage</strong> - All your data persists locally in your browser
			</Text>
			<Text mb={6}>
				• <strong>Responsive Design</strong> - Works seamlessly on desktop and mobile
				devices
			</Text>

			<Heading as="h2" size="lg" mb={4} fontWeight="600">
				Getting Started
			</Heading>

			<Text mb={3}>
				1. <strong>Spells of the Day</strong> - Start here to discover new spells with
				curated daily selections
			</Text>
			<Text mb={3}>
				2. <strong>Spellbook</strong> - Save spells you want to remember and organize your
				favorites
			</Text>
			<Text mb={3}>
				3. <strong>Session Deck</strong> - Use during gameplay to track spell usage in
				real-time
			</Text>
			<Text mb={6}>
				4. <strong>Spell Deck</strong> - Explore the complete database with advanced search
				and filtering
			</Text>

			<Heading as="h2" size="lg" mb={4} fontWeight="600">
				Tech Stack
			</Heading>

			<Text mb={3}>
				• <strong>React 18</strong> - Modern UI framework with hooks
			</Text>
			<Text mb={3}>
				• <strong>Chakra UI</strong> - Component library and design system
			</Text>
			<Text mb={3}>
				• <strong>TanStack Query</strong> - Data fetching, caching, and synchronization
			</Text>
			<Text mb={3}>
				• <strong>React Window</strong> - Virtualized lists for performance
			</Text>
			<Text mb={3}>
				• <strong>Fuse.js</strong> - Fuzzy search functionality
			</Text>
			<Text mb={6}>
				• <strong>Local Storage API</strong> - Client-side data persistence
			</Text>

			<Heading as="h2" size="lg" mb={4} fontWeight="600">
				Data Sources & Attribution
			</Heading>

			<Text mb={4}>
				This project wouldn't be possible without these amazing open-source resources:
			</Text>

			<Heading as="h3" size="md" mb={3} fontWeight="600">
				D&D 5e API
			</Heading>
			<Text mb={2}>
				All spell data is sourced from the comprehensive D&D 5e API maintained by the
				community.
			</Text>
			<Text mb={4}>
				<Link
					href="https://github.com/5e-bits/5e-srd-api"
					target="_blank"
					rel="noopener noreferrer"
					color="blue.600"
					textDecoration="underline">
					https://github.com/5e-bits/5e-srd-api
				</Link>
			</Text>

			<Heading as="h3" size="md" mb={3} fontWeight="600">
				D&D Icons & Assets
			</Heading>
			<Text mb={2}>
				Class icons and spell school iconography sourced from the community-maintained icon
				collection.
			</Text>
			<Text mb={6}>
				<Link
					href="https://github.com/intrinsical/tw-dnd"
					target="_blank"
					rel="noopener noreferrer"
					color="blue.600"
					textDecoration="underline">
					https://github.com/intrinsical/tw-dnd
				</Link>
			</Text>

			<Heading as="h2" size="lg" mb={4} fontWeight="600">
				Road Map
			</Heading>

			<Text mb={4}>
				Want to see what's coming next or have ideas for new features? Check out our roadmap
				for upcoming enhancements, technical improvements, and future possibilities.
			</Text>
			<Text mb={6}>
				<Link
					href="https://github.com/stephenburks/spell-deck/blob/main/ideas.md"
					target="_blank"
					rel="noopener noreferrer"
					color="blue.600"
					textDecoration="underline">
					View Road Map (ideas.md)
				</Link>
			</Text>

			<Heading as="h2" size="lg" mb={4} fontWeight="600">
				Development
			</Heading>

			<Text mb={4}>
				This is an open-source project built with modern web technologies. The application
				runs entirely in your browser with no backend required.
			</Text>

			<Text mb={2} fontWeight="600">
				Installation:
			</Text>
			<Code
				display="block"
				p={3}
				bg="gray.100"
				borderRadius="md"
				mb={2}
				fontFamily="monospace">
				npm install
			</Code>

			<Text mb={2} fontWeight="600">
				Development:
			</Text>
			<Code
				display="block"
				p={3}
				bg="gray.100"
				borderRadius="md"
				mb={6}
				fontFamily="monospace">
				npm start
			</Code>

			<Text
				color="gray.600"
				fontSize="sm"
				textAlign="center"
				mt={8}
				pt={6}
				borderTop="1px solid"
				borderColor="gray.200">
				Built with ❤️ for the D&D community • Open Source • No data collection
			</Text>
		</Box>
	)
}
