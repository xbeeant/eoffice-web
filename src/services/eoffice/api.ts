// @ts-ignore
/* eslint-disable */
import {request} from 'umi';

export async function getPathmap() {
  return request('/eoffice/api/config/pathmap');
}

/** 获取当前的用户 GET /eoffice/api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  return request<{
    data: API.CurrentUser;
  }>('/eoffice/api/currentUser', {
    method: 'GET',
    ...(options || {}),
    skipErrorHandler: true,
  });
}

/** 退出登录接口 POST /eoffice/api/login/outLogin */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/eoffice/api/login/outLogin', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 登录接口 POST /eoffice/api/login/account */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>('/eoffice/api/auth/login', {
    method: 'POST',
    requestType: 'form',
    data: body,
    ...(options || {}),
  });
}

