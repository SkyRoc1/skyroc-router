import { createFilter } from 'unplugin-utils';
import chokidar from 'chokidar';
import type { FSWatcher } from 'chokidar';
import { logger } from '../shared';
import type { ParsedAutoRouterOptions } from '../types';

/**
 * File watcher class for monitoring page file changes
 *
 * 文件监听器类，用于监控页面文件变化
 */
export class FileWatcher {
  private watcher: FSWatcher | undefined;
  private debounceTimer: NodeJS.Timeout | null = null;
  private pendingGlobs: Set<string> = new Set();

  updateDuration: number = 500;

  /**
   * Create a FileWatcher instance
   *
   * 创建 FileWatcher 实例
   *
   * @param options - The parsed router options
   */
  constructor(options: ParsedAutoRouterOptions) {
    this.init(options);
    this.updateDuration = options.fileUpdateDuration;
  }

  /**
   * Initialize the file watcher with options
   *
   * 使用选项初始化文件监听器
   *
   * @param options - The parsed router options
   */
  init(options: ParsedAutoRouterOptions) {
    const { cwd, pageDir, pageInclude, pageExclude } = options;

    const filter = createFilter(pageInclude, pageExclude);

    // 创建监听器
    this.watcher = chokidar.watch(pageDir, {
      cwd,
      ignoreInitial: true,
      ignored: (glob: string, stats) => {
        if (!stats?.isFile()) {
          return false;
        }

        const isMatch = filter(glob);

        return !isMatch;
      }
    });

    this.watcher?.on('ready', () => {
      logger.start('watcher ready');
    });
  }

  /**
   * Start watching files and execute callback on changes
   *
   * 开始监听文件并在变化时执行回调
   *
   * @param callback - The callback function to execute on file changes
   */
  start(callback: (glob: string) => Promise<void>) {
    const debouncedCallback = async () => {
      if (this.pendingGlobs.size === 0) return;

      // Take the latest file for processing
      const latestGlob = Array.from(this.pendingGlobs).pop() as string;
      this.pendingGlobs.clear();

      await callback(latestGlob);
    };

    const handleFileEvent = (glob: string) => {
      this.pendingGlobs.add(glob);

      // Clear existing timer if it exists
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      // Set new timer
      this.debounceTimer = setTimeout(async () => {
        await debouncedCallback();
        this.debounceTimer = null;
      }, this.updateDuration);
    };

    this.watcher?.on('add', handleFileEvent);
    this.watcher?.on('unlink', handleFileEvent);
  }

  /**
   * Close the file watcher and clean up resources
   *
   * 关闭文件监听器并清理资源
   */
  close() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.watcher?.close();
  }
}
