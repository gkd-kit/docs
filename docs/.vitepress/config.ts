import { defineConfig } from 'vitepress';
import typedocSidebar from '../api/typedoc-sidebar.json';
import { transformHtml, buildEnd } from './plugins';

export default defineConfig({
  title: 'GKD',
  description: '自定义屏幕点击应用',
  head: [
    [
      'link',
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/icon.svg',
      },
    ],
  ],
  lastUpdated: true,
  themeConfig: {
    logo: 'https://registry.npmmirror.com/@gkd-kit/docs/0.0.1706371840771/files/.vitepress/dist/logo.svg',
    lastUpdatedText: '最后更新于',
    outlineTitle: '页面导航',
    returnToTopLabel: '回到顶部',
    darkModeSwitchLabel: '深色主题',
    sidebarMenuLabel: '菜单',
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
    outline: [2, 3],
    nav: [
      { text: '指引', link: '/guide/', activeMatch: '/guide/' },
      { text: 'API', link: '/api/', activeMatch: '/api/' },
      { text: '审查工具', link: 'https://i.gkd.li' },
      { text: '讨论交流', link: 'https://github.com/orgs/gkd-kit/discussions' },
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
            { text: '外部交互', link: '/guide/external' },
            { text: '常见问题', link: '/guide/faq' },
            { text: '捐赠支持', link: '/guide/sponsor' },
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
        {
          text: '协议政策',
          items: [
            { text: '使用协议', link: '/guide/terms' },
            { text: '隐私政策', link: '/guide/privacy' },
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
    socialLinks: [{ icon: 'github', link: 'https://github.com/gkd-kit' }],
    footer: {
      message: 'Released under the GPL-v3 License.',
      copyright: `Copyright © ${new Date().getFullYear()} GKD. All rights reserved`,
    },
  },
  cleanUrls: true,
  transformHtml,
  buildEnd,
});
