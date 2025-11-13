import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { SpellProvider } from './data/context/spellDataContext'
import SpellDeck from './components/spellDeck'
import './css/style.css'

export default function App() {
	return (
		<ChakraProvider value={defaultSystem}>
			<SpellProvider>
				<div className="app-container">
					<SpellDeck />
				</div>
			</SpellProvider>
		</ChakraProvider>
	)
}
