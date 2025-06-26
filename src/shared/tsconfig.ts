import { readFileSync } from 'node:fs';
import path from 'node:path';
import { normalizePath } from 'unplugin-utils';

/**
 * Resolve path alias configuration from tsconfig.json file
 *
 * 从 tsconfig.json 文件中解析路径别名配置
 *
 * @default 'tsconfig.json'
 * @param cwd - The current working directory
 * @param tsconfigPath - The path to tsconfig.json file
 * @returns The resolved alias mapping object
 */
export function resolveAliasFromTsConfig(cwd: string, tsconfigPath: string = 'tsconfig.json') {
  const tsConfig = readFileSync(path.resolve(cwd, tsconfigPath), 'utf-8');

  let paths: Record<string, string[]> | undefined;

  try {
    paths = JSON.parse(tsConfig)?.compilerOptions?.paths;
  } catch {}

  const alias: Record<string, string> = {};

  Object.entries(paths ?? {}).forEach(([_key, value]) => {
    const key = _key.replace('/*', '');

    alias[key] = normalizePath(path.join(cwd, value[0].replace('/*', '')));
  });

  return alias;
}
