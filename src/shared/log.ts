import { consola } from 'consola';
import type { ConsolaInstance, LogType } from 'consola';
import { lightGreen } from 'kolorist';

class Logger {
  private readonly logger: ConsolaInstance;

  prefix: string;

  constructor(prefix = lightGreen('[skyroc-router]')) {
    this.logger = consola;
    this.prefix = prefix;
  }

  log(msg: string, type: LogType, show = true) {
    if (!show) return;

    this.logger[type](`${this.prefix} ${msg}`);
  }

  start(msg: string, show = true) {
    this.log(msg, 'start', show);
  }

  info(msg: string, show = true) {
    this.log(msg, 'info', show);
  }

  success(msg: string, show = true) {
    this.log(msg, 'success', show);
  }

  warn(msg: string, show = true) {
    this.log(msg, 'warn', show);
  }

  error(msg: string, show = true) {
    this.log(msg, 'error', show);
  }

  table(data: any[], show = true) {
    if (!show) return;

    console.table(data);
  }
}

export const logger = new Logger();
