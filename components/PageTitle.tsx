'use client';

import { Button, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useIsClient } from 'usehooks-ts';

interface IPageTitleProps { title: string };

export const PageTitle = ({ title }: IPageTitleProps) => {
  const isClient = useIsClient();
  
  return (
    <div className="flex mb-[10px] flex-shrink-0">
      { 
        isClient && history.length >= 1
          ? <Button className="mr-[4px]" type="text" icon={<ArrowLeftOutlined />} onClick={() => history.back()} />
          : null
      }
      <Typography.Title style={{ marginBottom: 0 }} level={4}>{title}</Typography.Title>
    </div>
  );
};