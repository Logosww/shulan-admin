'use client';

import * as React from 'react';

import { useTheme } from 'next-themes';
import { useDarkMode } from 'usehooks-ts';

import { Icons } from '@/components/Editor/plate-ui/icons';
// import { Button } from '@/components/Editor/plate-ui/button';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/Editor/plate-ui/dropdown-menu';
import { Button, Dropdown } from 'antd';

export const ThemeToggle = () => {
  const { isDarkMode, toggle } = useDarkMode();
  const { setTheme } = useTheme();

  const handleToggle = (theme: string) => {
    setTheme(theme);
    toggle();
  };

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
        onClick: ({ key: theme }) => handleToggle(theme),
      }}
    >
      <Button type="text" style={{ paddingInline: 6 }}>
        <Icons.sun className="size-[1.15rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Icons.moon className="absolute size-[1.15rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
    </Dropdown>
    // <DropdownMenu>
    //   <DropdownMenuTrigger asChild>
    //     <Button className="w-8 h-8 px-0" size="sm" variant="ghost">
    //       <Icons.sun className="size-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
    //       <Icons.moon className="absolute size-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    //       <span className="sr-only">切换主题</span>
    //     </Button>
    //   </DropdownMenuTrigger>
    //   <DropdownMenuContent align="end">
    //     <DropdownMenuItem onClick={handleToggle}>
    //       <Icons.sun className="mr-2 size-4" />
    //       <span>浅色模式</span>
    //     </DropdownMenuItem>
    //     <DropdownMenuItem onClick={handleToggle}>
    //       <Icons.moon className="mr-2 size-4" />
    //       <span>深色模式</span>
    //     </DropdownMenuItem>
    //   </DropdownMenuContent>
    // </DropdownMenu>
  );
}
