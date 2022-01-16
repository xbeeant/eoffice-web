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
          {
            path: '/user/register',
            component: './user/Register',
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
    layout: false,
    component: './Resource/UnkownView',
  },
  {
    path: '/image',
    layout: false,
    component: './Resource/ImageView',
  },
  {
    path: '/share',
    routes: [
      {
        path: '/share',
        component: './Share',
      },
      {
        path: '/share/view',
        component: './Share/View',
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
    ],
  },
  {
    path: '/team',
    name: 'team',
    component: './Team',
  },
  {
    path: '/latest',
    name: 'latest',
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
