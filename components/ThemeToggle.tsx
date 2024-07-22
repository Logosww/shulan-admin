'use client';

import * as React from 'react';

import { useTheme } from 'next-themes';
import { Button, Dropdown } from 'antd';
import { Icons } from '@/components/Editor/plate-ui/icons';

export const ThemeToggle = () => {
  const { setTheme } = useTheme();

  return (
    <Dropdown 
      trigger={['click']}
      menu={{
        items: [
          {
            key: 'light',
            label: (
              <div className="flex items-center">
                <Icons.sun className="mr-2 size-[1.15rem]" />
                <span>浅色模式</span>
              </div>
            )
          },
          {
            key: 'dark',
            label: (
              <div className="flex items-center">
                <Icons.moon className="mr-2 size-[1.15rem]" />
                <span>深色模式</span>
              </div>
            )
          }
        ],
        onClick: ({ key: theme }) => setTheme(theme),
      }}
    >
      <Button type="text" style={{ paddingInline: 6 }}>
        <Icons.sun className="size-[1.15rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Icons.moon className="absolute size-[1.15rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
    </Dropdown>
  );
}
