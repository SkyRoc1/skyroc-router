import { consola } from 'consola';
import type { ConsolaInstance, LogType } from 'consola';
import { lightGreen } from 'kolorist';

/**
 * Logger class for handling application logging
 *
 * 日志记录器类，用于处理应用程序日志
 */
class Logger {
  private readonly logger: ConsolaInstance;

  prefix: string;

  /**
   * Create a Logger instance
   *
   * 创建 Logger 实例
   *
   * @default lightGreen('[skyroc-router]')
   * @param prefix - The log prefix to display
   */
  constructor(prefix = lightGreen('[skyroc-router]')) {
    this.logger = consola;
    this.prefix = prefix;
  }

  /**
   * Log a message with specified type
   *
   * 记录指定类型的消息
   *
   * @default true
   * @param msg - The message to log
   * @param type - The log type
   * @param show - Whether to show the log
   */
  log(msg: string, type: LogType, show = true) {
    if (!show) return;

    this.logger[type](`${this.prefix} ${msg}`);
  }

  /**
   * Log a start message
   *
   * 记录启动消息
   *
   * @default true
   * @param msg - The message to log
   * @param show - Whether to show the log
   */
  start(msg: string, show = true) {
    this.log(msg, 'start', show);
  }

  /**
   * Log an info message
   *
   * 记录信息消息
   *
   * @default true
   * @param msg - The message to log
   * @param show - Whether to show the log
   */
  info(msg: string, show = true) {
    this.log(msg, 'info', show);
  }

  /**
   * Log a success message
   *
   * 记录成功消息
   *
   * @default true
   * @param msg - The message to log
   * @param show - Whether to show the log
   */
  success(msg: string, show = true) {
    this.log(msg, 'success', show);
  }

  /**
   * Log a warning message
   *
   * 记录警告消息
   *
   * @default true
   * @param msg - The message to log
   * @param show - Whether to show the log
   */
  warn(msg: string, show = true) {
    this.log(msg, 'warn', show);
  }

  /**
   * Log an error message
   *
   * 记录错误消息
   *
   * @default true
   * @param msg - The message to log
   * @param show - Whether to show the log
   */
  error(msg: string, show = true) {
    this.log(msg, 'error', show);
  }

  /**
   * Display data in a table format
   *
   * 以表格格式显示数据
   *
   * @default true
   * @param data - The data array to display
   * @param show - Whether to show the table
   */
  table(data: any[], show = true) {
    if (!show) return;

    console.table(data);
  }
}

export const logger = new Logger();
