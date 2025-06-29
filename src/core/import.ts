import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import { createPrefixCommentOfGenFile, ensureFile, groupNodes } from '../shared';
import type { AutoRouterNode, ParsedAutoRouterOptions } from '../types';
import { SKYROC_ROUTER_TYPES_MODULE_NAME } from '../constants';

/**
 * Generate imports file for layouts and views
 *
 * 生成布局和视图的导入文件
 *
 * @param nodes - Array of router nodes to generate imports for
 * @param options - The parsed router options
 */
export async function generateImportsFile(nodes: AutoRouterNode[], options: ParsedAutoRouterOptions) {
  const { cwd, routerGeneratedDir } = options;

  const importsPath = path.posix.join(cwd, routerGeneratedDir, 'imports.ts');

  await ensureFile(importsPath);

  const code = getImportsCode(nodes);

  await writeFile(importsPath, code);
}

/**
 * Generate TypeScript code for importing layouts and views
 *
 * 生成布局和视图的 TypeScript 导入代码
 *
 * @param nodes - Array of router nodes to generate imports for
 * @param options - The parsed router options
 * @returns The generated import code including layouts and views
 */
export function getImportsCode(nodes: AutoRouterNode[]) {
  const preCode = createPrefixCommentOfGenFile();

  const { layouts, pages, errors, loadings } = groupNodes(nodes);

  let importCode = `import type { RouteFileKey, RouteLayoutKey, RawRouteComponent } from "${SKYROC_ROUTER_TYPES_MODULE_NAME}";\n`;
  const layoutResult = generateImportBlock({
    nodes: layouts,
    recordName: 'layouts',
    useLazy: node => node.isLazy ?? false
  });
  importCode += layoutResult.importStatements;

  const viewsResult = generateImportBlock({
    nodes: pages,
    recordName: 'views',
    useLazy: node => node.isLazy ?? false
  });
  importCode += viewsResult.importStatements;

  const errorsResult = generateImportBlock({
    nodes: errors,
    recordName: 'errors',
    useLazy: node => node.isLazy ?? false
  });
  importCode += errorsResult.importStatements;

  let loadingImportCode = '';
  let loadingExportEntries = '';
  for (const node of loadings) {
    const { name, importName, importPath } = node;
    loadingImportCode += `import ${importName} from "${importPath}";\n`;
    loadingExportEntries += `\n  ${name}${name === importName ? '' : `: ${importName}`},`;
  }
  const loadingExportBlock = `export const loadings: Record<RouteFileKey, RawRouteComponent> = {${loadingExportEntries}\n};\n`;

  return `${preCode}\n\n${importCode}${loadingImportCode}${layoutResult.exportBlock}\n${viewsResult.exportBlock}\n${errorsResult.exportBlock}\n${loadingExportBlock}`;
}

function generateImportBlock({
  nodes,
  recordName,
  useLazy
}: {
  nodes: AutoRouterNode[];
  recordName: string;
  useLazy: (node: AutoRouterNode) => boolean;
}): { importStatements: string; exportBlock: string } {
  let importStatements = '';
  let exportEntries = '';

  for (const node of nodes) {
    const { name, importName, importPath } = node;
    const lazy = useLazy(node);

    if (lazy) {
      exportEntries += `\n  ${name}: () => import("${importPath}"),`;
    } else {
      importStatements += `import ${importName} from "${importPath}";\n`;
      exportEntries += `\n  ${name}${name === importName ? '' : `: ${importName}`},`;
    }
  }

  const exportBlock = `export const ${recordName}: Record<RouteFileKey, RawRouteComponent> = {${exportEntries}\n};\n`;
  return { importStatements, exportBlock };
}
