import { Pagination } from 'antd';

declare module 'slash2';
declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';
declare module 'omit.js';
declare module 'numeral';
declare module '@antv/data-set';
declare module 'mockjs';
declare module 'react-fittext';
declare module 'bizcharts-plugin-slider';

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  code: number;
};

export type ShareProps = {
  extension: string;
  share: string;
};

export type ShareResourceProps = {
  resource: ResourceProps;
  authCode: string;
  shareId: string;
  type: number;
  endtime: string;
};

export type ResourceProps = {
  url: string;
  perm: string;
  createAt: string;
  createBy: string;
  deleted: boolean;
  displayOrder: number;
  extension: string;
  fid: string;
  key: string;
  name: string;
  path: string;
  rid: string;
  sid: string;
  size: number;
  updateAt: string;
  updateBy: string;
};

export type UserProps = { nickname: string; uid: string; username: string };

export type TeamProps = { gid: string | number; name: string; pgid: string; type: string };

export type PermTargetProps = {
  targetName: string;
  targetType: number;
  print: boolean;
  view: boolean;
  edit: boolean;
  comment: boolean;
  download: boolean;
  pid: string;
  type: number;
};

export type ResourceParamsProps = {
  match: { params: ResourceProps };
};

export type FolderProps = {
  fid: string;
  name: string;
};

export type VersionHistoryProps = {
  actor: string;
  createAt: string;
  size: number;
};

export type VersionHistoryPageProps = {
  list: VersionHistory[];
  pagination: PaginationProps;
};
