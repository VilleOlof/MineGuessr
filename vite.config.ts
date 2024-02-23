import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		browser: {
			enabled: true,
			headless: true,
			name: 'chrome'
		}
	},
	server: {
		fs: {
			allow: ['.']
		}
	}
});
