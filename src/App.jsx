import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ChakraProvider } from '@chakra-ui/react'
import { ColorModeProvider } from './components/ui/color-mode'
import { CampaignProvider } from './components/CampaignContext'
import ErrorBoundary from './components/ErrorBoundary'
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
					<CampaignProvider>
						<a
							href="#main-content"
							style={{
								position: 'absolute',
								left: '-9999px',
								zIndex: 999,
								padding: '1em',
								background: 'var(--chakra-colors-bg-surface)',
								color: 'var(--chakra-colors-text-primary)'
							}}
							onFocus={(e) => {
								e.target.style.left = '1em'
							}}
							onBlur={(e) => {
								e.target.style.left = '-9999px'
							}}
						>
							Skip to main content
						</a>
						<main id="main-content" className="app-container">
							<ErrorBoundary>
								<SpellInterface />
							</ErrorBoundary>
							<Toaster />
						</main>
					</CampaignProvider>
				</QueryClientProvider>
			</ColorModeProvider>
		</ChakraProvider>
	)
}
