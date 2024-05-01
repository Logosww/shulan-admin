'use client';

import { useState, useContext, useRef, useEffect } from 'react';
import { LoadingOutlined, MailOutlined } from '@ant-design/icons';
import { Popover, Badge, Button, List, Spin, Empty } from 'antd';
import { NotificationCountContext } from './ContextProvider';
import { NotificationState, notificationTypeValueEnumMap } from '@/constants';
import { HttpClient } from '@/utils';
import { isClient } from '@/utils/http/request';
import Text from 'antd/es/typography/Text';

import type { INotification } from '@/utils/http/api-types';

export const Notification = () => {
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationList, setNotificationList] = useState<INotification[]>([]);
  const [notificationCount, setNotificationCount] = useContext(NotificationCountContext)!;

  const handleReadNotification = async (id: number, state: NotificationState) => {
    await HttpClient.batchReadNotification({ ids: [id] });
    if(state === NotificationState.unread) {
      setNotificationList(_list => {
        const list = [..._list];
        const index = list.findIndex(({ id: _id }) => _id === id);
        list[index].state = NotificationState.read;

        return list;
      });
      notificationCount && setNotificationCount(count => --count);
    }
    anchorRef.current?.click();
    setOpen(false);
  };

  useEffect(() => {
    HttpClient.getUnreadNotificationCount().then(count => setNotificationCount(count))
  }, isClient ? [history.length] : []);

  return (
  <Popover
    open={open}
    trigger="click"
    title="消息通知"
    onOpenChange={open => {
      open
      && !notificationList.length 
      && HttpClient.getPagingNotification({ page: 1, size: 3 })
        .then(({ records: list }) => {setNotificationList(list), setIsLoading(false)});
        
      setOpen(open);
    }}
    content={
      notificationCount
        ? (
          <Spin indicator={<LoadingOutlined />} spinning={isLoading}>
            <List
              className="w-[250px]"
              dataSource={notificationList}
              footer={<a className="block text-center" href="/notification" target="_blank" ref={anchorRef}>查看全部</a>}
              renderItem={(notification) => (
                <div>
                  <Text 
                    className="hover:text-[#38d96b] cursor-pointer"
                    style={{ fontWeight: notification.state === NotificationState.read ? 'normal' : 'bold' }}
                    onClick={() => handleReadNotification(notification.id, notification.state)}
                    ellipsis
                  >
                    {`【${notificationTypeValueEnumMap.get(notification.type)!.text}】${notification.title}`}
                  </Text>
                </div>
              )}
            />
          </Spin>
        )
        : (
          <Empty className="w-[250px]" description="暂无新通知" image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <Button type="primary" href="/notification" target="_blank">查看全部</Button>
          </Empty>
        )
    }
  >
    <Badge size="small" offset={[-5, 5]} count={notificationCount}>
      <Button type="text" icon={<MailOutlined />} onClick={() => setOpen(true)} />
    </Badge>
  </Popover>
  );
};