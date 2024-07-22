'use client';

import { Layout, Menu } from 'antd';
import { useRouter, usePathname } from 'next/navigation';

import type { MenuItemType } from 'antd/es/menu/interface';

const { Sider } = Layout;

export interface ISideBarProps {
  collapsed: boolean;
  menuItems: MenuItemType[];
};

export const SideBar = ({ collapsed, menuItems }: ISideBarProps) => {
  const router = useRouter();
  const keyMap = menuItems.map(({ key }) => key);
  const pathname = usePathname();

  return (<Sider trigger={null} collapsed={collapsed} collapsible>
    <div className="logo-demo h-[64px] p-4 py-[14px]">
      <div className="rounded-lg bg-[#8df2a6] h-full leading-[36px] text-center text-[17px] font-bold text-[#0D0F02] select-none shadow-lg shadow-green-300/50">树懒志愿者后台系统</div>
    </div>
    <Menu
      theme="dark"
      mode="inline"
      items={menuItems}
      defaultSelectedKeys={keyMap.includes(pathname) ? [pathname] : void 0}
      onClick={({ key }) => router.push(key)}
    />
  </Sider>);
};