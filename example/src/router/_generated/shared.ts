/* eslint-disable */
/* prettier-ignore */
// biome-ignore lint: disable
// Generated by elegant-router
// Read more: https://github.com/SkyRoc1/skyroc-router

import type { RouteKey, RoutePath, RoutePathMap } from '@skyroc-router/types';

const routePathMap: RoutePathMap = {
  "Root": "/",
  "NotFound": "*",
  "About": "/about",
  "AboutDetail": "/about/detail",
  "AboutDetailId": "/about/detail/:id",
  "AboutDetailIdUserId": "/about/detail/:id/:userId",
  "AboutDetailProjectPid": "/about/detail/project/:pid",
  "Home": "/home",
  "HomeError": "/home/error",
  "HomeLayout": "/home/layout",
  "HomeLoading": "/home/loading",
  "HomeNotFound": "/home/*",
  "ProjectPid": "/project/:pid",
  "ProjectPidEditId": "/project/:pid/edit/:id",
};

export function getRoutePath(key: RouteKey) {
  return routePathMap[key];
}

export function getRouteName(path: RoutePath) {
  return Object.keys(routePathMap).find(key => routePathMap[key as RouteKey] === path) as RouteKey;
}
