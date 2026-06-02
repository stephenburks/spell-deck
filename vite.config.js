import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
	plugins: [react(), svgr({ include: '**/*.svg' })],
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
