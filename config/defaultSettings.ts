import { Settings as LayoutSettings } from '@ant-design/pro-layout';

const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
  basepath: string;
  version: string;
} = {
  navTheme: 'light',
  // 拂晓蓝
  primaryColor: '#1890ff',
  layout: 'mix',
  splitMenus: true,
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: 'eOffice',
  pwa: false,
  logo: '../public/logo.png',
  iconfontUrl: '',
  basepath: '/eoffice',
  version: '1.0.0',
};

export default Settings;
