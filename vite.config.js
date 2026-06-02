import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
	plugins: [react()],
	base: '/spell-deck/',
	build: {
		outDir: 'build'
	},
	test: {
		environment: 'jsdom',
		setupFiles: ['./src/setupTests.ts'],
		globals: true
	}
})
