import fs from 'node:fs/promises';
import type { Plugin } from 'vite';
import type selfPkgT from '../../package.json';
import * as walk from 'acorn-walk';
import MagicString from 'magic-string';
import { DomUtils, parseDocument } from 'htmlparser2';
import render from 'dom-serializer';

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
          const nodes: any[] = [];
          walk.simple(ast, {
            ImportExpression(node) {
              nodes.push(node.source);
            },
          });
          if (nodes.length == 0) {
            return;
          }
          const ms = new MagicString(chunk.code);
          nodes.forEach((node) => {
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

export const transformHtml = (code: string) => {
  if (!useMirror) return;
  const doc = parseDocument(code);
  const scripts = DomUtils.findAll((e) => {
    return (
      e.name === 'script' &&
      !!e.attribs.src &&
      e.attribs.src.startsWith('/assets/')
    );
  }, doc.children);
  scripts.forEach((e) => {
    e.attribs.src = mirrorBaseUrl + e.attribs.src;
  });
  const links = DomUtils.findAll((e) => {
    const href = e.attribs.href;
    return e.name === 'link' && !!href && href.startsWith('/assets/');
  }, doc.children);
  links.forEach((e) => {
    e.attribs.href = mirrorBaseUrl + e.attribs.href;
  });
  return render(doc, { encodeEntities: false });
};
