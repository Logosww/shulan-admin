import {
  FireOutlined,
  FundOutlined,
  FundProjectionScreenOutlined,
  GiftOutlined,
  TeamOutlined,
  TransactionOutlined,
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
    key: '/analysis',
    icon: <FundProjectionScreenOutlined />,
    label: '数据分析',
  },
  {
    key: '/payroll',
    icon: <TransactionOutlined />,
    label: '薪资发放',
  },
  {
    key: '/welfare',
    icon: <GiftOutlined />,
    label: '福利专区',
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
]