''

import React, { Suspense } from 'react';
import MyApp from '@/app';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { StoreProvider } from '@/components';
import { initStore } from '@/store';

import './global.css';

export const metadata = {
  title: '树懒管理端',
  description: '树懒，是一个一个...',
};

const RootLayout = async ({ children }: React.PropsWithChildren) => {
  const state = await initStore();

  return (
    <html lang="zh-CN">
      <body>
        <Suspense>
          <StoreProvider state={state}>
            <AntdRegistry>
              <MyApp>{children}</MyApp>
            </AntdRegistry>
          </StoreProvider>
        </Suspense>
      </body>
    </html>
  );
};

export default RootLayout;