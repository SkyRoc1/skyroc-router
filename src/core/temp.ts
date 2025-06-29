import path from 'node:path';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import type { AutoRouterNode, NodeItemBackup, RouteBackup } from '../types';
import { ensureFile } from '../shared';

const GIT_IGNORE = '.gitignore';
const TEMP_DIR = '.temp';
const NODE_BACKUP = '.node-backup.json';
const ROUTE_BACKUP = '.route-backup.json';
const EXCLUDE_GLOB = '.exclude-glob.json';

/**
 * Initialize temporary files and directories
 *
 * 初始化临时文件和目录
 *
 * @param cwd - The current working directory
 */
export async function initTemp(cwd: string) {
  await initGitIgnore(cwd);
  await initNodeBackup(cwd);
  await initRouteBackup(cwd);
  await initExcludeGlob(cwd);
}

/**
 * Initialize .gitignore file and add temp directory
 *
 * 初始化 .gitignore 文件并添加临时目录
 *
 * @param cwd - The current working directory
 */
async function initGitIgnore(cwd: string) {
  const gitIgnorePath = getGitIgnorePath(cwd);

  if (!existsSync(gitIgnorePath)) {
    await writeFile(gitIgnorePath, '');
  }

  const gitIgnoreContent = await readFile(gitIgnorePath, 'utf-8');
  if (gitIgnoreContent.includes(TEMP_DIR)) return;

  const content = `${gitIgnoreContent}\n${TEMP_DIR}`;
  await writeFile(gitIgnorePath, content);
}

/**
 * Initialize node backup file
 *
 * 初始化节点备份文件
 *
 * @param cwd - The current working directory
 */
async function initNodeBackup(cwd: string) {
  const nodeBackupPath = getNodeBackupPath(cwd);

  if (existsSync(nodeBackupPath)) return;

  await ensureFile(nodeBackupPath);
  await writeFile(nodeBackupPath, '{}');
}

/**
 * Initialize route backup file
 *
 * 初始化路由备份文件
 *
 * @param cwd - The current working directory
 */
async function initRouteBackup(cwd: string) {
  const routeBackupPath = getRouteBackupPath(cwd);

  if (existsSync(routeBackupPath)) return;

  await ensureFile(routeBackupPath);
  await writeFile(routeBackupPath, '{}');
}

/**
 * Initialize exclude glob file
 *
 * 初始化排除 glob 文件
 *
 * @param cwd - The current working directory
 */
async function initExcludeGlob(cwd: string) {
  const excludeGlobPath = getExcludeGlobPath(cwd);

  if (existsSync(excludeGlobPath)) return;

  await ensureFile(excludeGlobPath);
  await writeFile(excludeGlobPath, '[]');
}

/**
 * Get the path to .gitignore file
 *
 * 获取 .gitignore 文件的路径
 *
 * @param cwd - The current working directory
 * @returns The path to .gitignore file
 */
function getGitIgnorePath(cwd: string) {
  return path.resolve(cwd, GIT_IGNORE);
}

/**
 * Get the path to route backup file
 *
 * 获取路由备份文件的路径
 *
 * @param cwd - The current working directory
 * @returns The path to route backup file
 */
function getRouteBackupPath(cwd: string) {
  return path.resolve(cwd, TEMP_DIR, ROUTE_BACKUP);
}

/**
 * Get the path to exclude glob file
 *
 * 获取排除 glob 文件的路径
 *
 * @param cwd - The current working directory
 * @returns The path to exclude glob file
 */
function getExcludeGlobPath(cwd: string) {
  return path.resolve(cwd, TEMP_DIR, EXCLUDE_GLOB);
}

/**
 * Get the path to node backup file
 *
 * 获取节点备份文件的路径
 *
 * @param cwd - The current working directory
 * @returns The path to node backup file
 */
function getNodeBackupPath(cwd: string) {
  return path.resolve(cwd, TEMP_DIR, NODE_BACKUP);
}

/**
 * Get node backup data from backup file
 *
 * 从备份文件中获取节点备份数据
 *
 * @param cwd - The current working directory
 * @returns The node backup data object, returns empty object if file doesn't exist or parsing fails
 */
export async function getNodeBackup(cwd: string) {
  const nodeBackupPath = getNodeBackupPath(cwd);

  const content = await readFile(nodeBackupPath, 'utf-8');

  let backup: Record<string, NodeItemBackup> = {};

  try {
    backup = JSON.parse(content);
  } catch {
    backup = {};
  }

  return backup;
}

/**
 * Get exclude glob data from backup file
 *
 * 从备份文件中获取排除 glob 数据
 *
 * @param cwd - The current working directory
 * @returns The exclude glob data array, returns empty array if file doesn't exist or parsing fails
 */
export async function getExcludeGlob(cwd: string) {
  const excludeGlobPath = getExcludeGlobPath(cwd);

  let excludeGlobs: string[] = [];

  try {
    const content = await readFile(excludeGlobPath, 'utf-8');
    excludeGlobs = JSON.parse(content);
  } catch {
    excludeGlobs = [];
  }

  return excludeGlobs;
}

/**
 * Check if a glob is in the exclude glob list
 *
 * 检查一个 glob 是否在排除 glob 列表中
 *
 * @param cwd - The current working directory
 * @param glob - The glob to check
 * @returns True if the glob is in the exclude glob list, false otherwise
 */
export async function isInExcludeGlob(cwd: string, glob: string) {
  const excludeGlobs = await getExcludeGlob(cwd);
  return excludeGlobs.includes(glob);
}

/**
 * Get node backup item from backup file
 *
 * 从备份文件中获取节点备份数据
 *
 * @param cwd - The current working directory
 * @param name - The name of the node
 * @returns The node backup data object, returns null if the node doesn't exist
 */
export async function getNodeBackupItem(cwd: string, name: string): Promise<NodeItemBackup | null> {
  const backup = await getNodeBackup(cwd);

  return backup[name] || null;
}

/**
 * Get route backup data from backup file
 *
 * 从备份文件中获取路由备份数据
 *
 * @param cwd - The current working directory
 * @returns The route backup data object, returns empty object if file doesn't exist or parsing fails
 */
export async function getRouteBackup(cwd: string) {
  const routeBackupPath = getRouteBackupPath(cwd);

  let backup: RouteBackup = {};

  try {
    const content = await readFile(routeBackupPath, 'utf-8');
    backup = JSON.parse(content);
  } catch {
    backup = {};
  }

  return backup;
}

/**
 * Update route backup data
 *
 * 更新路由备份数据
 *
 * @param cwd - The current working directory
 * @param routeBackup - The route backup data to update
 */
export async function updateRouteBackup(cwd: string, routeBackup: RouteBackup) {
  await initRouteBackup(cwd);

  const backup = await getRouteBackup(cwd);
  Object.assign(backup, routeBackup);

  await writeRouteBackup(cwd, backup);
}

/**
 * Update node backup data
 *
 * 更新节点备份数据
 *
 * @param cwd - The current working directory
 * @param nodes - The nodes to update node backup for
 */
export async function updateNodeBackup(cwd: string, nodes: AutoRouterNode[]) {
  const nodeBackupPath = getNodeBackupPath(cwd);
  await ensureFile(nodeBackupPath);

  const backup: Record<string, NodeItemBackup> = {};

  for (const node of nodes) {
    const name = node.name;
    const inode = node.inode;
    const filepath = node.filePath;

    backup[name] = {
      filepath,
      inode
    };
  }

  const content = JSON.stringify(backup, null, 2);

  await writeFile(nodeBackupPath, content);
}

/**
 * Write route backup data to backup file
 *
 * 将路由备份数据写入备份文件
 *
 * @param cwd - The current working directory
 * @param backup - The route backup data to write
 */
async function writeRouteBackup(cwd: string, backup: RouteBackup) {
  const routeBackupPath = getRouteBackupPath(cwd);
  const content = JSON.stringify(backup, null, 2);
  await writeFile(routeBackupPath, content);
}
