import type { AutoRouterOptions, ParsedAutoRouterOptions, ResolvedGlob } from '@/types';
import type { FileWatcher } from './watcher';
import { resolveOptions } from './option';
import { initTemp } from './temp';
import { resolveGlobs } from './glob';

/**
 * Auto router class for generating routes automatically
 *
 * 自动路由类，用于自动生成路由
 */
export class AutoRouter {
  private options: ParsedAutoRouterOptions = {} as ParsedAutoRouterOptions;

  watcher?: FileWatcher;

  globs: ResolvedGlob[] = [];

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

  /**
   * Initialize the router with options
   *
   * 使用选项初始化路由器
   *
   * @param options - The router options
   * @param generate - Whether to generate routes immediately
   */
  init(options?: AutoRouterOptions, generate = false) {
    // eslint-disable-next-line no-underscore-dangle
    this.options = resolveOptions(options);

    if (generate) {
      this.generate();
    }
  }

  /**
   * Initialize route globs from file system
   *
   * 从文件系统初始化路由 globs
   */
  async initGlobs() {
    this.globs = await resolveGlobs(this.options);
  }

  /**
   * Generate routes based on file system
   *
   * 基于文件系统生成路由
   */
  async generate() {
    await initTemp(this.options.cwd);

    await this.initGlobs();
  }
}
