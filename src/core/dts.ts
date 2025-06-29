import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import { createPrefixCommentOfGenFile, ensureFile } from '../shared';
import type { AutoRouterNode, ParsedAutoRouterOptions } from '../types';
import {
  NOT_FOUND_ROUTE_NAME,
  REACT_ROUTER_MODULE_NAME,
  ROOT_ROUTE_NAME,
  SKYROC_ROUTER_TYPES_MODULE_NAME
} from '../constants';

/**
 * Generate TypeScript declaration files for both Vue Router and React Router
 *
 * 生成 React Router 的 TypeScript 声明文件
 *
 * @param nodes - Array of router nodes to generate types for
 * @param options - The parsed router options
 */
export async function generateDtsFile(nodes: AutoRouterNode[], options: ParsedAutoRouterOptions) {
  const dtsPath = path.posix.join(options.cwd, options.dts);
  const reactRouterDtsPath = path.posix.join(options.cwd, options.reactRouterDts);

  await ensureFile(dtsPath);
  await ensureFile(reactRouterDtsPath);

  const code = getDtsCode(nodes);
  await writeFile(dtsPath, code);

  const reactRouterCode = getReactRouterDtsCode(nodes);
  await writeFile(reactRouterDtsPath, reactRouterCode);
}

/**
 * Generate React Router TypeScript declaration code
 *
 * 生成 React Router 的 TypeScript 声明代码
 *
 * @param nodes - Array of router nodes to generate types for
 * @param options - The parsed router options
 * @returns The generated TypeScript declaration code
 */
function getDtsCode(nodes: AutoRouterNode[]) {
  const reuseNodes = nodes.filter(node => node.isReuse);

  const prefixComment = createPrefixCommentOfGenFile();

  let code = `${prefixComment}

declare module "${SKYROC_ROUTER_TYPES_MODULE_NAME}" {
  type RouteRecordSingleView = import("vue-router").RouteRecordSingleView;
  type RouteRecordRedirect = import("vue-router").RouteRecordRedirect;
  type RouteComponent = import("vue-router").RouteComponent;

  type Lazy<T> = () => Promise<T>;

  export type RawRouteComponent = RouteComponent | Lazy<RouteComponent>;



  /**
   * route path map
   */
  export type RoutePathMap = {`;

  nodes.forEach(node => {
    code += `\n    "${node.name}": "${node.path}";`;
  });

  code += `
  };

  /**
   * route key
   */
  export type RouteKey = keyof RoutePathMap;

  /**
   * route path
   */
  export type RoutePath = RoutePathMap[RouteKey];

  /**
   * root route key
   */
  export type RootRouteKey = '${ROOT_ROUTE_NAME}';

  /**
   * not found route key
   */
  export type NotFoundRouteKey = '${NOT_FOUND_ROUTE_NAME}';

  /**
   * builtin route key
   */
  export type BuiltinRouteKey = RootRouteKey | NotFoundRouteKey;

  /**
   * reuse route key
   */
  export type ReuseRouteKey = Extract<
    RouteKey,`;

  reuseNodes.forEach(node => {
    code += `\n    | "${node.name}"`;
  });

  code += `
  >;

  /**
   * the route file key, which has it's own file
   */
  export type RouteFileKey = Exclude<RouteKey, BuiltinRouteKey | ReuseRouteKey>;

  /**
   * mapped name and path
   */
  type MappedNamePath = {
    [K in RouteKey]: { name: K; path: RoutePathMap[K] };
  }[RouteKey];

  /**
   * auto router single view
   */
  export type AutoRouterSingleView = Omit<RouteRecordSingleView, 'component' | 'name' | 'path'> & {
    component: RouteFileKey;
    layout: RouteLayoutKey;
  } & MappedNamePath;

  /**
   * auto router redirect
   */
  export type AutoRouterRedirect = Omit<RouteRecordRedirect, 'children' | 'name' | 'path'> & MappedNamePath;

  /**
   * auto router route
   */
  export type AutoRouterRoute = AutoRouterSingleView | AutoRouterRedirect;
}
`;

  return code;
}

/**
 * Generate React Router TypeScript declaration code
 *
 * 生成 React Router 的 TypeScript 声明代码
 *
 * @param nodes - Array of router nodes to generate types for
 * @returns The generated TypeScript declaration code
 */
function getReactRouterDtsCode(nodes: AutoRouterNode[]) {
  const prefixComment = createPrefixCommentOfGenFile(true);

  const code = `${prefixComment}

export {}

declare module "${REACT_ROUTER_MODULE_NAME}" {
  type RouteNamedMap = import("${REACT_ROUTER_MODULE_NAME}").RouteNamedMap;

  export interface TypesConfig {
    RouteNamedMap: RouteNamedMap;
  }
}

declare module "${REACT_ROUTER_MODULE_NAME}" {
  import type { RouteParamsRawGeneric, RouteParamsGeneric, RouteMeta, RouteRecordInfo, ParamValue, ParamValueZeroOrOne } from "${REACT_ROUTER_MODULE_NAME}";

  /**
   * route named map
  */
  export interface RouteNamedMap {
    ${nodes.map(node => `"${node.name}": RouteRecordInfo<"${node.name}", "${node.path}", ${generateRouteParams(node, true)}, ${generateRouteParams(node, false)}>`).join(';\n    ')}
  }
}
`;

  return code;
}

/**
 * Generate route parameters type definition
 *
 * 生成路由参数类型定义
 *
 * @param node - The router node to generate parameters for
 * @param isRaw - Whether to generate raw parameter types
 * @returns The generated parameter type definition code
 */
export function generateRouteParams(node: AutoRouterNode, isRaw: boolean) {
  const { params } = node;

  const paramEntries = Object.entries(params || {});

  if (!paramEntries.length) {
    return 'Record<never, never>';
  }

  const paramsCode = `{ ${paramEntries
    .map(
      ([paramName, paramType]) =>
        `${paramName}${paramType === 'optional' ? '?' : ''}: ${paramType === 'optional' ? `ParamValueZeroOrOne<${isRaw}>` : `ParamValue<${isRaw}>`}`
    )
    .join(', ')} }`;

  return paramsCode;
}
