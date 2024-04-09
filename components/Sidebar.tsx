'use client';

import { Layout, Menu } from 'antd';
import { useRouter } from 'next/navigation';

import type { MenuItemType } from 'antd/es/menu/hooks/useItems';

const { Sider } = Layout;

export interface ISideBarProps {
  collapsed: boolean;
  menuItems: MenuItemType[];
};

export const SideBar = ({ collapsed, menuItems }: ISideBarProps) => {
  const router = useRouter();

  return (<Sider trigger={null} collapsed={collapsed} collapsible>
    <div className="logo-demo h-[64px] p-4">
      <div className="rounded-lg bg-slate-500 h-full"></div>
    </div>
    <Menu
      theme="dark"
      mode="inline"
      items={menuItems}
      onClick={({ key }) => router.push(key)}
    />
  </Sider>);
};