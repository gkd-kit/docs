import {
  MarkdownRendererEvent,
  MarkdownTheme,
  MarkdownThemeContext,
  type MarkdownApplication,
  type NavigationJSON,
  type MarkdownPageEvent,
} from 'typedoc-plugin-markdown';
import {
  DeclarationReflection,
  ReflectionKind,
  type Application,
  type ContainerReflection,
  type Options,
  type Reflection,
  type ReflectionCategory,
  ReflectionGroup,
  type Renderer,
} from 'typedoc';

type MemberSection = ReflectionCategory | ReflectionGroup;

const navigationByProject = new WeakMap<Reflection, NavigationJSON>();

export const getGkNavigation = (project: Reflection): NavigationJSON => {
  const navigation = navigationByProject.get(project);
  if (!navigation) {
    throw new Error('The Gk Markdown navigation was not created');
  }
  return navigation;
};

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const renderCodeSpan = (value: string): string =>
  value.includes('`') ? `\`\` ${value} \`\`` : `\`${value}\``;

const simpleDefaultLiteralPattern =
  /^(?:true|false|null|undefined|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')$/;

const getSimpleDefaultValue = (
  model: DeclarationReflection,
): string | undefined => {
  const tag =
    model.comment?.getTag('@default') ?? model.comment?.getTag('@defaultValue');
  if (!tag) return;

  const content = tag.content
    .map((part) => part.text)
    .join('')
    .trim();
  const fenced = content.match(/^```[^\r\n]*\r?\n([^\r\n]+)\r?\n```$/);
  const value = (fenced?.[1] ?? content).trim();
  return simpleDefaultLiteralPattern.test(value) ? value : undefined;
};

const renderMarkdownLabel = (label: string): string => {
  if (label.startsWith('`') && label.endsWith('`')) {
    return `<code>${escapeHtml(label.slice(1, -1))}</code>`;
  }
  if (label.startsWith('~~') && label.endsWith('~~')) {
    return `<del>${renderMarkdownLabel(label.slice(2, -2))}</del>`;
  }
  return escapeHtml(label.replaceAll(/\\([\\[\]_*`])/g, '$1'));
};

const preserveInternalFragmentCase = (markdown: string): string => {
  const codeBlocks: string[] = [];
  const protectedMarkdown = markdown.replace(/```[\s\S]*?```/g, (codeBlock) => {
    const placeholder = `___GK_TYPEDOC_CODE_BLOCK_${codeBlocks.length}___`;
    codeBlocks.push(codeBlock);
    return placeholder;
  });

  return protectedMarkdown
    .replace(
      /(?<!!)\[([^\]\n]+)\]\(((?!https?:\/\/|mailto:|tel:)[^)\s]*#[^)\s]+)\)/g,
      (_, label: string, href: string) => {
        const routeHref = href.replace(/\.md(?=#)/, '');
        return `<a href="${escapeHtml(routeHref)}">${renderMarkdownLabel(label)}</a>`;
      },
    )
    .replace(/___GK_TYPEDOC_CODE_BLOCK_(\d+)___/g, (_, index: string) => {
      return codeBlocks[Number(index)] ?? '';
    });
};

const cloneSectionWithoutInheritedMembers = <T extends MemberSection>(
  section: T,
): T | undefined => {
  const children = section.children.filter(
    (child) =>
      !(child instanceof DeclarationReflection) || !child.inheritedFrom,
  );
  const categories =
    section instanceof ReflectionGroup
      ? section.categories
          ?.map(cloneSectionWithoutInheritedMembers)
          .filter((category): category is ReflectionCategory =>
            Boolean(category),
          )
      : undefined;

  if (children.length === 0 && !categories?.length) return;

  const view = Object.create(section) as T;
  Object.defineProperty(view, 'children', {
    configurable: true,
    enumerable: true,
    value: children,
  });
  if (categories) {
    Object.defineProperty(view, 'categories', {
      configurable: true,
      enumerable: true,
      value: categories,
    });
  }
  return view;
};

const cloneContainerWithoutInheritedMembers = (
  model: ContainerReflection,
): ContainerReflection => {
  const groups = model.groups
    ?.map(cloneSectionWithoutInheritedMembers)
    .filter((group): group is ReflectionGroup => Boolean(group));
  const view = Object.create(model) as ContainerReflection;
  Object.defineProperty(view, 'groups', {
    configurable: true,
    enumerable: true,
    value: groups,
  });
  return view;
};

const getCanonicalDeclaration = (
  declaration: DeclarationReflection,
): DeclarationReflection => {
  const visited = new Set<number>();
  let current = declaration;
  while (!visited.has(current.id)) {
    visited.add(current.id);
    const inherited = current.inheritedFrom?.reflection;
    if (!(inherited instanceof DeclarationReflection)) break;
    current = inherited;
  }
  return current;
};

class GkMarkdownThemeContext extends MarkdownThemeContext {
  constructor(
    theme: MarkdownTheme,
    page: MarkdownPageEvent<Reflection>,
    options: Options,
  ) {
    super(theme, page, options);

    const renderGroups = this.partials.groups;
    const renderMembers = this.partials.members;
    const renderPropertiesTable = this.partials.propertiesTable;
    const renderMemberContainer = this.partials.memberContainer;
    const renderDeclarationTitle = this.partials.declarationTitle;
    const renderComment = this.partials.comment;
    const commentsWithInlineDefaults = new WeakSet<object>();

    this.helpers.getReflectionFlags = (flags) =>
      [
        flags?.isAbstract && '`抽象`',
        flags?.isConst && '`常量`',
        flags?.isPrivate && '`私有`',
        flags?.isProtected && '`受保护`',
        flags?.isReadonly && '`只读`',
        flags?.isStatic && '`静态`',
        flags?.isOptional && '`可选`',
      ]
        .filter((flag): flag is string => Boolean(flag))
        .join(' ');

    this.partials.groups = (model, renderOptions) => {
      if (model.kind !== ReflectionKind.Interface) {
        return renderGroups(model, renderOptions);
      }

      return [
        renderGroups(
          cloneContainerWithoutInheritedMembers(model),
          renderOptions,
        ),
        this.renderInheritedProperties(model, renderOptions.headingLevel),
      ]
        .filter(Boolean)
        .join('\n\n');
    };

    this.partials.members = (members, renderOptions) =>
      renderMembers(
        members.filter((member) => !member.inheritedFrom),
        renderOptions,
      );

    this.partials.propertiesTable = (properties, renderOptions) =>
      renderPropertiesTable(
        properties.filter((property) => !property.inheritedFrom),
        renderOptions,
      );

    this.partials.comment = (model, renderOptions) => {
      if (!commentsWithInlineDefaults.has(model)) {
        return renderComment(model, renderOptions);
      }
      const view = model.clone();
      view.removeTags('@default');
      view.removeTags('@defaultValue');
      return renderComment(view, renderOptions);
    };

    this.partials.declarationTitle = (model) => {
      if (model.kind !== ReflectionKind.Property) {
        return renderDeclarationTitle(model);
      }

      const parts = [
        this.helpers.getReflectionFlags(model.flags),
        model.flags.isRest ? '...' : '',
      ].filter(Boolean);
      const declarationType = this.helpers.getDeclarationType(model);
      if (declarationType) {
        parts.push(this.partials.someType(declarationType));
      }
      const simpleDefaultValue = getSimpleDefaultValue(model);
      if (simpleDefaultValue && model.comment) {
        commentsWithInlineDefaults.add(model.comment);
        parts.push(`· 默认值：${renderCodeSpan(simpleDefaultValue)}`);
      }
      if (
        model.defaultValue &&
        model.defaultValue !== '...' &&
        model.defaultValue !== model.name
      ) {
        parts.push(`= ${renderCodeSpan(model.defaultValue)}`);
      }
      return `> ${parts.join(' ')}`;
    };

    this.partials.memberContainer = (model, renderOptions) => {
      const rendered = renderMemberContainer(model, renderOptions);
      const anchor =
        !this.router.hasOwnDocument(model) && this.router.hasUrl(model)
          ? this.router.getAnchor(model)
          : undefined;
      const legacyAnchor = anchor?.toLowerCase();

      if (!anchor || !legacyAnchor || anchor === legacyAnchor) return rendered;
      return `<a id="${escapeHtml(legacyAnchor)}"></a>\n\n${rendered}`;
    };
  }

  private renderInheritedProperties(
    model: ContainerReflection,
    headingLevel: number,
  ): string {
    const groups = new Map<
      DeclarationReflection,
      Map<number, DeclarationReflection>
    >();

    for (const child of model.children ?? []) {
      if (!(child instanceof DeclarationReflection) || !child.inheritedFrom) {
        continue;
      }
      const canonical = getCanonicalDeclaration(child);
      if (!(canonical.parent instanceof DeclarationReflection)) continue;
      const declarations = groups.get(canonical.parent) ?? new Map();
      declarations.set(canonical.id, canonical);
      groups.set(canonical.parent, declarations);
    }

    if (groups.size === 0) return '';

    const lines = [`${'#'.repeat(headingLevel)} 继承属性`];
    for (const [parent, declarations] of groups) {
      const parentUrl = this.urlTo(parent);
      const links = [...declarations.values()].map((declaration) => {
        const name = `${declaration.name}${declaration.flags.isOptional ? '?' : ''}`;
        const link = `[\`${name}\`](${this.urlTo(declaration)})`;
        return declaration.isDeprecated() ? `~~${link}~~` : link;
      });
      lines.push(`- [${parent.name}](${parentUrl}): ${links.join(', ')}`);
    }
    return lines.join('\n');
  }
}

export class GkMarkdownTheme extends MarkdownTheme {
  override getRenderContext(page: MarkdownPageEvent<Reflection>) {
    return new GkMarkdownThemeContext(this, page, this.application.options);
  }

  override render(page: MarkdownPageEvent): string {
    return preserveInternalFragmentCase(super.render(page));
  }
}

export const loadGkMarkdownTheme = (app: Application): void => {
  const renderer = (app as MarkdownApplication).renderer;
  renderer.defineTheme(
    'gk-markdown',
    GkMarkdownTheme as new (renderer: Renderer) => GkMarkdownTheme,
  );
  renderer.on(MarkdownRendererEvent.BEGIN, (event) => {
    if (event.navigation) {
      navigationByProject.set(event.project, event.navigation);
    }
  });
};
