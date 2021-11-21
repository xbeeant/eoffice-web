export default [
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
      {
        path: '/res/image/:rid',
        component: './Resource/image',
      },
    ]
  },
  {
    path: '/latest',
    name: 'welcome',
    component: './Welcome',
  },
  {
    path: '/admin',
    name: 'admin',
    icon: 'crown',
    access: 'canAdmin',
    component: './Admin',
    routes: [
      {
        path: '/admin/sub-page',
        name: 'sub-page',
        icon: 'smile',
        component: './Welcome',
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/',
    redirect: '/res',
  },
  {
    component: './404',
  },
];
