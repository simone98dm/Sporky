export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  // Fonts are self-hosted so no visitor IP is sent to Google.
  css: [
    '@fontsource-variable/inter',
    'material-symbols/outlined.css',
    '~/assets/css/main.css',
  ],
  app: {
    head: {
      title: 'Sporky - Your Music Journey',
      meta: [
        {
          name: 'description',
          content:
            'Discover your top Spotify tracks with beautiful visualizations and insights into your musical journey.',
        },
      ],
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      htmlAttrs: {
        lang: 'en',
      },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/apple-touch-icon.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/favicon-32x32.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          href: '/favicon-16x16.png',
        },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
    },
  },
  runtimeConfig: {
    public: {
      clientId: process.env.NUXT_CLIENT_ID,
      redirectUri: `${process.env.NUXT_PROTOCOL || 'https'}://${process.env.NUXT_BASE_URL}/api/callback`,
    },
    clientSecret: process.env.NUXT_CLIENT_SECRET,
  },
});
