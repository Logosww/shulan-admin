'use client';

import { ConfigProvider, App } from 'antd';
import { useDarkMode } from 'usehooks-ts';
import { defaultTheme, darkTheme } from '@/theme/config';
import ContextProvider from '@/components/ContextProvider';
import zhCN from 'antd/locale/zh_CN';

import type { MessageInstance } from 'antd/es/message/interface';

let messageApi: MessageInstance;

const AppInner = ({ children }: React.PropsWithChildren) => {
  messageApi = App.useApp().message;
  return children;
};

const MyApp = ({ children }: React.PropsWithChildren) => {
  const { isDarkMode } = useDarkMode();

  return (
    <ContextProvider>
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
    </ContextProvider>
  );
};

export default MyApp;

export { messageApi };