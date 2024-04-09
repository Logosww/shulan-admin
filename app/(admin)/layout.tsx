'use client';

import React, { useContext, useMemo, useState } from 'react';
import { Layout, Breadcrumb, theme } from 'antd';
import { SideBar, Header, UserRoleContext, PageTitle } from '@/components';
import { adminMenuItems, breadcrumbItemMap, menuItems } from '@/constants';
import { usePathname } from 'next/navigation';
import { HomeOutlined } from '@ant-design/icons';
import { Role } from '@/constants/value-enum';

import type { BreadcrumbProps } from 'antd';

const { Content } = Layout;

const AdminLayout = ({ children }: React.PropsWithChildren) => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const [role] = useContext(UserRoleContext)!;

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
    <Layout className='absolute w-full h-full'>
      <SideBar menuItems={ role === Role.superAdmin ? adminMenuItems : menuItems } collapsed={collapsed} />
      <Layout>
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
      </Layout>
    </Layout>
  );
};

export default AdminLayout;