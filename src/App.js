import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import SpellInterface from './components/SpellInterface'
import { Toaster } from './components/ui/toaster'
import './css/style.css'

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 2,
			refetchOnWindowFocus: false, // Don't refetch when user returns to tab
			refetchOnReconnect: true, // Do refetch when internet reconnects
			staleTime: 5 * 60 * 1000 // 5 minutes default stale time
		}
	}
})

export default function App() {
	return (
		<ChakraProvider value={defaultSystem}>
			<QueryClientProvider client={queryClient}>
				<div className="app-container">
					<SpellInterface />
					<Toaster />
				</div>
			</QueryClientProvider>
		</ChakraProvider>
	)
}
