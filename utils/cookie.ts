import Cookies from 'js-cookie';
import { isClient } from '@/utils/http/request';

export const tempCookie = { value: '' };

export const getCookie = (name: string) => {
  if(isClient) return Cookies.get(name);

  if(!tempCookie.value) return void 0;

  const cookies = tempCookie.value.split(';').map(cookie => cookie.trim());
  const index = cookies.findIndex(cookie => cookie.startsWith(`${name}=`));
  if(index < 0) return void 0;

  return cookies[index].split('=')[1];
};