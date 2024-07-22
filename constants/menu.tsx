import {
  FireOutlined,
  FundOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';

import type { ISideBarProps } from '@/components/Sidebar';

export const menuItems: ISideBarProps['menuItems'] = [
  {
    key: '/activities',
    icon: <FireOutlined />,
    label: '活动管理',
  }
];

export const adminMenuItems: ISideBarProps['menuItems'] = [
  {
    key: '/activities',
    icon: <FireOutlined />,
    label: '活动管理',
  },
  {
    key: '/banners',
    icon: <FundOutlined />,
    label: 'Banner 管理',
  },
  {
    key: '/volunteers',
    icon: <UserOutlined />,
    label: '志愿者管理',
  },
  {
    key: '/admins',
    icon: <TeamOutlined />,
    label: '管理员管理',
  },
];