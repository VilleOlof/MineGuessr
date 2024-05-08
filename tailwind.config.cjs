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
			},
			animation: {
				'fade-down': 'fade-down 0.2s ease-out',
				'fade-up': 'fade-up 0.2s ease-out'
			},
			keyframes: {
				'fade-down': {
					'0%': {
						opacity: '0',
						transform: 'translateY(-2rem)',
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)',
					},
				},
				'fade-up': {
					'0%': {
						opacity: '1',
					},
					'100%': {
						opacity: '0',
						transform: 'translateY(-2rem)',
					},
				},
			}
		},

	},

	plugins: []
};

module.exports = config;
