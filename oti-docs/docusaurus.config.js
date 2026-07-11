// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'OTI Developer Docs',
  tagline: 'On-chain wallet trust scoring for any blockchain',
  favicon: 'img/favicon.ico',

  url: 'https://docs.otiscore.vercel.app',
  baseUrl: '/docs/',

  organizationName: 'openflow-labs',
  projectName: 'oti-docs',

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '',
          sidebarPath: './sidebars.js',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/oti-og.png',
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: 'OTI Docs',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docs',
            position: 'left',
            label: 'Documentation',
          },
          {
            href: 'https://otiscore.vercel.app/score',
            label: 'Score a Wallet',
            position: 'right',
          },
          {
            href: 'https://otiscore.vercel.app/whitepaper',
            label: 'Whitepaper',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {label: 'Getting Started', to: '/'},
              {label: 'API Reference', to: '/api-reference'},
              {label: 'Score Explanation', to: '/score-explanation'},
              {label: 'Supported Chains', to: '/supported-chains'},
              {label: 'Rate Limits & Plans', to: '/rate-limits'},
              {label: 'Code Examples', to: '/code-examples'},
            ],
          },
          {
            title: 'OTI',
            items: [
              {label: 'Score a Wallet', href: 'https://otiscore.vercel.app/score'},
              {label: 'Whitepaper', href: 'https://otiscore.vercel.app/whitepaper'},
            ],
          },
        ],
        copyright: 'OTI · otiscore.vercel.app',
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'python', 'javascript', 'json'],
      },
    }),
};

export default config;
