import { simple } from 'acorn-walk';
import type { ImportExpression, Literal } from 'acorn';
import MagicString from 'magic-string';
import fs from 'node:fs/promises';
import process from 'node:process';
import type { Plugin } from 'vite';
import type selfPkgT from '../../package.json';
import path from 'node:path';

const selfPkg: typeof selfPkgT = JSON.parse(
  await fs.readFile(process.cwd() + '/package.json', 'utf-8'),
);

const useMirror = process.env.MIRROR == `ON`;

const mirrorBaseUrl = `https://registry.npmmirror.com/@gkd-kit/docs/${selfPkg.version}/files/.vitepress/dist`;

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
          chunk.code.includes('/assets/')
        ) {
          const ast = this.parse(chunk.code);
          const literalNodes: Literal[] = [];
          simple(ast, {
            Literal(node) {
              if (
                typeof node.value === 'string' &&
                node.value.startsWith('/assets/')
              ) {
                literalNodes.push(node);
              }
            },
          });
          if (literalNodes.length) {
            const ms = new MagicString(chunk.code);
            literalNodes.forEach((n) => {
              ms.update(
                n.start,
                n.end,
                JSON.stringify(mirrorBaseUrl + String(n.value)),
              );
            });
            chunk.code = ms.toString();
          }
        }
      });
    },
  };
};

const posixPath = (str: string): string => {
  if (str.includes('\\')) {
    return str.replaceAll('\\', '/');
  }
  return str;
};
async function* traverseDirectory(
  dir: string,
  filter?: (subDirectory: string) => boolean,
) {
  const pathnames = (await fs.readdir(dir))
    .map((s) => posixPath(path.join(dir, s)))
    .reverse();
  while (pathnames.length > 0) {
    const pathname = pathnames.pop()!;
    const state = await fs.lstat(pathname);
    if (state.isFile()) {
      yield pathname;
    } else if (state.isDirectory() && (!filter || filter(pathname))) {
      pathnames.push(
        ...(await fs.readdir(pathname))
          .map((s) => posixPath(path.join(pathname, s)))
          .reverse(),
      );
    }
  }
}

export const buildEnd = async () => {
  if (!useMirror) return;
  const distDir = posixPath(process.cwd() + '/.vitepress/dist');
  const relativePath = (v: string) => {
    return v.substring(distDir.length);
  };
  const htmlUrlMap: Record<string, string> = {};
  for await (const filePathName of traverseDirectory(distDir)) {
    if (filePathName.endsWith('.html')) {
      const textFileName = filePathName.replace(/\.html$/, '_.md');
      await fs.copyFile(filePathName, textFileName);
      htmlUrlMap[relativePath(filePathName)] = relativePath(textFileName);
    }
  }
  Object.keys(htmlUrlMap).forEach((k) => {
    if (k.endsWith('/index.html')) {
      htmlUrlMap[k.replace(/index\.html$/, '')] = htmlUrlMap[k];
    } else if (k.endsWith('.html')) {
      htmlUrlMap[k.replace(/\.html$/, '')] = htmlUrlMap[k];
    }
  });
  const configFileRelativePath = '/_config.json';
  const configText = JSON.stringify(
    {
      mirrorBaseUrl,
      htmlUrlMap,
    },
    undefined,
    2,
  );
  await fs.writeFile(distDir + configFileRelativePath, configText);
  await fs.writeFile(process.cwd() + configFileRelativePath, configText);
};

const Parser =
  globalThis.DOMParser || new (await import('jsdom')).JSDOM().window.DOMParser;
export const transformHtml = (code: string) => {
  if (!useMirror) return;
  if (!code.includes('/assets/')) return;
  // 注意: 如果使用 htmlparser2+dom-serializer, 当 md 文件包含 `<<n` 将出现 Hydration mismatches 错误
  const doc = new Parser().parseFromString(code, 'text/html');
  const meta = doc.createElement('meta');
  meta.name = 'version';
  meta.content = selfPkg.version;
  doc.head.insertBefore(meta, doc.head.firstChild);
  Object.entries({
    link: 'href',
    script: 'src',
  }).forEach(([tag, attr]) => {
    doc.querySelectorAll(`${tag}[${attr}^="/assets/"]`).forEach((e) => {
      e.setAttribute(attr, mirrorBaseUrl + e.getAttribute(attr));
    });
  });

  Object.entries({
    link: 'href',
    img: 'src',
  }).forEach(([tag, attr]) => {
    doc.querySelectorAll(`${tag}[${attr}^="/"]`).forEach((e) => {
      const value = e.getAttribute(attr);
      if (value && !value.includes('/', 1)) {
        e.setAttribute(attr, mirrorBaseUrl + value);
      }
    });
  });

  return doc.documentElement.outerHTML;
};
