import { LeftCircleOutlined } from '@ant-design/icons';
import { Button, Empty } from 'antd';
import Title from 'antd/es/typography/Title';

const NotFound = () => (
  <div className="absolute w-full h-full flex items-center justify-center">
    <Empty
      image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
      imageStyle={{ height: 120 }}
      description={
        <>
          <Title level={2}>404</Title>
          <span>页面未找到</span>
        </>
      }
    >
      <Button type="primary" icon={<LeftCircleOutlined />} href="/">返回主页</Button>
    </Empty>
  </div>
);

export default NotFound;