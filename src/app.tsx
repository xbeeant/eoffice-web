import {createRef} from 'react';
import type {MenuDataItem, Settings as LayoutSettings} from '@ant-design/pro-layout';
import {PageLoading} from '@ant-design/pro-layout';
import type {RequestConfig, RunTimeLayoutConfig} from 'umi';
import {history, request as requests} from 'umi';
import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';
import {currentUser as queryCurrentUser, getPathmap} from './services/ant-design-pro/api';
import {HistoryOutlined, HomeOutlined} from '@ant-design/icons';
import {message} from "antd";

const loginPath = '/user/login';

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading/>,
};

export const layoutActionRef = createRef<{ reload: () => void }>();

const errorHandler = (error: { response: any }) => {
  const {response} = error;
  if (response && response.status) {
    const {status, url} = response;

    message.error(`请求错误 ${status}: ${url}`);
    return {success: false, msg: '网络异常'};
  }

  if (response) {
    message.error(response.msg);
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
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
  pathmap: object
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
  let pathmap = [];
  const fetchPathmap = async () => {
    const response = await getPathmap();
    pathmap = response.data || [];
  }
  fetchPathmap();
  // 如果是登录页面，不执行
  if (history.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: {},
      pathmap: pathmap,
    };
  }

  return {
    fetchUserInfo,
    settings: {},
    pathmap: pathmap,
  };
}

const IconMap = {
  home: <HomeOutlined/>,
  history: <HistoryOutlined/>,
};

const loopMenuItem = (menus: MenuDataItem[]): MenuDataItem[] =>
  menus.map(({icon, children, ...item}) => ({
    ...item,
    icon: icon && IconMap[icon as string],
    children: children && loopMenuItem(children),
  }));

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({initialState}) => {
  return {
    actionRef: layoutActionRef,
    rightContentRender: () => <RightContent/>,
    disableContentMargin: false,
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    footerRender: () => <Footer/>,
    onPageChange: () => {
      const {location} = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
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
      request: async () => {
        const response = await requests('/api/menu');
        let menus;
        if (response.length === 0) {
          console.log('no sub menus');
          menus = [
            {
              path: '/',
              name: 'welcome',
              icon: 'home',
              children: [
                {
                  path: '/latest',
                  name: '最近',
                  icon: 'history',
                },
                {
                  path: '/res',
                  name: '我的',
                  icon: 'home',
                },
              ],
            },
          ]
        } else {
          menus = [
            {
              path: '/',
              name: 'welcome',
              icon: 'home',
              children: [
                {
                  path: '/latest',
                  name: '最近',
                  icon: 'history',
                },
                {
                  path: '/res',
                  name: '我的',
                  icon: 'home',
                  children: response,
                },
              ],
            },
          ];
        }

        return loopMenuItem(menus);
      },
    },
    breadcrumbProps: {
      minLength: 1,
      separator: '>',
    },
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    ...initialState?.settings,
  };
};