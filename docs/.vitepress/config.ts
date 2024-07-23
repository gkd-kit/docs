import { defineConfig } from 'vitepress';
import typedocSidebar from '../api/typedoc-sidebar.json';
import { transformHtml } from './plugins';

const logoUrl =
  'https://registry.npmmirror.com/@gkd-kit/docs/0.0.1706371840771/files/.vitepress/dist/logo.svg';

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
    logo: logoUrl,
    lastUpdatedText: '最后更新于',
    outline: 'deep',
    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },
    returnToTopLabel: '返回顶部',
    outlineTitle: '导航栏',
    darkModeSwitchLabel: '外观',
    sidebarMenuLabel: '归档',
    nav: [
      { text: '指引', link: '/guide/', activeMatch: '/guide/' },
      { text: 'API', link: '/api/', activeMatch: '/api/' },
      { text: '审查工具', link: 'https://i.gkd.li' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '指引',
          items: [
            { text: '什么是 GKD?', link: '/guide/what-is-gkd' },
            { text: '开始使用', link: '/guide/' },
            { text: '快照审查', link: '/guide/snapshot' },
            { text: '订阅规则', link: '/guide/subscription' },
            { text: '疑难解答', link: '/guide/faq' },
          ],
        },
        {
          text: '选择器',
          items: [
            { text: '语法介绍', link: '/guide/selector' },
            { text: '属性方法', link: '/guide/node' },
            { text: '选择示例', link: '/guide/example' },
            { text: '查询优化', link: '/guide/optimize' },
          ],
        },
      ],
      '/api/': [
        { link: '/api/', text: 'API Reference' },
        ...typedocSidebar.map((v) => ({ ...v, collapsed: undefined })),
      ],
    },
    editLink: {
      pattern: 'https://github.com/gkd-kit/docs/edit/main/docs/:path',
      text: '为此页提供修改建议',
    },
    search: {
      provider: 'local',
      options: {
        _render(src, env, md) {
          const html = md.render(src, env);
          if (env.frontmatter?.search === false) return '';
          if (
            env.relativePath.startsWith('api/interfaces/') &&
            env.relativePath.endsWith('Props.md')
          ) {
            return '';
          }
          return html;
        },
      },
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/gkd-kit/gkd' }],
    footer: {
      message: 'Released under the GPL-v3 License.',
      copyright: `Copyright © ${new Date().getFullYear()} GKD. All rights reserved`,
    },
  },
  cleanUrls: true,
  transformHtml,
});
