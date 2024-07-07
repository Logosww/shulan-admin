import { useEffect, useRef, useState } from 'react';
import { Button, Tag } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { usePagingAndQuery } from '@/hooks';
import { HttpClient } from '@/utils';
import SendModal from './SendModal';
import { isCheckedValueEnumMap, noticeStateValueEnumMap, volunteerSignUpStateValueEnumMap, volunteerTypeValueEnumMap } from '@/constants';

import type { NoticeTargetType } from './SendModal';
import type { INoticeRecord, NullableFilter } from '@/utils/http/api-types';

type FilterForm = NullableFilter<{
  isSend: boolean;
  activityWorkId: number;
} & Pick<INoticeRecord, 
  | 'id'
  | 'name'
  | 'phone'
  | 'readState'
  | 'activityWorkVolunteerState'
  | 'activityWorkVolunteerIdentity'
>>;

interface INoticeProps {
  id: number;
};

export const Notice = ({ id }: INoticeProps) => {
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [target, setTarget] = useState<NoticeTargetType>(null);
  const workList = useRef<{ value: number; label: string }[]>([]);

  const {
    reload: reloadTable,
    state: {
      paginationConfig,
      loading: [loading],
      dataSource: [checkinRecordList],
    },
    handler: {
      handleFilterQuery,
      handleFilterReset,
    }
  } = usePagingAndQuery<INoticeRecord, FilterForm>({
    pagingRequest: form => HttpClient.getPagingNoticeRecords({ ...form, activityId: id }),
    queryRequest: form => HttpClient.filterNoticeRecords({ ...form, activityId: id }),
    filterFormTransform: (form) => ({
      name: form.name ?? null,
      phone: form.phone ?? null,
      isSend: form.isSend ?? null,
      readState: form.readState ?? null,
      activityWorkId: form.activityWorkId ?? null,
      id: form.id ? parseInt(form.id as unknown as string) : null,
      activityWorkVolunteerState: form.activityWorkVolunteerState ?? null,
      activityWorkVolunteerIdentity: form.activityWorkVolunteerIdentity ?? null,
    }),
  });

  const handleSendToAll = () => {
    setTarget(null);
    setSendModalOpen(true);
  };

  const handleSendToSingle = (target: NoticeTargetType) => {
    setTarget(target);
    setSendModalOpen(true);
  };

  useEffect(() => {
    HttpClient.getActivityWorks({ id })
      .then(workList => workList.map(({ label, id: value }) => ({ label, value })))
      .then(list => workList.current = list);
  }, [id]);

  return (
    <>
      <ProTable<INoticeRecord, FilterForm>
        rowKey='id'
        loading={loading}
        dataSource={checkinRecordList}
        pagination={paginationConfig}
        form={{ variant: 'filled', ignoreRules: false }}
        search={{ span: 5, defaultCollapsed: false }}
        toolbar={{
          actions: [
            <Button key="sendToAll" type="primary" icon={<SendOutlined />} onClick={handleSendToAll}>一键发送</Button>
          ]
        }}
        onReset={handleFilterReset}
        onSubmit={handleFilterQuery}
        columns={[
          {
            title: '编号',
            key: 'id',
            dataIndex: 'id',
            formItemProps: {
              rules: [{
                validateTrigger: 'submit',
                validator: (_, value) => !value || /^(\d?)+$/.test(value) ? Promise.resolve() : Promise.reject(new Error('编号需为纯数字')),
              }],
            },
          },
          {
            title: '姓名',
            dataIndex: 'name',
            valueType: 'text',
          },
          {
            title: '手机号',
            dataIndex: 'phone',
            valueType: 'text',
          },
          {
            title: '志愿者类型',
            dataIndex: 'activityWorkVolunteerIdentity',
            valueType: 'select',
            valueEnum: volunteerTypeValueEnumMap,
            renderText: (_, { activityWorkVolunteerIdentity: type }) => <Tag color={volunteerTypeValueEnumMap.get(type)!.status}>{volunteerTypeValueEnumMap.get(type)!.text}</Tag>,
          },
          {
            title: '报名岗位',
            dataIndex: ['activityWork', 'label'],
            valueType: 'text',
            hideInSearch: true,
          },
          {
            title: '报名岗位',
            key: 'activityWorkId',
            valueType: 'select',
            fieldProps: {
              options: workList.current,
            },
            hideInTable: true,
          },
          {
            title: '报名状态',
            dataIndex: 'activityWorkVolunteerState',
            valueType: 'select',
            valueEnum: volunteerSignUpStateValueEnumMap,
          },
          {
            title: '发送状态',
            key: 'isSend',
            valueEnum: isCheckedValueEnumMap,
            hideInTable: true,
          },
          {
            title: '消息状态',
            dataIndex: 'readState',
            valueType: 'select',
            valueEnum: noticeStateValueEnumMap,
          },
          {
            title: '发送次数',
            dataIndex: 'sendCount',
            valueType: 'digit',
            hideInSearch: true,
          },
          {
            title: '操作人',
            dataIndex: 'senderName',
            valueType: 'text',
            hideInSearch: true,
          },
          {
            title: '操作时间',
            dataIndex: 'sendAt',
            valueType: 'text',
            hideInSearch: true,
          },
          {
            title: '操作',
            key: 'option',
            valueType: 'option',
            align: 'center',
            width: 100,
            renderText: (_, { id, name, phone, activityWork }) => (
              <Button type="link" onClick={() => handleSendToSingle({ id, name, phone, activityWork })}>发送</Button>
            ),
          }
        ]}
      />
      <SendModal
        id={id}
        open={sendModalOpen}
        target={target}
        workList={workList.current}
        onOpenChange={setSendModalOpen}
        reloadTable={reloadTable}
      />
    </>
  )
};

export default Notice;