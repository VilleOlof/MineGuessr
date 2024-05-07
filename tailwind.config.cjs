/** @type {import('tailwindcss').Config}*/
const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			fontFamily: {
				'Minecraft': ['Minecraft', 'sans-serif'],
				'MinecraftTen': ['MinecraftTen', 'sans-serif'],
			},
			colors: {
				"mc-text-black": "#1d1e22",
				"mc-standard-bg": "#d0d1d5",
				"mc-standard-shadow": "#5a535d",
				"mc-standard-border": "#28272a"
			}
		},

	},

	plugins: []
};

module.exports = config;
