 
/* prettier-ignore */
// biome-ignore lint: disable
// Generated by elegant-router
// Read more: https://github.com/SkyRoc1/skyroc-router

import type { AutoRouterRoute } from '@skyroc-router/types';

export const routes: AutoRouterRoute[] = [
  {
    name: 'Root',
    path: '/',
    redirect: '/home',
  },
  {
    name: 'NotFound',
    path: '*',
    layout: 'base',
    component: '404',
  },
  {
    name: 'About',
    path: '/about',
    layout: 'base',
    component: 'About',
  },
  {
    name: 'AboutDetail',
    path: '/about/detail',
    layout: 'base',
    component: 'AboutDetail',
  },
  {
    name: 'AboutDetailId',
    path: '/about/detail/:id',
    layout: 'base',
    component: 'AboutDetailId',
  },
  {
    name: 'AboutDetailIdUserId',
    path: '/about/detail/:id/:userId',
    layout: 'base',
    component: 'AboutDetailIdUserId',
  },
  {
    name: 'AboutDetailProjectPid',
    path: '/about/detail/project/:pid',
    layout: 'base',
    component: 'AboutDetailProjectPid',
  },
  {
    name: 'Home',
    path: '/home',
    layout: 'base',
    component: 'Home',
  },
  {
    name: 'HomeError',
    path: '/home/error',
    layout: 'base',
    component: 'HomeError',
  },
  {
    name: 'HomeLayout',
    path: '/home/layout',
    layout: 'base',
    component: 'HomeLayout',
  },
  {
    name: 'HomeLoading',
    path: '/home/loading',
    layout: 'base',
    component: 'HomeLoading',
  },
  {
    name: 'HomeNotFound',
    path: '/home/*',
    component: 'HomeNotFound',
  },
  {
    name: 'ProjectPid',
    path: '/project/:pid',
    layout: 'base',
    component: 'ProjectPid',
  },
  {
    name: 'ProjectPidEditId',
    path: '/project/:pid/edit/:id',
    layout: 'base',
    component: 'ProjectPidEditId',
  }
];
