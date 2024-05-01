'use client';

import { createContext, useEffect, useState } from 'react';
import { Role } from '@/constants/value-enum';
import { getCookie } from '@/utils';
import { isClient } from '@/utils/http/request';

import type { Dispatch, SetStateAction } from 'react';

type IContext<T> = null | [T, Dispatch<SetStateAction<T>>];

export const IsLoginContext = createContext<IContext<boolean>>(null);
export const UserRoleContext = createContext<IContext<Role>>(null);
export const NotificationCountContext = createContext<IContext<number>>(null);

const IsLoginProvider = ({ children }: React.PropsWithChildren) => {
  const token = getCookie('Authorization');

  return (
    <IsLoginContext.Provider value={useState(!!token)}>{children}</IsLoginContext.Provider>
  );
}

const UserRoleProvider = ({ children }: React.PropsWithChildren) => {
  const role = parseInt(getCookie('Role') ?? '') ?? Role.user;

  return (
    <UserRoleContext.Provider value={useState(role)}>{children}</UserRoleContext.Provider>
  );
}

const NotificationCountProvider = ({ children }: React.PropsWithChildren) => {
  const count = isClient 
    ? (parseInt(localStorage.getItem('notification-count') || '') || 0) 
    : 0;
  const [notificationCount, setNotificationCount] = useState(count);

  useEffect(() => {
    if(!isClient) return;

    localStorage.setItem('notification-count', notificationCount.toString());
  }, [notificationCount]);
  
  return <NotificationCountContext.Provider value={[notificationCount, setNotificationCount]}>{children}</NotificationCountContext.Provider>
}

const ContextProvider = ({ children }: React.PropsWithChildren) => (
  <IsLoginProvider>
    <UserRoleProvider>
      <NotificationCountProvider>
        {children}
      </NotificationCountProvider>
    </UserRoleProvider>
  </IsLoginProvider>
);

export default ContextProvider;