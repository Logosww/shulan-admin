import { useStore as _useStore } from 'zustand';
import { createStore as _createStore} from 'zustand/vanilla';
import { Role } from '@/constants';
import { isClient } from '@/utils/http/request';
import { useContext } from 'react';
import { StoreContext } from '@/components/StoreProvider';
import { getCookie } from '@/app/actions';

export type State = {
  isLogin: boolean;
  role: Role;
  notificationCount: number;
};
export type Action = {
  login: () => void;
  logout: () => void;
  setRole: (role: Role) => void;
  setNotificationCount: (count: number) => void;
};
export type Store = State & Action;

const defaultState: State = {
  isLogin: false,
  role: Role.user,
  notificationCount: 0,
};

export const initStore = async (): Promise<State> => {
  const isLogin = !!(await getCookie('Authorization'))?.value;
  const role = parseInt((await getCookie('Role'))?.value ?? '') || Role.user;
  const notificationCount = isClient ? (parseInt(localStorage.getItem('notification-count') ?? '') || 0) : 0;

  return {
    isLogin,
    role,
    notificationCount
  };
};

export const createStore = (
  initState: State = defaultState,
) => _createStore<Store>(set => ({
  ...initState,
  login: () => set(() => ({ isLogin: true })),
  logout: () => set(() => ({ isLogin: false })),
  setRole: role => set(() => ({ role })),
  setNotificationCount: count => {
    set(() => ({ notificationCount: count }));
    localStorage.setItem('notification-count', count.toString());
  },
}));

export const useStore = <T,>(
  selector: (store: Store) => T,
): T => {
  const storeContext = useContext(StoreContext);

  if(!storeContext) throw new Error('useStore must be used within StoreProvider');

  return _useStore(storeContext, selector);
};

export default useStore;