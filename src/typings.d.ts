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

declare const REACT_APP_ENV: 'test' | 'dev' | 'pre' | false;

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

export type ResourceParamsProps = {
  match: { params: ResourceProps };
};

export type FolderProps = {
  fid: string;
  name: string;
};
