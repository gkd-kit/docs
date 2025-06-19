import { simple } from 'acorn-walk';
import type { ImportExpression, Literal } from 'acorn';
import MagicString from 'magic-string';
import fs from 'node:fs/promises';
import process from 'node:process';
import type { Plugin } from 'vite';
import type selfPkgT from '../../package.json';
import path from 'node:path';
import { transformWithEsbuild } from 'vite';

const selfPkg: typeof selfPkgT = JSON.parse(
  await fs.readFile(process.cwd() + '/package.json', 'utf-8'),
);

const useMirror = process.env.MIRROR == `ON`;

const mirrorBaseUrl = `https://registry.npmmirror.com/@gkd-kit/docs/${selfPkg.version}/files/.vitepress/dist`;

const includesDynamicImport = /\bimport\s*\(/;

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
          (chunk.code.includes('/assets/') ||
            chunk.code.match(includesDynamicImport))
        ) {
          const ast = this.parse(chunk.code);
          const importNodes: ImportExpression[] = [];
          const literalNodes: Literal[] = [];
          simple(ast, {
            ImportExpression(node) {
              importNodes.push(node);
            },
            Literal(node) {
              if (
                typeof node.value === 'string' &&
                node.value.startsWith('/assets/')
              ) {
                literalNodes.push(node);
              }
            },
          });
          if (importNodes.length == 0) {
            return;
          }
          const ms = new MagicString(chunk.code);
          importNodes
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
          // literalNodes.forEach((n) => {
          //   ms.overwrite(
          //     n.start,
          //     n.end,
          //     JSON.stringify(mirrorBaseUrl + String(n.value)),
          //   );
          // });
          chunk.code = ms.toString();
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
const distDir = posixPath(process.cwd() + '/.vitepress/dist');
const relativePath = (v: string) => {
  return v.substring(distDir.length);
};
export const buildEnd = async () => {
  if (!useMirror) return;
  const htmlUrlMap: Record<string, string> = {};
  for await (const fp of traverseDirectory(distDir)) {
    if (fp.endsWith('.html')) {
      const textFileName = fp.replace(/\.html$/, '_.md');
      await fs.copyFile(fp, textFileName);
      htmlUrlMap[relativePath(fp)] = relativePath(textFileName);
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

let tempModernPolyfillsFilePath = '';
const getModernPolyfillsFilePath = async (): Promise<string> => {
  if (tempModernPolyfillsFilePath) return tempModernPolyfillsFilePath;
  for await (const fp of traverseDirectory(distDir)) {
    const baseName = path.basename(fp);
    if (baseName.startsWith('polyfills.') && baseName.endsWith('.js')) {
      return (tempModernPolyfillsFilePath = relativePath(fp));
    }
  }
  throw new Error('Modern polyfills file not found');
};

const minifyCode = async (code: string): Promise<string> => {
  const result = await transformWithEsbuild(code, 'any.js', {
    minify: true,
  });
  return result.code;
};

export const transformHtml = async (code: string): Promise<string> => {
  const doc = new Parser().parseFromString(code, 'text/html');
  {
    const polyfillsFile = await getModernPolyfillsFilePath();
    const script = doc.createElement('script');
    script.setAttribute(
      'src',
      (useMirror ? mirrorBaseUrl : '') + polyfillsFile,
    );
    doc.head.insertBefore(script, doc.head.firstChild);
  }
  if (useMirror) {
    const script = doc.createElement('script');
    script.textContent = await minifyCode(
      `;(${rewriteAppendChild})(${JSON.stringify(mirrorBaseUrl)});`,
    );
    doc.head.insertBefore(script, doc.head.firstChild);
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
  }
  {
    const script = doc.createElement('script');
    script.textContent = await minifyCode(`;(${preHiddenLayout})();`);
    doc.head.insertBefore(script, doc.head.firstChild);
  }
  return doc.documentElement.outerHTML;
};

const rewriteAppendChild = (base: string) => {
  const rawAppendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = function <T extends Node>(node: T): T {
    if (node instanceof HTMLLinkElement && node.rel === 'prefetch') {
      const href = node.getAttribute('href');
      if (href && href.startsWith('/assets/')) {
        node.href = base + href;
      }
    }
    return rawAppendChild.call(this, node) as T;
  };
};

const preHiddenLayout = () => {
  if (
    location.pathname === '/' &&
    /\d+/.test(new URLSearchParams(location.search).get('r') || '')
  ) {
    document.write(
      '<styl',
      'e id="hidden-layout-style"> #app .Layout { visibility: hidden; } ',
      '</styl',
      'e>',
    );
  }
};
