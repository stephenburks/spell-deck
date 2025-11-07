'use client'

import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import SpellDeck from './components/spellDeck'

export default function App() {
	return (
		<ChakraProvider value={defaultSystem}>
			<SpellDeck />
		</ChakraProvider>
	)
}
// import { ColorModeProvider } from './components/ui/color-mode'
// import { ChakraProvider } from '@chakra-ui/react'

// import SpellDeck from './components/spellDeck'
// import './css/style.css'

// export default function App() {
// 	return (
// 		<ChakraProvider /* theme={theme} */>
// 			{/* <ColorModeScript /* initialColorMode={theme?.config?.initialColorMode} */ /> */}
// 			<div className="App">
// 				<SpellDeck />
// 			</div>
// 		</ChakraProvider>
// 	)
// }

// // Your main App component
// function AppContent() {
// 	return (
// 		<div className="App">
// 			<SpellDeck />
// 		</div>
// 	)
// }

// // Root component with providers
// export default function App() {
// 	return (
// 		<ChakraProvider>
// 			{/* <ColorModeProvider /> */}
// 			<AppContent />
// 		</ChakraProvider>
// 	)
// }

// export function Provider(props) {
// 	return (
// 		<ChakraProvider value={defaultSystem}>
// 			<ColorModeProvider {...props} />
// 		</ChakraProvider>
// 	)
// }

// export const App = ({ Component }) => (
// 	<Provider>
// 		<Component />
// 	</Provider>
// )
