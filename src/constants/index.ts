export const SKYROC_ROUTER_TYPES_MODULE_NAME = '@skyroc-router/types';

export const REACT_ROUTER_MODULE_NAME = 'react-router/auto-routes';

export const ROOT_ROUTE_NAME = 'Root';

export const NOT_FOUND_ROUTE_NAME = 'NotFound';

export const NO_FILE_INODE = -99;

export const BUILT_IN_ROUTE = {
  [ROOT_ROUTE_NAME]: '/',
  [NOT_FOUND_ROUTE_NAME]: '*'
} as const;

export const INDEX_FILE_REG = /\/index$/;

// eslint-disable-next-line no-useless-escape
export const ALL_PARAMS_REG = /\/[\.\.\.[^\]]+\]$/;

export const CLI_CONFIG_SOURCE = 'skyroc-router.config';
export const SHORT_CLI_CONFIG_SOURCE = 'sr.config';
