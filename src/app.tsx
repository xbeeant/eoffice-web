import type { ReactChild, ReactFragment, ReactPortal } from 'react';
import { createRef, useState } from 'react';
import type { MenuDataItem, Settings as LayoutSettings } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import type { RequestConfig } from 'umi';
import { history, request as requests } from 'umi';
import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';
import { currentUser as queryCurrentUser } from './services/eoffice/api';
import {
  HistoryOutlined,
  HomeOutlined,
  ShareAltOutlined,
  TeamOutlined,
  ContainerOutlined,
} from '@ant-design/icons';
import { message } from 'antd';
import type { Route } from 'antd/lib/breadcrumb/Breadcrumb';

const loginPath = '/user/login';
const whitePath = {
  [loginPath]: true,
  '/user/register': true,
};

/**
 * 乾坤
 */
export function useQiankunStateForSlave() {
  const [masterState, setMasterState] = useState({});

  return {
    masterState,
    setMasterState,
  };
}

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

export const layoutActionRef = createRef<{ reload: () => void }>();

const errorHandler = (error: { response: any }) => {
  const { response } = error;
  if (response && response.status) {
    const { status, url } = response;

    message.error(`请求错误 ${status}: ${url}`);
    return { success: false, msg: '网络异常' };
  }

  if (response) {
    if (response.code === 401) {
      history.push(loginPath);
    }

    if (!response.success) {
      message.error(response.msg);
    }
  } else {
    message.error('网络异常');
  }

  return response;
};

export const request: RequestConfig = {
  errorHandler,
  errorConfig: {
    adaptor: (resData) => {
      return {
        ...resData,
        errorMessage: resData.msg,
        errorCode: resData.code,
      };
    },
  },
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  breadcrumbs?: Route[];
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
  fetchBreadcrumb?: () => Promise<Route[]>;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser();
      return msg.data;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };

  const fetchBreadcrumb = async () => {
    console.log(history.location);
    if (history.location.pathname.indexOf('/res/') === 0) {
      const fid = history.location.pathname.substring(5);
      const response = await requests('/eoffice/api/folder/breadcrumb?fid=' + fid);
      return response.data || [];
    }

    return [
      {
        path: '/',
        breadcrumbName: '首页',
      },
    ];
  };

  console.log('fetch finished');
  console.log('is login : ', whitePath[history.location.pathname] === undefined);
  // 如果是登录页面，不执行
  if (whitePath[history.location.pathname] === undefined) {
    const currentUser = await fetchUserInfo();
    const breadcrumbs: Route[] = await fetchBreadcrumb();
    return {
      fetchUserInfo,
      fetchBreadcrumb,
      currentUser,
      breadcrumbs,
      settings: {},
    };
  }

  return {
    fetchUserInfo,
    fetchBreadcrumb,
    settings: {},
  };
}

const IconMap = {
  home: <HomeOutlined />,
  history: <HistoryOutlined />,
  share: <ShareAltOutlined />,
  team: <TeamOutlined />,
  template: <ContainerOutlined />,
};

const loopMenuItem = (menus: MenuDataItem[]): MenuDataItem[] =>
  menus.map(({ icon, children, ...item }) => ({
    icon: icon && IconMap[icon as string],
    children: children && loopMenuItem(children),
    path: item.path,
    name: item.name,
  }));

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: ({ initialState }: { initialState: any }) => {
  waterMarkProps: { content: string | undefined };
  subMenuItemRender: (item: any, dom: any) => JSX.Element;
  rightContentRender: () => JSX.Element;
  menuItemRender: (item: any, dom: any) => JSX.Element;
  disableContentMargin: boolean;
  footerRender: () => JSX.Element;
  onPageChange: () => void;
  menuHeaderRender: undefined;
  actionRef: React.RefObject<{ reload: () => void }>;
  menu: { request: () => Promise<MenuDataItem[]> };
  breadcrumbProps: { minLength: number; separator: string };
} = ({ initialState }) => {
  return {
    actionRef: layoutActionRef,
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && whitePath[location.pathname] === undefined) {
        history.push(loginPath);
      }
    },
    menuHeaderRender: undefined,
    menuItemRender: (item, dom) => (
      <a
        onClick={(e) => {
          e.stopPropagation();
          history.push({
            pathname: item.path,
          });
        }}
      >
        {dom}
      </a>
    ),
    subMenuItemRender: (item, dom) => (
      <a
        onClick={(e) => {
          e.stopPropagation();
          history.push({
            pathname: item.path,
          });
        }}
      >
        {dom}
      </a>
    ),
    menu: {
      locale: true,
      defaultOpenAll: true,
      ignoreFlatMenu: true,
      // 每当 initialState?.currentUser?.userid 发生修改时重新执行 request
      params: {
        userId: initialState?.currentUser?.userid,
      },
      request: async () => {
        if (initialState?.currentUser?.userid) {
          const response = await requests('/eoffice/api/menu');
          let menus;
          if (response.length === 0) {
            console.log('no sub menus');
            menus = [
              {
                path: '/',
                key: 'welcome',
                name: 'welcome',
                icon: 'home',
                children: [
                  {
                    path: '/res/0',
                    key: 'res0',
                    name: '文档',
                    icon: 'home',
                  },
                  {
                    path: '/share',
                    name: '分享',
                    key: 'share',
                    icon: 'share',
                  },
                  {
                    path: '/team',
                    key: 'team',
                    name: '群组',
                    icon: 'team',
                  },
                  {
                    path: '/template',
                    key: 'template',
                    name: '文档模板',
                    icon: 'template',
                  },
                ],
              },
            ];
          } else {
            menus = [
              {
                path: '/',
                name: 'welcome',
                key: 'welcome',
                icon: 'home',
                children: [
                  {
                    path: '/res/0',
                    key: 'res0',
                    name: '文档',
                    icon: 'home',
                    children: response,
                  },
                  {
                    path: '/share',
                    key: 'share',
                    name: '分享',
                    icon: 'share',
                  },
                  {
                    path: '/team',
                    key: 'team',
                    name: '群组',
                    icon: 'team',
                  },
                  {
                    path: '/template',
                    key: 'template',
                    name: '文档模板',
                    icon: 'template',
                  },
                ],
              },
            ];
          }

          return loopMenuItem(menus);
        }

        return [];
      },
    },
    breadcrumbRender: () => {
      return [
        {
          breadcrumbName: '首页',
          path: '/',
        },
        ...(initialState?.breadcrumbs || []),
      ];
    },
    breadcrumbProps: {
      itemRender: (route: {
        path: string;
        breadcrumbName: boolean | ReactChild | ReactFragment | ReactPortal | null | undefined;
      }) => {
        return (
          <a
            href="#"
            onClick={() => {
              history.push(route.path);
            }}
          >
            {route.breadcrumbName}
          </a>
        );
      },
      minLength: 1,
      separator: '>',
    },
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    ...initialState?.settings,
  };
};

// 从接口中获取子应用配置，export 出的 qiankun 变量是一个 promise
export const qiankun = fetch('/eoffice/api/slaves')
  .then((res) => res.json())
  .then((apps) => {
    console.log(apps);
    return {
      // 注册子应用信息
      apps,
      // 完整生命周期钩子请看 https://qiankun.umijs.org/zh/api/#registermicroapps-apps-lifecycles
      lifeCycles: {
        afterMount: (props: any) => {
          console.log(props);
        },
      },
      // 支持更多的其他配置，详细看这里 https://qiankun.umijs.org/zh/api/#start-opts
    };
  });
