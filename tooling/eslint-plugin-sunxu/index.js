const PAGE_CONTRACTS = Object.freeze({
  list: ['ListScreenContainer'],
  form: ['FormScreenContainer', 'FormPage'],
  detail: ['DetailScreenContainer'],
  map: ['MapScreenContainer'],
  custom: ['ScreenContainer'],
});

const USE_CONTRACTS = Object.freeze({
  search: ['SearchBar'],
  filters: ['FilterBar'],
  'status-tabs': ['StatusTabs'],
  'list-card': ['ListCard'],
  'form-field': [
    'FormField',
    'DatePickerField',
    'PickerField',
    'EntityPickerField',
    'MultiEntityPickerField',
    'TreePickerField',
    'ChipSelectField',
    'CheckboxField',
    'QuickNumInput',
    'ScanInput',
  ],
  'text-action': ['ActionButton'],
  'icon-action': ['IconActionButton'],
});

const SUNXU_MODULES = new Set(['sunxu', 'sunxu/core']);

function isFunction(node) {
  return (
    node?.type === 'FunctionDeclaration' ||
    node?.type === 'FunctionExpression' ||
    node?.type === 'ArrowFunctionExpression'
  );
}

function unwrapComponent(node) {
  if (isFunction(node)) return node;
  if (node?.type === 'CallExpression') {
    return node.arguments.map(unwrapComponent).find(Boolean);
  }
  return null;
}

function componentName(node) {
  if (node?.type === 'FunctionDeclaration' || node?.type === 'FunctionExpression') {
    return node.id?.name ?? null;
  }
  if (node?.type === 'VariableDeclarator') return node.id?.type === 'Identifier' ? node.id.name : null;
  return null;
}

function childNodes(node, visitorKeys) {
  const keys = visitorKeys?.[node.type] ?? Object.keys(node).filter((key) => key !== 'parent');
  return keys.flatMap((key) => {
    const child = node[key];
    return Array.isArray(child) ? child.filter((value) => value && typeof value.type === 'string') :
      child && typeof child.type === 'string' ? [child] : [];
  });
}

function visitWithinFunction(node, visitorKeys, visitor, isRoot = true) {
  if (!node || typeof node.type !== 'string') return;
  if (!isRoot && isFunction(node)) return;
  visitor(node);
  for (const child of childNodes(node, visitorKeys)) {
    visitWithinFunction(child, visitorKeys, visitor, false);
  }
}

function hasJSX(functionNode, visitorKeys) {
  let found = false;
  visitWithinFunction(functionNode.body, visitorKeys, (node) => {
    if (node.type === 'JSXElement' || node.type === 'JSXFragment') found = true;
  });
  return found;
}

function jsxName(node) {
  if (node?.type !== 'JSXElement') return null;
  const name = node.openingElement?.name;
  return name?.type === 'JSXIdentifier' ? name.name : null;
}

function jsxOpeningName(node) {
  if (node.type !== 'JSXOpeningElement') return null;
  const name = node.name;
  return name.type === 'JSXIdentifier' ? name.name : null;
}

function jsxNamesInFunction(functionNode, visitorKeys) {
  const names = [];
  function visit(node) {
    if (!node || typeof node.type !== 'string') return;
    const name = jsxOpeningName(node);
    if (name) names.push(name);
    for (const child of childNodes(node, visitorKeys)) visit(child);
  }
  visit(functionNode.body);
  return names;
}

function collectReturnedRoots(expression, roots) {
  if (!expression) return;
  if (expression.type === 'JSXElement') {
    roots.push(expression);
    return;
  }
  if (expression.type === 'JSXFragment') {
    for (const child of expression.children ?? []) {
      if (child.type === 'JSXElement') roots.push(child);
      else if (child.type === 'JSXExpressionContainer') collectReturnedRoots(child.expression, roots);
    }
    return;
  }
  if (expression.type === 'ConditionalExpression') {
    collectReturnedRoots(expression.consequent, roots);
    collectReturnedRoots(expression.alternate, roots);
    return;
  }
  if (expression.type === 'LogicalExpression') collectReturnedRoots(expression.right, roots);
}

function returnedRootNames(functionNode, visitorKeys) {
  const roots = [];
  if (functionNode.body.type !== 'BlockStatement') {
    collectReturnedRoots(functionNode.body, roots);
  } else {
    visitWithinFunction(functionNode.body, visitorKeys, (node) => {
      if (node.type === 'ReturnStatement') collectReturnedRoots(node.argument, roots);
    });
  }
  return roots.map(jsxName).filter(Boolean);
}

function getLeadingDoc(sourceCode, node) {
  const comments = sourceCode.getCommentsBefore(node);
  const lastComment = comments[comments.length - 1];
  if (!lastComment || lastComment.type !== 'Block' || !lastComment.value.trim().startsWith('*')) return '';
  return lastComment.value;
}

function hasTag(doc, tag, valuePattern = '[^\\s*]+') {
  return new RegExp(`@${tag}\\s+${valuePattern}`).test(doc);
}

function exportedComponents(node, sourceCode) {
  const declaration = node.declaration;
  if (!declaration) return [];

  const visitorKeys = sourceCode.visitorKeys;
  if (node.type === 'ExportNamedDeclaration' && node.exportKind === 'type') return [];

  if (node.type === 'ExportDefaultDeclaration' && declaration.type === 'Identifier') {
    const declarations = sourceCode.ast.body
      .map((statement) => statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement)
      .filter(Boolean)
      .flatMap((statement) => {
        if (statement.type === 'FunctionDeclaration' && statement.id?.name === declaration.name) return [statement];
        if (statement.type === 'VariableDeclaration') {
          return statement.declarations.filter((item) => item.id?.type === 'Identifier' && item.id.name === declaration.name);
        }
        return [];
      });
    return declarations.flatMap((item) => {
      const fn = unwrapComponent(item.type === 'VariableDeclarator' ? item.init : item);
      if (!fn || !hasJSX(fn, visitorKeys)) return [];
      return [{ name: componentName(item) ?? componentName(fn) ?? declaration.name, fn, docNode: item }];
    });
  }

  const declarations = declaration.type === 'VariableDeclaration' ? declaration.declarations : [declaration];
  return declarations.flatMap((item) => {
    const fn = unwrapComponent(item.type === 'VariableDeclarator' ? item.init : item);
    if (!fn || !hasJSX(fn, visitorKeys)) return [];
    const name = componentName(item) ?? componentName(fn) ?? 'default export';
    if (name !== 'default export' && !/^[A-Z]/.test(name)) return [];
    return [{ name, fn, docNode: node }];
  });
}

function createClassificationRule() {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Require exported React components to declare their Sunxu scope.' },
      schema: [],
      messages: {
        missing: 'Exported React component "{{name}}" must declare @sunxu-component shared or business-specific.',
        invalid: 'Component "{{name}}" must use @sunxu-component shared or business-specific.',
        domain: 'Business-specific component "{{name}}" must declare @sunxu-domain <domain>.',
        reason: 'Business-specific component "{{name}}" must declare @sunxu-reason <why it stays business-specific>.',
      },
    },
    create(context) {
      const sourceCode = context.sourceCode ?? context.getSourceCode();
      const inspected = new Set();
      return {
        ExportNamedDeclaration(node) {
          inspect(node);
        },
        ExportDefaultDeclaration(node) {
          inspect(node);
        },
      };

      function inspect(node) {
        for (const component of exportedComponents(node, sourceCode)) {
          const key = component.fn.range?.join(':') ?? component.name;
          if (inspected.has(key)) continue;
          inspected.add(key);
          const doc = getLeadingDoc(sourceCode, component.docNode);
          const match = doc.match(/@sunxu-component\s+([^\s*]+)/);
          if (!match) {
            context.report({ node, messageId: 'missing', data: { name: component.name } });
            continue;
          }
          const scope = match[1];
          if (scope !== 'shared' && scope !== 'business-specific') {
            context.report({ node, messageId: 'invalid', data: { name: component.name } });
            continue;
          }
          if (scope === 'business-specific') {
            if (!hasTag(doc, 'sunxu-domain')) {
              context.report({ node, messageId: 'domain', data: { name: component.name } });
            }
            if (!hasTag(doc, 'sunxu-reason')) {
              context.report({ node, messageId: 'reason', data: { name: component.name } });
            }
          }
        }
      }
    },
  };
}

function createPageContainerRule() {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Require each annotated screen to use its matching Sunxu page container.' },
      schema: [],
      messages: {
        missingPage: 'Screen "{{name}}" must declare @sunxu-page list, form, detail, map, or custom.',
        invalidPage: 'Screen "{{name}}" has an unsupported @sunxu-page value "{{page}}".',
        customReason: 'A custom screen "{{name}}" must explain why standard page containers do not fit with @sunxu-reason.',
        container: 'Screen "{{name}}" is marked @sunxu-page {{page}} and must return {{expected}} as its outer page container.',
      },
    },
    create(context) {
      const sourceCode = context.sourceCode ?? context.getSourceCode();
      const imports = new Map();
      const visitorKeys = sourceCode.visitorKeys;
      const inspected = new Set();

      return {
        ImportDeclaration(node) {
          if (!SUNXU_MODULES.has(node.source.value)) return;
          for (const specifier of node.specifiers) {
            if (specifier.type !== 'ImportSpecifier') continue;
            const imported = specifier.imported.name ?? specifier.imported.value;
            imports.set(specifier.local.name, imported);
          }
        },
        ExportNamedDeclaration(node) {
          inspect(node);
        },
        ExportDefaultDeclaration(node) {
          inspect(node);
        },
      };

      function inspect(node) {
        for (const component of exportedComponents(node, sourceCode)) {
          const key = component.fn.range?.join(':') ?? component.name;
          if (inspected.has(key)) continue;
          inspected.add(key);
          const doc = getLeadingDoc(sourceCode, component.docNode);
          const match = doc.match(/@sunxu-page\s+([^\s*]+)/);
          if (!match) {
            context.report({ node, messageId: 'missingPage', data: { name: component.name } });
            continue;
          }
          const page = match[1];
          const expected = PAGE_CONTRACTS[page];
          if (!expected) {
            context.report({ node, messageId: 'invalidPage', data: { name: component.name, page } });
            continue;
          }
          if (page === 'custom' && !hasTag(doc, 'sunxu-reason')) {
            context.report({ node, messageId: 'customReason', data: { name: component.name } });
          }

          const rootNames = returnedRootNames(component.fn, visitorKeys)
            .map((name) => imports.get(name) ?? name);
          if (!expected.some((name) => rootNames.includes(name))) {
            context.report({
              node,
              messageId: 'container',
              data: { name: component.name, page, expected: expected.join(' or ') },
            });
          }
        }
      }
    },
  };
}

function createNoNativeTextRule() {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Require Sunxu AppText for visible React Native text in screens.' },
      schema: [],
      messages: {
        nativeText: 'Use Sunxu AppText instead of React Native Text so user font scaling stays consistent.',
      },
    },
    create(context) {
      const imports = new Set();
      const namespaces = new Set();
      return {
        ImportDeclaration(node) {
          if (node.source.value !== 'react-native') return;
          for (const specifier of node.specifiers) {
            if (specifier.type === 'ImportSpecifier' && (specifier.imported.name ?? specifier.imported.value) === 'Text') {
              imports.add(specifier.local.name);
            }
            if (specifier.type === 'ImportNamespaceSpecifier') namespaces.add(specifier.local.name);
          }
        },
        JSXOpeningElement(node) {
          const name = node.name;
          const named = name.type === 'JSXIdentifier' && imports.has(name.name);
          const namespaced = name.type === 'JSXMemberExpression' &&
            name.object.type === 'JSXIdentifier' && namespaces.has(name.object.name) &&
            name.property.type === 'JSXIdentifier' && name.property.name === 'Text';
          if (named || namespaced) context.report({ node, messageId: 'nativeText' });
        },
      };
    },
  };
}

function createRequiredComponentsRule() {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Require Sunxu components declared by each component usage feature.' },
      schema: [],
      messages: {
        unknown: 'Unsupported @sunxu-use value "{{feature}}". See the Sunxu component usage policy.',
        missing: 'Component "{{name}}" declares @sunxu-use {{feature}} and must use {{expected}} in its JSX.',
      },
    },
    create(context) {
      const sourceCode = context.sourceCode ?? context.getSourceCode();
      const visitorKeys = sourceCode.visitorKeys;
      const imports = new Map();
      const inspected = new Set();
      return {
        ImportDeclaration(node) {
          if (!SUNXU_MODULES.has(node.source.value)) return;
          for (const specifier of node.specifiers) {
            if (specifier.type !== 'ImportSpecifier') continue;
            const imported = specifier.imported.name ?? specifier.imported.value;
            imports.set(specifier.local.name, imported);
          }
        },
        ExportNamedDeclaration(node) {
          inspect(node);
        },
        ExportDefaultDeclaration(node) {
          inspect(node);
        },
      };

      function inspect(node) {
        for (const component of exportedComponents(node, sourceCode)) {
          const key = component.fn.range?.join(':') ?? component.name;
          if (inspected.has(key)) continue;
          inspected.add(key);
          const doc = getLeadingDoc(sourceCode, component.docNode);
          const features = [...doc.matchAll(/@sunxu-use\s+([^\s*]+)/g)].map((match) => match[1]);
          if (features.length === 0) continue;

          const used = new Set(jsxNamesInFunction(component.fn, visitorKeys).map((name) => imports.get(name) ?? name));
          for (const feature of features) {
            const expected = USE_CONTRACTS[feature];
            if (!expected) {
              context.report({ node, messageId: 'unknown', data: { feature } });
              continue;
            }
            if (!expected.some((name) => used.has(name))) {
              context.report({
                node,
                messageId: 'missing',
                data: { name: component.name, feature, expected: expected.join(' or ') },
              });
            }
          }
        }
      }
    },
  };
}

const plugin = {
  meta: { name: 'eslint-plugin-sunxu', version: '0.1.0' },
  rules: {
    'component-classification': createClassificationRule(),
    'page-container': createPageContainerRule(),
    'no-native-text': createNoNativeTextRule(),
    'required-components': createRequiredComponentsRule(),
  },
  configs: {},
};

plugin.configs['components/recommended'] = {
  plugins: { sunxu: plugin },
  rules: {
    'sunxu/component-classification': 'error',
    'sunxu/required-components': 'error',
  },
};
plugin.configs['screens/recommended'] = {
  plugins: { sunxu: plugin },
  rules: {
    'sunxu/component-classification': 'error',
    'sunxu/page-container': 'error',
    'sunxu/no-native-text': 'error',
    'sunxu/required-components': 'error',
  },
};

export { PAGE_CONTRACTS, USE_CONTRACTS };
export default plugin;
