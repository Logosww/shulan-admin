'use client';

import { LeftCircleOutlined } from '@ant-design/icons';
import { Button, Empty, Typography } from 'antd';

const NotFound = () => (
  <div className="absolute w-full h-full flex items-center justify-center">
    <Empty
      image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
      imageStyle={{ height: 120 }}
      description={
        <>
          <Typography.Title level={2}>404</Typography.Title>
          <span>页面未找到</span>
        </>
      }
    >
      <Button type="primary" icon={<LeftCircleOutlined />} href="/">返回主页</Button>
    </Empty>
  </div>
);

export default NotFound;