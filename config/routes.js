﻿export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './user/Login',
          },
        ],
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/pdf',
    layout: false,
    microApp: 'pdf',
  },
  {
    path: '/markdown',
    layout: false,
    microApp: 'markdown',
  },
  {
    path: '/sheet',
    layout: false,
    microApp: 'sheet',
  },
  {
    path: '/unkown',
    name: '格式不支持',
    component: './Resource/UnkownView',
  },
  {
    path: '/res',
    name: 'welcome',
    routes: [
      {
        path: '/res',
        name: 'welcome',
        component: './Resource/$index',
      },
      {
        path: '/res/:fid',
        component: './Resource/$index',
      },
    ],
  },
  {
    path: '/latest',
    name: 'welcome',
    component: './Welcome',
  },
  {
    path: '/',
    redirect: '/res',
  },
  {
    component: './404',
  },
];
