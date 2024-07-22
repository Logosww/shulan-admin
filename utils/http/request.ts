import { messageApi } from '@/app';
import { APIStatusCode } from '@/constants/value-enum';

export interface ResOption<T> {
  code: APIStatusCode;
  msg: string;
  data: T;
};

interface SearchParams {
  [key: string]: any;
};

type _RequestInit<T = void, RawT = any> = RequestInit & { disableBaseUrl?: boolean; transform?: (data: RawT) => T };

const baseUrl = 'https://api.admin.buhuishangshu.cn';

export const isClient = typeof window !== 'undefined';

const rediectToLogin = () => isClient && (window.location.href = '/login');

const myFetch = async <T = void, RawT = any>(url: string, options?: _RequestInit<T, RawT>) => {
  const message = isClient ? messageApi : void 0;
  
  const disableBaseUrl = options?.disableBaseUrl;
  url = disableBaseUrl ? url : baseUrl + url;
  disableBaseUrl && delete options?.disableBaseUrl;
  
  const response = await fetch(
    url,
    {
      credentials: 'include',
      ...options,
      headers: {
        ...options?.headers,
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
        message?.error?.('你还未登录');
        return rediectToLogin() as never;
      }
      case 403: {
        message?.error?.('你的权限不够');
        return rediectToLogin() as never;
      }
      default: {
        message?.error?.('网络异常');
        throw new Error(statusText);
      }
    }
  }

  const _data: ResOption<RawT> = await response.json();
  if(disableBaseUrl) return _data as T;
  
  const { code, msg, data } = _data;
  if(code === APIStatusCode.fail) {
    message?.error?.(msg);
    throw new Error(msg);
  }

  return (options?.transform ? options.transform(data) : data) as T;
};


export const get = <T = void, RawT = any>(url: string, params?: SearchParams, options?: _RequestInit<T, RawT>) => 
  myFetch<T>(`${url}${params ? ('?' + new URLSearchParams(params).toString()) : ''}`, options);

export const post = <T = void, RawT = any>(url: string, params?: Record<string, any>, options?: _RequestInit<T, RawT>) =>
  myFetch<T>(url, { method: 'post', body: JSON.stringify(params), headers: { 'Content-Type': 'application/json' }, ...options });

export const put = <T = void, RawT = any>(url: string, params?: Record<string, any>, options?: _RequestInit<T, RawT>) =>
  myFetch<T>(url, { method: 'put', body: JSON.stringify(params), headers: { 'Content-Type': 'application/json' }, ...options });

export const del = <T = void, RawT = any>(url: string, params?: Record<string, any>, options?: _RequestInit<T, RawT>) =>
  myFetch<T>(url, { method: 'delete', body: JSON.stringify(params), headers: { 'Content-Type': 'application/json' }, ...options });