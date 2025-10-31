
import { ChakraProvider } from '@chakra-ui/react'

import SpellDeck from './components/spellDeck'
import './css/style.css'

// Your main App component
function AppContent() {
	return (
		<div className="App">
			<SpellDeck />
		</div>
	)
}

// Root component with providers
export default function App() {
	return (
		<ChakraProvider>
			<AppContent />
		</ChakraProvider>
	)
}
