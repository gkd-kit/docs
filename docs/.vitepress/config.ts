import { defineConfig } from 'vitepress';
import { mirror, transformHtml } from './plugins';
import typedocSidebar from '../api/typedoc-sidebar.json';

const logoUrl =
  'https://registry.npmmirror.com/@gkd-kit/docs/0.0.1706371840771/files/.vitepress/dist/logo.svg';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'GKD',
  description: '自定义屏幕点击应用',
  head: [
    [
      'link',
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: logoUrl,
      },
    ],
  ],
  lastUpdated: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: logoUrl,
    nav: [
      { text: '首页', link: '/' },
      { text: 'API', link: '/api/' },
    ],
    sidebar: [
      {
        text: '指引',
        items: [
          { text: '开始使用', link: '/guide/' },
          { text: '高级选择器', link: '/selector/' },
          { text: '订阅规则', link: '/scription/' },
          { text: '疑难解答', link: '/faq/' },
        ],
      },
      {
        text: 'API',
        link: '/api/',
        collapsed: true,
        items: typedocSidebar,
      },
    ],
    outline: { label: '页面导航' },
    editLink: {
      pattern: 'https://github.com/gkd-kit/docs/edit/main/:path',
      text: '为此页提供修改建议',
    },
    search: {
      provider: 'local',
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/gkd-kit' }],
    footer: {
      message: 'Released under the GPL-v3 License.',
      copyright: `Copyright © ${new Date().getFullYear()} GKD. All rights reserved`,
    },
  },
  transformHtml,
  vite: {
    plugins: [mirror()],
    server: {
      host: '127.0.0.1',
      port: 8633,
    },
  },
});
