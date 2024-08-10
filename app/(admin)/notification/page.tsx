'use client';

import { useState, useEffect, Suspense } from 'react';
import { Avatar, Badge, Button, Checkbox, Flex, Tag, theme } from 'antd';
import { ProList, ProSkeleton } from '@ant-design/pro-components';
import { useMessage } from '@/hooks';
import { HttpClient } from '@/utils';
import { NotificationState, notificationTypeValueEnumMap } from '@/constants';
import Text from 'antd/es/typography/Text';
import useStore from '@/store';

import type { Key } from 'react';
import type { INotification } from '@/utils/http/api-types';

const NotificationList = () => {
  const message = useMessage();
  const { token: { colorPrimary } } = theme.useToken();
  const [isReadingAll, setIsReadingAll] = useState(false);
  const [isReadingSelected, setIsReadingSelected] = useState(false);
  const [notificationPaginationConfig, setNotificationPaginationConfig] =
    useState<{
      pageSize: number;
      current: number;
      total: number;
    }>();
  const [notificationList, setNotificationList] = useState<INotification[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<readonly Key[]>([0]);

  const notificationCount = useStore(state => state.notificationCount);
  const setNotificationCount = useStore(state => state.setNotificationCount);

  const handleReadSelected = async () => {
    setIsReadingSelected(true);
    const ids = notificationList.filter((_, index) => selectedRowKeys.includes(index)).map(({ id }) => id);
    await HttpClient.batchReadNotification({ ids });
    setIsReadingSelected(false);
    message.success('操作成功');
  };

  useEffect(() => {
    HttpClient.getPagingNotification({ page: 1, size: 12 }).then(({ records, total }) => {
      setNotificationList(records);
      setNotificationPaginationConfig({
        total,
        current: 1,
        pageSize: 12,
      });
    });
    HttpClient.getUnreadNotificationCount().then(count => setNotificationCount(count));
  }, []);

  return (
    <ProList<INotification>
      rowKey="index"
      tableAlertRender={false}
      dataSource={notificationList}
      pagination={{
        ...notificationPaginationConfig,
        onChange: (page, size) => HttpClient.getPagingNotification({ page, size }).then(({ records, total }) => {
          setExpandedRowKeys([]);
          setNotificationList(records);
          setNotificationPaginationConfig({
            total,
            current: page,
            pageSize: size,
          });
        }),
      }}
      expandable={{ 
        expandedRowKeys, 
        onExpandedRowsChange: setExpandedRowKeys,
      }}
      rowSelection={{
        selectedRowKeys,
        onChange: setSelectedRowKeys,
      }}
      onRow={({ state, id }, _index) => ({
        onClick: () => {
          const rowKeys = [...expandedRowKeys];
          const index = rowKeys.findIndex(key => key === _index);
          index !== -1 ? rowKeys.splice(index, 1) : rowKeys.push(_index!);
          setExpandedRowKeys(rowKeys);
          state === NotificationState.unread
          && HttpClient.batchReadNotification({ ids: [id] })
            .then(() => setNotificationList(_list => {
              const list = [..._list];
              list[_index!].state = NotificationState.read;
              
              return list;
            }));
        }
      })
      }
      headerTitle={
        <Flex align="center" gap={8}>
          <Checkbox
            key="checkAll" 
            indeterminate={!!selectedRowKeys?.length && selectedRowKeys.length < 12}
            checked={selectedRowKeys?.length === 12}
            onChange={e => setSelectedRowKeys(e.target.checked ? Array.from({ length: 12 }, (_, index) => index) : [])}
          >
            全选
          </Checkbox>
          <Button 
            key="readAll"
            type="primary"
            disabled={!notificationCount}
            loading={isReadingAll}
            onClick={() => {
              setIsReadingAll(true);
              HttpClient.readAllNotification()
              .then(() => {
                setNotificationCount(0);
                setIsReadingAll(false);
                message.success('操作成功');
              });
            }}
          >
            全部已读
          </Button>
          <Button 
            key="readSelected"
            disabled={!(notificationCount && selectedRowKeys.length)}
            loading={isReadingSelected}
            onClick={handleReadSelected}
          >
            标记为已读
          </Button>
        </Flex>
      }
      metas={{
        avatar: {
          dataIndex: 'senderName',
          render: (_, { senderName }) => <Avatar size={36} style={{ backgroundColor: colorPrimary }}>{senderName}</Avatar>,
        },
        title: {
          dataIndex: 'title',
          render: (_, { title, state }) => (
            <Badge dot={state === NotificationState.unread}>
              <Text style={{ fontWeight: state === NotificationState.read ? 'normal' : 'bold' }}>{title}</Text>
            </Badge>
          )
        },
        subTitle: {
          dataIndex: 'type',
          render: (_, { type }) => <Tag bordered={false} color={notificationTypeValueEnumMap.get(type)!.status}>{notificationTypeValueEnumMap.get(type)!.text}</Tag>
        },
        description: {
          dataIndex: 'content',
          valueType: 'text',
          render: (_, { content }) => <div onClick={e => e.stopPropagation()}>{content}</div>,
        },
        actions: {
          dataIndex: 'createAt',
          valueType: 'dateTime',
        },
      }}
    />
  );
};

const NotificationPage = () => (
  <Suspense fallback={<ProSkeleton type="list" />}>
    <NotificationList />
  </Suspense>
);

export default NotificationPage;