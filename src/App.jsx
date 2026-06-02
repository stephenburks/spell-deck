import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ChakraProvider } from '@chakra-ui/react'
import { ColorModeProvider } from './components/ui/color-mode'
import { system } from './components/ui/theme'
import SpellInterface from './components/SpellInterface'
import { Toaster } from './components/ui/toaster'
import './css/style.css'

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 2,
			refetchOnWindowFocus: false,
			refetchOnReconnect: true,
			staleTime: 5 * 60 * 1000
		}
	}
})

export default function App() {
	return (
		<ChakraProvider value={system}>
			<ColorModeProvider>
				<QueryClientProvider client={queryClient}>
					<div className="app-container">
						<SpellInterface />
						<Toaster />
					</div>
				</QueryClientProvider>
			</ColorModeProvider>
		</ChakraProvider>
	)
}
