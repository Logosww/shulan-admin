'use client';

import { useMemo } from 'react';
import { ConfigProvider, App } from 'antd';
import { useTheme } from 'next-themes';
import { defaultTheme, darkTheme } from '@/theme/config';
import { ThemeProvider } from '@/components';
import zhCN from 'antd/locale/zh_CN';

import type { MessageInstance } from 'antd/es/message/interface';

let messageApi: MessageInstance;

const AppInner = ({ children }: React.PropsWithChildren) => {
  messageApi = App.useApp().message;

  return <div className="animate-fade-in">{children}</div>;
};

const AppWrapper = ({ children }: React.PropsWithChildren) => {
  const { theme, resolvedTheme } = useTheme();

  const isDarkMode = useMemo(() => (
    theme === 'system'
      ? resolvedTheme === 'dark'
      : theme === 'dark'
  ), [theme, resolvedTheme]);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={isDarkMode ? darkTheme : defaultTheme}
      form={{
        requiredMark: false,
        validateMessages: {
          required: '${label}不能为空',
          default: '${label}格式错误',
        }
      }}
    >
      <App>
        <AppInner>{children}</AppInner>
      </App>
    </ConfigProvider>
  );
};

const MyApp = ({ children }: React.PropsWithChildren) => (
  <ThemeProvider attribute="class" enableSystem>
    <AppWrapper>{children}</AppWrapper>
  </ThemeProvider>
);

export default MyApp;

export { messageApi };