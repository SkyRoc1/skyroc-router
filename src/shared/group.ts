import type { AutoRouterNode } from '../types';

/**
 * Group router nodes by file type
 *
 * 根据文件类型对路由节点进行分组
 *
 * @param nodes - Array of router nodes to group
 * @returns Grouped router nodes
 */
export function groupNodes(nodes: AutoRouterNode[]) {
  // 首先过滤掉内置和复用的节点
  const filteredNodes = nodes.filter(node => !node.isBuiltin && !node.isReuse);

  // 定义分组结果
  const result = {
    layouts: [] as AutoRouterNode[],
    errors: [] as AutoRouterNode[],
    loadings: [] as AutoRouterNode[],
    pages: [] as AutoRouterNode[]
  };

  // 对节点进行分组
  filteredNodes.forEach(node => {
    const { glob } = node;

    if (glob.endsWith('layout.tsx')) {
      result.layouts.push(node);
    } else if (glob.endsWith('error.tsx')) {
      result.errors.push(node);
    } else if (glob.endsWith('loading.tsx')) {
      result.loadings.push(node);
    } else {
      result.pages.push(node);
    }
  });

  return result;
}
