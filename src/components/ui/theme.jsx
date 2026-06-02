import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const config = defineConfig({
	theme: {
		tokens: {
			fonts: {
				heading: { value: `'Figtree', sans-serif` },
				body: { value: `'Figtree', sans-serif` }
			},
			colors: {
				brand: {
					50: { value: '#f0f4ff' },
					500: { value: '#4299e1' },
					900: { value: '#1a365d' }
				}
			}
		},
		semanticTokens: {
			colors: {
				'bg.surface': {
					value: { _light: 'white', _dark: 'gray.900' }
				},
				'bg.subtle': {
					value: { _light: 'gray.50', _dark: 'gray.800' }
				},
				'text.primary': {
					value: { _light: 'gray.900', _dark: 'gray.50' }
				},
				'text.secondary': {
					value: { _light: 'gray.600', _dark: 'gray.400' }
				},
				'border.default': {
					value: { _light: 'gray.200', _dark: 'gray.700' }
				}
			}
		}
	}
})

export const system = createSystem(defaultConfig, config)
