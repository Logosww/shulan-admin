// import { redirect } from 'next/navigation';
import { messageApi } from '@/app';
// import { tempCookie } from '../cookie';

export interface ResOption<T> {
  code: 0 | 1;
  msg: string;
  data: T;
};

interface SearchParams {
  [key: string]: any;
};

type _RequestInit = RequestInit & { disableBaseUrl?: boolean; };

const baseUrl = 'https://api.test.buhuishangshu.cn';

export const isClient =  typeof window !== 'undefined';

const rediectToLogin = () => {
  // if(isClient) window.location.href = '/login';
  // else redirect('/login');
  window.location.href = '/login';
};

const myFetch = async <T>(url: string, options?: _RequestInit) => {
  const message = isClient ? messageApi : void 0;
  // const cookie = !isClient && tempCookie.value;
  
  const disableBaseUrl = options?.disableBaseUrl;
  url = disableBaseUrl ? url : baseUrl + url;
  disableBaseUrl && delete options?.disableBaseUrl;
  
  const response = await fetch(
    url,
    {
      credentials: 'include',
      ...options,
      headers: {
        // ...(cookie && { cookie }),
        ...options?.headers
      }
    }
  ).catch(e => {
    message?.error('网络异常');
    throw new Error(e);
  });
  
  const { ok, status, statusText } = response;
  if(!ok) {
    switch(status) {
      case 401: {
        message?.error('你还未登录');
        return rediectToLogin() as never;
      }
      case 403: {
        message?.error('你的权限不够');
        return rediectToLogin() as never;
      }
      default: {
        message?.error('网络异常');
        throw new Error(statusText);
      }
    }
  }


  const _data: ResOption<T> = await response.json();
  if(disableBaseUrl) return _data as T;
  
  const { code, msg, data } = _data;
  if(!code) {
    message?.error(msg);
    throw new Error(msg);
  }

  return data;
};


export const get = <T = void>(url: string, params?: SearchParams, options?: _RequestInit) => 
  myFetch<T>(`${url}${params ? ('?' + new URLSearchParams(params).toString()) : ''}`, options);

export const post = <T = void>(url: string, params?: Record<string, any>, options?: _RequestInit) =>
  myFetch<T>(url, { method: 'post', body: JSON.stringify(params), headers: { 'Content-Type': 'application/json' }, ...options });

export const put = <T = void>(url: string, params?: Record<string, any>, options?: _RequestInit) =>
  myFetch<T>(url, { method: 'put', body: JSON.stringify(params), headers: { 'Content-Type': 'application/json' }, ...options });

export const del = <T = void>(url: string, params?: Record<string, any>, options?: _RequestInit) =>
  myFetch<T>(url, { method: 'delete', body: JSON.stringify(params), headers: { 'Content-Type': 'application/json' }, ...options });