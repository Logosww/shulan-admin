import MyApp from '@/app';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { StoreProvider } from '@/components';
import { initStore } from '@/store';
import '@ant-design/v5-patch-for-react-19';

import './global.css';

import type { PropsWithChildren } from 'react';

export const metadata = {
  title: '树懒管理端',
  description: '树懒，是一个一个...',
};

const RootLayout = async ({ children }: PropsWithChildren) => {
  const state = await initStore();

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <StoreProvider state={state}>
          <AntdRegistry>
            <MyApp>{children}</MyApp>
          </AntdRegistry>
        </StoreProvider>
      </body>
    </html>
  );
};

export default RootLayout;