import { normalizePath } from 'unplugin-utils';

/**
 * Resolve import path with alias mapping and remove file extensions
 *
 * 解析导入路径，进行别名映射并移除文件扩展名
 *
 * @param filePath - The original file path to resolve
 * @param alias - The alias mapping configuration
 * @returns The resolved import path
 */
export function resolveImportPath(filePath: string, alias: Record<string, string>) {
  let iPath = normalizePath(filePath);

  const aliasEntries = Object.entries(alias);

  aliasEntries.some(item => {
    const [a, dir] = item;
    const normalizeDir = normalizePath(dir);
    const match = iPath.startsWith(normalizeDir);

    if (match) {
      iPath = iPath.replace(normalizeDir, a);
    }

    return match;
  });

  const exts = ['.tsx', '.jsx'];

  const findExt = exts.find(ext => iPath.endsWith(ext));

  if (findExt) {
    iPath = iPath.replace(findExt, '');
  }

  return iPath;
}
