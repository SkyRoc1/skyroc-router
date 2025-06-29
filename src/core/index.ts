import type { ViteDevServer } from 'vite';
import type { AutoRouterNode, AutoRouterOptions, NodeStatInfo, ParsedAutoRouterOptions, ResolvedGlob } from '@/types';
import { FileWatcher } from './watcher';
import { resolveOptions } from './option';
import { initTemp, isInExcludeGlob, updateNodeBackup } from './temp';
import { resolveGlobs } from './glob';
import { getNodeStatInfo, resolveNodes } from './node';
import { generateDtsFile } from './dts';
import { generateImportsFile } from './import';
import { generateSharedFile, generateTransformerFile } from './generate';
import { generateRoutes } from './route';

/**
 * Auto router class for generating routes automatically
 *
 * 自动路由类，用于自动生成路由
 */
export class AutoRouter {
  private options: ParsedAutoRouterOptions = {} as ParsedAutoRouterOptions;

  watcher?: FileWatcher;

  globs: ResolvedGlob[] = [];

  nodes: AutoRouterNode[] = [];

  viteServer?: ViteDevServer;

  statInfo: NodeStatInfo = {
    add: [],
    rename: []
  };

  /**
   * Create an AutoRouter instance
   *
   * 创建 AutoRouter 实例
   *
   * @param options - The router options
   * @param generate - Whether to generate routes immediately
   */
  constructor(options?: AutoRouterOptions, generate = false) {
    this.init(options, generate);
  }

  getOptions() {
    return this.options;
  }

  /**
   * Initialize the router with options
   *
   * 使用选项初始化路由器
   *
   * @param options - The router options
   * @param generate - Whether to generate routes immediately
   */
  init(options?: AutoRouterOptions, generate = false) {
    this.options = resolveOptions(options);

    if (generate) {
      this.generate();
    }
  }

  /**
   * Get configurable nodes
   *
   * 获取可配置节点
   *
   * @returns The configurable nodes
   */
  getConfigurableNodes() {
    return this.nodes.filter(node => !node.isBuiltin);
  }

  /**
   * Update the router options
   *
   * 更新路由选项
   *
   * @param options - The options to update
   */
  updateOptions(options: Partial<ParsedAutoRouterOptions>) {
    this.options = Object.assign(this.options, options);
  }

  /**
   * Initialize route globs from file system
   *
   * 从文件系统初始化路由 globs
   */
  async initGlobs() {
    this.globs = await resolveGlobs(this.options);

    // console.log('globs', this.globs);
  }

  initNodes() {
    this.nodes = resolveNodes(this.globs, this.options);

    console.log('nodes', this.nodes);
  }

  async initStatInfo() {
    this.statInfo = await getNodeStatInfo(this.options.cwd, this.nodes);

    // console.log('statInfo', this.statInfo);
  }

  /**
   * Generate routes based on file system
   *
   * 基于文件系统生成路由
   */
  async generate() {
    await initTemp(this.options.cwd);

    await this.initGlobs();

    this.initNodes();

    await this.initStatInfo();

    await generateDtsFile(this.nodes, this.options);

    await generateImportsFile(this.nodes, this.options);

    await generateTransformerFile(this.options);

    await generateSharedFile(this.nodes, this.options);

    await generateRoutes(this.nodes, this.statInfo, this.options);

    await updateNodeBackup(this.options.cwd, this.nodes);
  }

  stopWatch() {
    this.watcher?.close();
  }

  async watch() {
    this.watcher = new FileWatcher(this.options);
    this.watcher?.start(async glob => {
      const isInExclude = await isInExcludeGlob(this.options.cwd, glob);

      if (isInExclude) return;

      await this.generate();
    });
  }

  reloadViteServer() {
    this.viteServer?.ws?.send({ type: 'full-reload', path: '*' });
  }

  setViteServer(server: ViteDevServer) {
    this.viteServer = server;

    this.viteServer.httpServer?.on('close', () => {
      this.stopWatch();
    });
  }
}
