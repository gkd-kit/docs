import {
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  Application,
  type ProjectReflection,
  type TypeDocOptions,
} from 'typedoc';
import {
  load as loadMarkdown,
  type NavigationItem,
  type PluginOptions,
} from 'typedoc-plugin-markdown';
import { getGkNavigation, loadGkMarkdownTheme } from './theme.js';

type SidebarItem = {
  text: string;
  link?: string;
  items?: SidebarItem[];
};

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const apiRoot = path.resolve(currentDir, '..');
const repositoryRoot = path.resolve(apiRoot, '..');
const destinationDir = path.resolve(repositoryRoot, 'docs/api');
const cacheOutputDir = path.join(apiRoot, '.cache', 'typedoc');
const toPosixPath = (value: string) => value.replaceAll('\\', '/');

const options = {
  lang: 'zh',
  entryPoints: [toPosixPath(path.join(apiRoot, 'src/index.ts'))],
  tsconfig: path.join(apiRoot, 'tsconfig.json'),
  plugin: [loadMarkdown, loadGkMarkdownTheme],
  outputs: [{ name: 'markdown', path: cacheOutputDir }],
  theme: 'gk-markdown',
  githubPages: false,
  readme: 'none',
  entryFileName: 'index',
  indexFormat: 'table',
  disableSources: true,
  hideBreadcrumbs: true,
  hidePageHeader: true,
  pageTitleTemplates: {
    index: 'API 参考',
    member: '{name}',
  },
  sluggerConfiguration: { lowercase: false },
  useCustomAnchors: true,
  sort: ['source-order'],
} satisfies TypeDocOptions & PluginOptions;

const collectFiles = async (
  root: string,
  relativeDir = '',
): Promise<Map<string, Buffer>> => {
  const files = new Map<string, Buffer>();
  const directory = path.join(root, relativeDir);
  try {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const relativePath = path.join(relativeDir, entry.name);
      if (entry.isDirectory()) {
        for (const [childPath, content] of await collectFiles(
          root,
          relativePath,
        )) {
          files.set(childPath, content);
        }
      } else if (entry.isFile()) {
        files.set(relativePath, await readFile(path.join(root, relativePath)));
      }
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
  return files;
};

const toSidebar = (items: NavigationItem[]): SidebarItem[] =>
  items.map((item) => {
    const children = item.children ? toSidebar(item.children) : undefined;
    return {
      text: item.title,
      ...(item.path && {
        link: `/api/${item.path.replaceAll('\\', '/').replace(/\.md$/, '')}`,
      }),
      ...(children?.length && { items: children }),
    };
  });

const verifyGeneratedMarkdown = (files: Map<string, Buffer>): void => {
  if (!files.has('index.md') || files.has('README.md')) {
    throw new Error('API documentation must use index.md as its entry page');
  }

  const anchors = new Map<string, Set<string>>();
  let inlineDefaultCount = 0;
  for (const [file, buffer] of files) {
    if (!file.endsWith('.md')) continue;
    const markdown = buffer.toString();
    if (markdown.includes('#### Inherited from')) {
      throw new Error(`Inherited member details were rendered in ${file}`);
    }
    if (
      /^#{2,6} .*\{#([^}]+)\}\r?\n\r?\n> [^\r\n]*\*\*\1\??\*\*: /m.test(
        markdown,
      )
    ) {
      throw new Error(`Property names were rendered twice in ${file}`);
    }
    if (
      /^#### 默认值\r?\n\r?\n```[^\r\n]*\r?\n(?:true|false|null|undefined|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')\r?\n```/m.test(
        markdown,
      )
    ) {
      throw new Error(`A simple default value used a code block in ${file}`);
    }
    inlineDefaultCount += [
      ...markdown.matchAll(/· 默认值：(?:`[^`]*`|`` [^\r\n]* ``)/g),
    ].length;
    anchors.set(
      file,
      new Set([
        ...[...markdown.matchAll(/\{#([^}]+)\}/g)].map((match) => match[1]),
        ...[...markdown.matchAll(/<a id="([^"]+)"><\/a>/g)].map(
          (match) => match[1],
        ),
      ]),
    );
  }
  if (inlineDefaultCount === 0) {
    throw new Error('No compact inline default values were generated');
  }

  for (const [file, buffer] of files) {
    if (!file.endsWith('.md')) continue;
    const markdown = buffer.toString();
    for (const match of markdown.matchAll(/<a href="([^"]+#([^"]+))">/g)) {
      const [target, anchor] = match[1].split('#');
      if (/^(?:https?:|mailto:|tel:|\/)/.test(target)) continue;
      let targetFile = target
        ? path.normalize(path.join(path.dirname(file), target))
        : file;
      if (target && !path.extname(targetFile)) targetFile += '.md';
      if (!files.has(targetFile)) {
        throw new Error(`${file} links to missing file ${targetFile}`);
      }
      if (!anchors.get(targetFile)?.has(anchor)) {
        throw new Error(
          `${file} links to missing anchor ${targetFile}#${anchor}`,
        );
      }
    }
  }
};

const removeEmptyDirectories = async (directory: string): Promise<void> => {
  let entries: string[];
  try {
    entries = await readdir(directory);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
    throw error;
  }
  for (const entry of entries) {
    const child = path.join(directory, entry);
    if ((await stat(child)).isDirectory()) await removeEmptyDirectories(child);
  }
  if (directory !== destinationDir && (await readdir(directory)).length === 0) {
    await rm(directory, { recursive: false });
  }
};

const syncOutput = async (project: ProjectReflection): Promise<void> => {
  const generatedFiles = await collectFiles(cacheOutputDir);
  generatedFiles.set(
    'typedoc-sidebar.json',
    Buffer.from(
      `${JSON.stringify(toSidebar(getGkNavigation(project)), null, 2)}\n`,
    ),
  );
  verifyGeneratedMarkdown(generatedFiles);

  const existingFiles = await collectFiles(destinationDir);
  let changed = 0;
  let removed = 0;
  await mkdir(destinationDir, { recursive: true });

  for (const [file, content] of generatedFiles) {
    if (existingFiles.get(file)?.equals(content)) continue;
    const destination = path.join(destinationDir, file);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, content);
    changed += 1;
  }

  for (const file of existingFiles.keys()) {
    if (generatedFiles.has(file)) continue;
    await rm(path.join(destinationDir, file));
    removed += 1;
  }
  await removeEmptyDirectories(destinationDir);
  console.log(`[api-docs] updated ${changed}, removed ${removed}`);
};

const build = async (): Promise<void> => {
  await rm(cacheOutputDir, { force: true, recursive: true });
  const app = await Application.bootstrapWithPlugins(options);
  const project = await app.convert();
  if (!project) throw new Error('TypeDoc conversion failed');
  app.validate(project);
  await app.generateOutputs(project);
  if (app.logger.hasErrors()) throw new Error('TypeDoc generation failed');
  await syncOutput(project);
};

try {
  await build();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
