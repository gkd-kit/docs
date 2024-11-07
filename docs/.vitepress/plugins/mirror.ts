import { simple } from 'acorn-walk';
import type { ImportExpression } from 'acorn';
import jsdom from 'jsdom';
import MagicString from 'magic-string';
import fs from 'node:fs/promises';
import process from 'node:process';
import type { Plugin } from 'vite';
import type selfPkgT from '../../package.json';

const selfPkg: typeof selfPkgT = JSON.parse(
  await fs.readFile(process.cwd() + '/package.json', 'utf-8'),
);

const useMirror = process.env.MIRROR == `ON`;

const mirrorBaseUrl = `https://registry.npmmirror.com/@gkd-kit/docs/${selfPkg.version}/files/.vitepress/dist`;

const includesDynamicImport = /import\s*\(/;

export const mirror = (): Plugin | undefined => {
  if (!useMirror) return;
  return {
    name: 'mirror',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      Object.values(bundle).forEach((chunk) => {
        if (
          chunk.type == 'asset' &&
          chunk.fileName.endsWith(`.css`) &&
          typeof chunk.source == 'string'
        ) {
          chunk.source = chunk.source.replaceAll(
            '/assets/',
            `${mirrorBaseUrl}/assets/`,
          );
        }
        if (
          chunk.type == 'chunk' &&
          chunk.fileName.endsWith(`.js`) &&
          chunk.code.match(includesDynamicImport)
        ) {
          const ast = this.parse(chunk.code);
          const nodes: ImportExpression[] = [];
          simple(ast, {
            ImportExpression(node) {
              nodes.push(node);
            },
          });
          if (nodes.length == 0) {
            return;
          }
          const ms = new MagicString(chunk.code);
          nodes
            .map((v) => v.source)
            .forEach((node) => {
              const start = node.start;
              const end = node.end;
              const code = chunk.code.slice(start, end);
              ms.overwrite(
                start,
                end,
                `((u)=>{if(u.startsWith('/')){return${JSON.stringify(
                  mirrorBaseUrl,
                )}+u}return u})(${code})`,
              );
            });
          chunk.code = ms.toString();
        }
      });
    },
  };
};

const Parser = globalThis.DOMParser || new jsdom.JSDOM().window.DOMParser;
export const transformHtml = (code: string) => {
  if (!useMirror) return;
  if (!code.includes('/assets/')) return;
  // 注意: 如果使用 htmlparser2+dom-serializer, 当 md 文件包含 `<<n` 将出现 Hydration mismatches 错误
  const doc = new Parser().parseFromString(code, 'text/html');
  const elements = {
    link: 'href',
    script: 'src',
  };
  Object.entries(elements).forEach(([tag, attr]) => {
    doc.querySelectorAll(`${tag}[${attr}^="/assets/"]`).forEach((e) => {
      e.setAttribute(attr, mirrorBaseUrl + e.getAttribute(attr));
    });
  });

  doc.querySelectorAll('[href^="/"]').forEach((e) => {
    const tag = e.tagName.toLowerCase();
    const href = e.getAttribute('href');
    if (
      (tag === 'img' || tag === 'link') &&
      href &&
      href.lastIndexOf('/') === 0
    ) {
      e.setAttribute('href', mirrorBaseUrl + href);
    }
  });
  return doc.documentElement.outerHTML;
};
