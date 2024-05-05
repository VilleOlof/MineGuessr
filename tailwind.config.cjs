/** @type {import('tailwindcss').Config}*/
const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			fontFamily: {
				'Minecraft': ['Minecraft', 'sans-serif'],
				'MinecraftTen': ['MinecraftTen', 'sans-serif'],
			}
		}
	},

	plugins: []
};

module.exports = config;
