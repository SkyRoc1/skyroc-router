import path from 'node:path';
import { stat } from 'node:fs/promises';
import { normalizePath } from 'unplugin-utils';
import { globSync } from 'tinyglobby';
import { resolveImportPath } from '../shared';
import type { ParsedAutoRouterOptions, ResolvedGlob } from '../types';

/**
 * Resolve all page globs from multiple page directories
 *
 * 从多个页面目录解析所有页面的 glob 匹配
 *
 * @param options - The parsed router options containing page directories and patterns
 * @returns Array of resolved glob objects with file information
 */
export async function resolveGlobs(options: ParsedAutoRouterOptions) {
  const { cwd, pageDir, pageInclude, pageExclude } = options;

  const pageDirs = Array.isArray(pageDir) ? pageDir : [pageDir];

  const pageGlobs = pageDirs.flatMap(dir => {
    const $pageDir = path.resolve(cwd, dir);

    const globs = globSync(pageInclude, {
      cwd: $pageDir,
      onlyFiles: true,
      ignore: pageExclude
    });

    return globs.map(glob => resolveGlob(glob, dir, options));
  });

  const globs: ResolvedGlob[] = await Promise.all(
    pageGlobs.map(async glob => {
      const info = await stat(glob.filePath);

      return {
        ...glob,
        inode: info.ino
      };
    })
  );

  return globs;
}

/**
 * Resolve a single glob pattern to file paths and import paths
 *
 * 解析单个 glob 模式到文件路径和导入路径
 *
 * @param glob - The glob pattern to resolve
 * @param pageDir - The page directory to resolve from
 * @param options - The options containing cwd and alias configuration
 * @returns The resolved glob object without inode information
 */
export function resolveGlob(glob: string, pageDir: string, options: Pick<ParsedAutoRouterOptions, 'cwd' | 'alias'>) {
  const { cwd, alias } = options;

  const $pageDir = path.resolve(cwd, pageDir);

  const filePath = normalizePath(path.resolve($pageDir, glob));
  const importPath = resolveImportPath(filePath, alias);

  const resolvedGlob: Omit<ResolvedGlob, 'inode'> = {
    pageDir,
    glob,
    filePath,
    importPath
  };

  return resolvedGlob as ResolvedGlob;
}
