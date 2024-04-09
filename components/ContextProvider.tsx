'use client';

import { getCookie } from '@/utils';
import { createContext, useState } from 'react';
import { Role } from '@/constants/value-enum';

import type { Dispatch, SetStateAction } from 'react';

type IContext<T> = null | [T, Dispatch<SetStateAction<T>>];

export const IsLoginContext = createContext<IContext<boolean>>(null);
export const UserRoleContext = createContext<IContext<Role>>(null);

const IsLoginProvider = ({ children }: React.PropsWithChildren) => {
  const token = getCookie('Authorization');
  const [isLogin, setIsLogin] = useState(!!token);
  return <IsLoginContext.Provider value={[isLogin, setIsLogin]}>{children}</IsLoginContext.Provider>
};

const UserRoleProvider = ({ children }: React.PropsWithChildren) => {
  const role = (parseInt(getCookie('Role') ?? '') || Role.user) as Role;
  const [userRole, setUserRole] = useState(role);
  return <UserRoleContext.Provider value={[userRole, setUserRole]}>{children}</UserRoleContext.Provider>;
};

const ContextProvider = ({ children }: React.PropsWithChildren) => (
  <IsLoginProvider>
    <UserRoleProvider>{children}</UserRoleProvider>
  </IsLoginProvider>
);

export default ContextProvider;