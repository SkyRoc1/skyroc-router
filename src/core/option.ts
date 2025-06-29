import process from 'node:process';
import { normalizePath } from 'unplugin-utils';
import { pascalCase, resolveAliasFromTsConfig, transformPathToName } from '../shared';
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

  const splatsAlias = 'splats';

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
    splatsAlias,
    rootRedirect: '/home',
    notFoundRouteComponent: '404',
    getRoutePath: node => node.path,
    getRouteName: node => transformPathToName(node.path, splatsAlias),
    routeLazy: () => true,
    getRouteMeta: () => null
  };

  const { ...restOptions } = Object.assign(defaultOptions, options);

  const pageInclude = Array.isArray(restOptions.pageInclude) ? restOptions.pageInclude : [restOptions.pageInclude];

  restOptions.cwd = normalizePath(restOptions.cwd);
  restOptions.splatsAlias ||= splatsAlias;
  restOptions.defaultReuseRouteComponent = pascalCase(restOptions.defaultReuseRouteComponent);
  restOptions.notFoundRouteComponent = pascalCase(restOptions.notFoundRouteComponent);

  const parsedOptions: ParsedAutoRouterOptions = {
    pageExtension: pageInclude.map(item => item.split('.').pop()!),
    ...restOptions
  };

  return parsedOptions;
}
