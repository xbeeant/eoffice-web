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
    path: '/search',
    component: './Search',
  },
  {
    path: '/latest',
    name: 'latest',
    component: './Welcome',
  },
  {
    path: '/',
    name: 'welcome',
    routes: [
      {
        path: '/',
        redirect: '/res/0',
      },
      {
        path: '/share',
        routes: [
          {
            path: '/share',
            redirect: '/share/index',
          },
          {
            path: '/share/index',
            component: './Share',
          },
          {
            path: '/share/view',
            component: './Share/View',
          },
        ],
      },
      {
        path: '/res/:fid',
        component: './Resource/$index',
      },
      {
        path: '/team',
        name: 'team',
        component: './Team',
      },
      {
        path: '/template',
        name: 'template',
        component: './Template',
      },
    ],
  },
  {
    component: './404',
  },
];
