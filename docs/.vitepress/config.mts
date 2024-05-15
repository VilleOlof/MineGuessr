import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "MineGuessr",
  description: "A fully detailed guide on how to setup MineGuessr for your own world!",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Home', link: '/' }
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Setup Guide', link: '/guide/' },
          { text: 'Admin Panel', link: '/guide/panel' },
          { text: 'Development', link: '/guide/dev' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/VilleOlof/MineGuessr' }
    ],
    search: {
      provider: 'local'
    }
  }
})
