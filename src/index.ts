import type { Plugin, ViteDevServer } from 'vite';
import { loadConfig } from 'unconfig';
import { CLI_CONFIG_SOURCE, SHORT_CLI_CONFIG_SOURCE } from './constants';
import type { AutoRouterOptions, CliOptions, PluginOptions } from './types';
import { AutoRouter } from './core';

export * from './core';

export function defineConfig(config?: CliOptions) {
  return config;
}

export default function createViteRouterPlugin(opts: PluginOptions) {
  const { config } = loadConfig.sync<AutoRouterOptions>({
    sources: {
      files: [SHORT_CLI_CONFIG_SOURCE, CLI_CONFIG_SOURCE]
    }
  });

  const autoRouter = new AutoRouter({ ...opts, ...config });

  const autoRouterOptions = autoRouter.getOptions();

  return [
    {
      name: 'unplugin-skyroc-router',
      enforce: 'pre',
      apply: 'serve',
      async configureServer(server: ViteDevServer) {
        await autoRouter.generate();
        if (autoRouterOptions.watchFile) {
          autoRouter.watch();
        }

        autoRouter.setViteServer(server);
      }
    }
  ] satisfies Plugin[];
}
