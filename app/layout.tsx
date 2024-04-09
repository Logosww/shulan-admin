import React from 'react';
import MyApp from '@/app';
import { AntdRegistry } from '@ant-design/nextjs-registry';

import './global.css';

export const metadata = {
  title: '树懒管理端',
  description: '树懒，是一个一个...',
};

const RootLayout = ({ children }: React.PropsWithChildren) => (
  <html lang="zh-CN">
    <body>
      <AntdRegistry>
        <MyApp>{children}</MyApp>
      </AntdRegistry>
    </body>
  </html>
);

export default RootLayout;