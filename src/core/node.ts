import { yellow } from 'kolorist';
import { getImportName, logger } from '../shared';
import { BUILT_IN_ROUTE, INDEX_FILE_REG, NOT_FOUND_ROUTE_NAME, NO_FILE_INODE, ROOT_ROUTE_NAME } from '../constants';
import type {
  AutoRouterNode,
  AutoRouterParamType,
  NodeStatInfo,
  ParsedAutoRouterOptions,
  ResolvedGlob
} from '../types';
import { getNodeBackup } from './temp';

/**
 * Resolve all route nodes from globs including builtin, filtered and reuse nodes
 *
 * 从 glob 解析所有路由节点，包括内置节点、过滤后的节点和复用节点
 *
 * @param globs - The resolved glob patterns
 * @param options - The parsed router options
 * @returns Array of sorted route nodes
 */
export function resolveNodes(globs: ResolvedGlob[], options: ParsedAutoRouterOptions) {
  const nodes = globs.map(glob => resolveNode(glob, options));

  const builtinNodes = createBuiltinNode(options);
  const filteredNodes = filterConflictNodes(nodes);
  const reuseNodes = resolveReuseNode(options);

  const result = [...builtinNodes, ...filteredNodes, ...reuseNodes];

  result.sort((a, b) => sortNodeName(a.name, b.name));

  return result;
}

/**
 * Sort node names with special handling for root and not found routes
 *
 * 对节点名称进行排序，特殊处理根路由和404路由
 *
 * @param preName - Previous node name
 * @param curName - Current node name
 * @returns Sort order number
 */
export function sortNodeName(preName: string, curName: string) {
  if (preName === ROOT_ROUTE_NAME) {
    return -1;
  }

  if (curName === ROOT_ROUTE_NAME) {
    return 1;
  }

  if (preName === NOT_FOUND_ROUTE_NAME) {
    return -1;
  }

  if (curName === NOT_FOUND_ROUTE_NAME) {
    return 1;
  }

  return preName.localeCompare(curName);
}

/**
 * Get node status information by comparing with backup
 *
 * 通过与备份比较获取节点状态信息
 *
 * @param cwd - Current working directory
 * @param nodes - Array of router nodes
 * @returns Node status information including added and renamed nodes
 */
export async function getNodeStatInfo(cwd: string, nodes: AutoRouterNode[]) {
  const preStat = await getNodeBackup(cwd);
  const preStatInodes = Object.values(preStat).map(item => item.inode);

  const info: NodeStatInfo = {
    add: [],
    rename: []
  };

  nodes.forEach(node => {
    const { name, inode } = node;

    if (inode === NO_FILE_INODE) return;

    const preInode = preStat[name];

    if (!preInode && !preStatInodes.includes(inode)) {
      info.add.push(node);
      return;
    }

    if (preStatInodes.includes(inode)) {
      const oldNodeName = Object.entries(preStat).find(([_, item]) => item.inode === inode)?.[0];

      if (oldNodeName && oldNodeName !== name) {
        info.rename.push({ ...node, oldNodeName });
      }
    }
  });

  return info;
}

/**
 * Resolve a single node from glob pattern
 *
 * 从 glob 模式解析单个节点
 *
 * @param resolvedGlob - The resolved glob pattern
 * @param options - The parsed router options
 * @returns The resolved router node
 */
export function resolveNode(resolvedGlob: ResolvedGlob, options: ParsedAutoRouterOptions) {
  const { getRouteName, routeLazy } = options;

  const resolvedPath = resolveGlobPath(resolvedGlob, options.pageExtension);

  let node: AutoRouterNode = {
    ...resolvedGlob,
    path: resolvedPath,
    get name() {
      return getRouteName(node);
    },
    originPath: resolvedPath,
    get component() {
      return node.name;
    },

    get importName() {
      return getImportName(node.name);
    },
    get isLazy() {
      return routeLazy(node);
    }
  };

  node = resolveGroupNode(node);
  node = resolveParamNode(node);

  return node;
}

/**
 * Create reuse nodes from route paths
 *
 * 从路由路径创建复用节点
 *
 * @param options - The parsed router options
 * @returns Array of reuse nodes
 */
function resolveReuseNode(options: ParsedAutoRouterOptions) {
  const { reuseRoutes, defaultReuseRouteComponent } = options;

  const nodes: AutoRouterNode[] = [];

  reuseRoutes.forEach(path => {
    let node: AutoRouterNode = createEmptyReuseNode(path, options);
    node.component = defaultReuseRouteComponent;

    node = resolveParamNode(node);

    nodes.push(node);
  });

  return nodes;
}

/**
 * Create builtin nodes (root and not found routes)
 *
 * 创建内置节点（根路由和404路由）
 *
 * @param options - The parsed router options
 * @returns Array of builtin nodes
 */
function createBuiltinNode(options: ParsedAutoRouterOptions) {
  const { notFoundRouteComponent } = options;

  const rootPath = BUILT_IN_ROUTE[ROOT_ROUTE_NAME];

  const rootNode: AutoRouterNode = {
    path: rootPath,
    name: ROOT_ROUTE_NAME,
    originPath: rootPath,
    component: '',
    isBuiltin: true,
    pageDir: '',
    glob: '',
    filePath: '',
    importName: '',
    importPath: '',
    inode: NO_FILE_INODE
  };

  const notFoundPath = BUILT_IN_ROUTE[NOT_FOUND_ROUTE_NAME];

  const notFoundNode: AutoRouterNode = {
    path: notFoundPath,
    name: NOT_FOUND_ROUTE_NAME,
    originPath: notFoundPath,
    component: notFoundRouteComponent,

    isBuiltin: true,
    pageDir: '',
    glob: '',
    filePath: '',
    importName: '',
    importPath: '',
    inode: NO_FILE_INODE
  };

  return [rootNode, notFoundNode];
}

/**
 * Create an empty reuse node from path
 *
 * 从路径创建空的复用节点
 *
 * @param path - The route path
 * @param options - The parsed router options
 * @returns The empty reuse node
 */
function createEmptyReuseNode(path: string, options: ParsedAutoRouterOptions) {
  const { getRouteName } = options;

  let node: AutoRouterNode = {
    path,
    get name() {
      return getRouteName(node);
    },
    originPath: path,
    component: '',

    isReuse: true,
    pageDir: '',
    glob: '',
    filePath: '',
    importName: '',
    importPath: '',
    inode: NO_FILE_INODE
  };

  node = resolveParamNode(node);

  return node;
}

/**
 * Resolve glob pattern to route path
 *
 * 将 glob 模式解析为路由路径
 *
 * @param resolvedGlob - The resolved glob pattern
 * @param extension - Array of file extensions
 * @returns The resolved route path
 */
function resolveGlobPath(resolvedGlob: ResolvedGlob, extension: string[]) {
  const { glob } = resolvedGlob;

  let globPath = glob;
  if (!globPath.startsWith('/')) {
    globPath = `/${globPath}`;
  }

  extension.forEach(ext => {
    if (globPath.endsWith(`.${ext}`)) {
      globPath = globPath.replace(`.${ext}`, '');
    }
  });

  if (globPath.endsWith('/index')) {
    globPath = globPath.replace(INDEX_FILE_REG, '');
  }

  return globPath;
}

/**
 * Resolve group node from path pattern
 *
 * 从路径模式解析分组节点
 *
 * @example
 *   `src/pages/(builtin)/login/index.vue`;
 *
 * @param node - The router node to resolve
 * @returns The resolved node with group information
 */
function resolveGroupNode(node: AutoRouterNode) {
  const GROUP_REG = /\/\((\w+)\)\//;

  const match = node.path.match(GROUP_REG);

  if (match) {
    const [matchItem, group] = match;
    node.group = group;
    node.path = node.path.replace(matchItem, '/');
  }

  return node;
}

/**
 * Resolve parameter node from path pattern
 *
 * 从路径模式解析参数节点
 *
 * @example
 *   `src/pages/list/[id].vue`;
 *   `src/pages/list/[[id]].vue`;
 *   `src/pages/list/edit_[id]_[userId].vue`;
 *   `src/pages/list/detail/[id]/[userId].vue`;
 *
 * @param node - The router node to resolve
 * @returns The resolved node with parameter information
 */
function resolveParamNode(node: AutoRouterNode) {
  // 1. 先将 [id]/[[id]] 转换为 /:id/:id?
  const optional = getOptionalParamsByPath(node.path);
  if (optional) {
    node.path = optional.path;
  } else {
    const required = getParamsByPath(node.path);
    if (required) {
      node.path = required.path;
    }
  }
  // 2. 再统一从 /:id/:id? 这种格式中提取参数
  const paramInfo = getParamsFromRoutePath(node.path);
  if (paramInfo?.params) {
    node.params = { ...node.params, ...paramInfo.params };
  }

  return node;
}

/**
 * Extract parameters from route path
 *
 * 从路由路径中提取参数
 *
 * @param nodePath - The route path to extract parameters from
 * @returns The parameters and modified path
 */
function getParamsFromRoutePath(nodePath: string) {
  // 匹配 :param 和 :param?，不匹配 ::
  const PARAM_REG = /:(\w+)(\?)?/g;
  const params: Record<string, AutoRouterParamType> = {};
  let match: RegExpExecArray | null;

  while ((match = PARAM_REG.exec(nodePath)) !== null) {
    const [, param, optional] = match;
    params[param] = optional === '?' ? 'optional' : 'required';
  }

  return Object.keys(params).length > 0 ? { params, path: nodePath } : null;
}

/**
 * Extract optional parameters from path
 *
 * 从路径中提取可选参数
 *
 * @param nodePath - The route path to extract optional parameters from
 * @returns The optional parameters and modified path
 */
function getOptionalParamsByPath(nodePath: string) {
  // 1. 处理 catch-all 路由 [...param]
  const catchAllReg = /\[\.\.\.(\w+)\]/;
  const catchMatch = nodePath.match(catchAllReg);
  if (catchMatch) {
    const param = catchMatch[1];
    // 替换末尾 [...param] 为 /*
    const path = nodePath.replace(/\/\[\.\.\.[^\]]+\]/, '/*');
    return { params: { [param]: 'required' }, path };
  }
  const OPTIONAL_PARAM_REG = /\[\[(\w+)\]\]/g;

  const match = nodePath.match(OPTIONAL_PARAM_REG);

  if (!match) {
    return null;
  }

  const params: Record<string, AutoRouterParamType> = {};
  let formatPath = nodePath;

  match.forEach(item => {
    const param = item.slice(2, -2);
    params[param] = 'optional';
  });

  formatPath = nodePath.replace(OPTIONAL_PARAM_REG, ':$1?');
  formatPath = formatPath.replace(/_:/g, '/:');

  const BETWEEN_REG = /\/:\w+\??\w+\/:/;
  formatPath = formatPath.replace(BETWEEN_REG, item => item.replace('_', '/'));

  return { params, path: formatPath };
}

/**
 * Extract required parameters from path
 *
 * 从路径中提取必需参数
 *
 * @param nodePath - The route path to extract required parameters from
 * @returns The required parameters and modified path
 */
function getParamsByPath(nodePath: string) {
  const PARAM_REG = /\[(\w+)\]/g;

  const match = nodePath.match(PARAM_REG);

  if (!match) {
    return null;
  }

  const params: Record<string, AutoRouterParamType> = {};

  let formatPath = nodePath;

  match.forEach(item => {
    const param = item.slice(1, -1);
    params[param] = 'required';
  });

  formatPath = nodePath.replace(PARAM_REG, ':$1');
  formatPath = formatPath.replace(/_:/g, '/:');

  const BETWEEN_REG = /\/:\w+\??\w+\/:/;
  formatPath = formatPath.replace(BETWEEN_REG, item => item.replace('_', '/'));

  return { params, path: formatPath };
}

/**
 * Filter and handle conflicting nodes
 *
 * 过滤并处理冲突的节点
 *
 * @param nodes - Array of router nodes to filter
 * @returns Array of filtered nodes without conflicts
 */
function filterConflictNodes(nodes: AutoRouterNode[]) {
  const nodeMap = new Map<string, AutoRouterNode[]>();

  nodes.forEach(node => {
    const items = nodeMap.get(node.name) ?? [];

    items.push(node);

    nodeMap.set(node.name, items);
  });

  const result: AutoRouterNode[] = [];

  const conflictNodes: AutoRouterNode[] = [];

  nodeMap.forEach(items => {
    result.push(items[0]);

    if (items.length > 1) {
      conflictNodes.push(...items);
    }
  });

  if (conflictNodes.length > 0) {
    logger.warn(`${yellow('conflict routes, use the first one by default【路由冲突，默认取第一个】: ')}`);
    logger.table(
      conflictNodes.map(item => ({
        name: item.name,
        path: item.path,
        glob: item.glob
      }))
    );
  }

  return result;
}
