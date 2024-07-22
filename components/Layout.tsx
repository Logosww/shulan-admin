'use client';

import React, { useMemo, useState } from 'react';
import { Layout as _Layout, Breadcrumb, theme } from 'antd';
import { SideBar, Header, PageTitle } from '@/components';
import { adminMenuItems, breadcrumbItemMap, menuItems } from '@/constants';
import { usePathname } from 'next/navigation';
import { HomeOutlined } from '@ant-design/icons';
import { Role } from '@/constants/value-enum';
import useStore from '@/store';

import type { BreadcrumbProps } from 'antd';

const { Content } = _Layout;

export const Layout = ({ children }: React.PropsWithChildren) => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const role = useStore(state => state.role);

  const breadcrumbItems = useMemo<BreadcrumbProps['items']>(() => ([
    {
      href: '/',
      title: <HomeOutlined />
    },
    ...breadcrumbItemMap[pathname] ? [{ title: breadcrumbItemMap[pathname] }] : [],
  ]), [pathname]);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <_Layout className='absolute w-full h-full' hasSider>
      <SideBar menuItems={ role === Role.superAdmin ? adminMenuItems : menuItems } collapsed={collapsed} />
      <_Layout>
        <Header
          collapsed={collapsed}
          backgroundColor={colorBgContainer}
          onCollapse={() => setCollapsed(!collapsed)}
        />
        { pathname !== '/' && <div className='ml-[24px]'><Breadcrumb items={breadcrumbItems} /></div>}
        <Content
          style={{
            margin: 24,
            marginTop: 12,
            padding: 24,
            minHeight: 640,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflowY: 'auto',
          }}
        >
          { breadcrumbItemMap[pathname] && <PageTitle title={breadcrumbItemMap[pathname]} /> }
          {children}
        </Content>
      </_Layout>
    </_Layout>
  );
};