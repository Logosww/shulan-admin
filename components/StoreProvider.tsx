'use client';

import { createContext, useRef } from 'react';
import { createStore } from '@/store';

import type { StoreApi } from 'zustand';
import type { State, Store } from '@/store';

type StoreProviderProps = { state: State } & React.PropsWithChildren;

export const StoreContext = createContext<StoreApi<Store> | null>(null);

export const StoreProvider = async ({ children, state }: StoreProviderProps) => {
  const storeRef = useRef<StoreApi<Store>>(createStore(state));

  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
};