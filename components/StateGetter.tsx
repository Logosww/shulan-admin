'use server';

import { cookies } from 'next/headers';
import { forwardRef } from 'react';
import { Role } from '@/constants';

type States = {
  isLogin: boolean;
  role: Role;
};

export const StateGetter = forwardRef<HTMLDivElement & { ['data-states']: States }>(function StateGetter(_, ref) {
  const cookie = cookies();
  
  const getState =
    <T extends any = string>(
      name: string,
      initialValue: T,
      transform?: (value: string) => T,
    ) => {
    const value = cookie.get(name)?.value;
    return (
      value
        ? transform ? transform(value) : value
        : initialValue
    ) as T;
  };

  const states = {
    isLogin: getState<boolean>('Authorization', false),
    role: getState<number>('Role', Role.user, parseInt),
  };

  return <div ref={ref} data-states={states} />;
});

export default StateGetter;