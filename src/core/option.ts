import process from 'node:process';
import path from 'node:path';
import { normalizePath } from 'unplugin-utils';
import { getImportName, pascalCase, resolveAliasFromTsConfig, resolveImportPath, transformPathToName } from '../shared';
import type { AutoRouterOptions, ParsedAutoRouterOptions } from '../types';

/**
 * Resolve and normalize router options with default values
 *
 * 解析并规范化路由选项，并设置默认值
 *
 * @param options - The router options to resolve
 * @returns The parsed and normalized router options
 */
export function resolveOptions(options?: AutoRouterOptions): ParsedAutoRouterOptions {
  const cwd = process.cwd();
  const alias = resolveAliasFromTsConfig(cwd, 'tsconfig.json');

  const defaultOptions: Required<AutoRouterOptions> = {
    cwd,
    watchFile: true,
    fileUpdateDuration: 500,
    pageDir: 'src/pages',
    pageInclude: '**/*.tsx',
    pageExclude: ['**/components/**', '**/modules/**'],
    dts: 'src/types/skyroc-router.d.ts',
    reactRouterDts: 'src/types/typed-router.d.ts',
    tsconfig: 'tsconfig.json',
    alias,
    routerGeneratedDir: 'src/router/_generated',
    reuseRoutes: [],
    defaultReuseRouteComponent: 'Wip',
    rootRedirect: '/home',
    notFoundRouteComponent: '404',
    layouts: {
      base: 'src/layouts/base/index.tsx',
      blank: 'src/layouts/blank/index.tsx'
    },
    layoutLazy: () => true,
    getRoutePath: node => node.path,
    getRouteName: node => transformPathToName(node.path),
    getRouteLayout: () => Object.keys(defaultOptions.layouts)[0],
    routeLazy: () => true,
    getRouteMeta: () => null
  };

  const { layouts, layoutLazy, ...restOptions } = Object.assign(defaultOptions, options);

  const pageInclude = Array.isArray(restOptions.pageInclude) ? restOptions.pageInclude : [restOptions.pageInclude];

  restOptions.cwd = normalizePath(restOptions.cwd);
  restOptions.defaultReuseRouteComponent = pascalCase(restOptions.defaultReuseRouteComponent);
  restOptions.notFoundRouteComponent = pascalCase(restOptions.notFoundRouteComponent);

  if (Object.keys(layouts).length === 0) {
    throw new Error('layouts is required');
  }

  restOptions.getRouteLayout = () => Object.keys(layouts)[0];

  const parsedOptions: ParsedAutoRouterOptions = {
    pageExtension: pageInclude.map(item => item.split('.').pop()!),
    ...restOptions,
    layouts: Object.entries(layouts).map(([name, importPath]) => {
      let importName = getImportName(name);

      if (!importName.endsWith('Layout')) {
        importName = `${importName}Layout`;
      }

      const iPath = path.resolve(cwd, importPath);
      const $importPath = normalizePath(resolveImportPath(iPath, restOptions.alias));

      return {
        name,
        importPath: $importPath,
        importName,
        isLazy: layoutLazy(name)
      };
    })
  };

  return parsedOptions;
}
