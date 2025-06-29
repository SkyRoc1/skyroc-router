/**
 * Convert string to PascalCase format
 *
 * 将字符串转换为帕斯卡命名法格式
 *
 * @param str - The string to convert
 * @returns The PascalCase formatted string
 */
export function pascalCase(str: string) {
  return str.replace(/(^|[-_])(\w)/g, (_, __, char) => char.toUpperCase());
}

/**
 * Convert string to camelCase format
 *
 * 将字符串转换为驼峰命名法格式
 *
 * @param str - The string to convert
 * @returns The camelCase formatted string
 */
export function camelCase(str: string) {
  return str.replace(/(^|[-_])(\w)/g, (_, __, char) => char.toUpperCase());
}

/**
 * Convert string to kebab-case format
 *
 * 将字符串转换为短横线命名法格式
 *
 * @param str - The string to convert
 * @returns The kebab-case formatted string
 */
export function kebabCase(str: string) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * Get import name with proper formatting and number prefix handling
 *
 * 获取正确格式化的导入名称，处理数字前缀
 *
 * @param name - The original name
 * @returns The formatted import name with underscore prefix for numeric names
 */
export function getImportName(name: string) {
  const NUM_REG = /^\d+$/;

  let key = pascalCase(name);

  if (NUM_REG.test(name)) {
    key = `_${key}`;
  }

  return key;
}

/**
 * Transform file path to route name format
 *
 * 将文件路径转换为路由名称格式
 *
 * @param path - The file path to transform
 * @returns The transformed route name in PascalCase format
 */
export function transformPathToName(path: string, splatsAlias: string) {
  let cleanPath = path.replaceAll(':', '').replaceAll('?', '');

  // 如果以 "/*" 结尾，则替换为 "-splats"
  if (cleanPath.endsWith('/*')) {
    cleanPath = `${cleanPath.slice(0, -2)}-${splatsAlias}`;
  }

  // 将 '/' 转为 '-' 并转成 PascalCase
  const kebab = cleanPath.split('/').filter(Boolean).join('-');
  return pascalCase(kebab);
}
