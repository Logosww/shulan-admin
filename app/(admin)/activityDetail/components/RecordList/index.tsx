'use client';

import { useState } from 'react';
import { Space, Button, Tag, Dropdown, Popconfirm } from 'antd';
import { HttpClient, valueEnum2MenuItem } from '@/utils';
import { useCOS, useMessage, usePagingAndQuery } from '@/hooks';
import { VolunteerType, VolunteerSignUpState, genderValueEnumMap, VolunteerIdentity, volunteerIdentityValueEnumMap } from '@/constants/value-enum';
import { ProTable } from '@ant-design/pro-components';
import { DownOutlined, DownloadOutlined, FileExcelOutlined, FileZipOutlined, SendOutlined, StopOutlined } from '@ant-design/icons';
import { volunteerSignUpStateValueEnumMap, volunteerTypeValueEnumMap, volunteerWhitelistStateValueEnumMap } from '@/constants';
import { TempVolunteerModal } from './TempVolunteerModal';
import { SignUpRecordDetail } from './SignUpRecordDetail';
import { BatchImportModal } from './BatchImportModal';

import type { Key, ReactNode } from 'react';
import type {
  ISignUpRecord,
  SignUpRecordDetail as _SignUpRecordDetail,
} from '@/utils/http/api-types';

type FilterForm = Pick<ISignUpRecord, 
  | 'id' 
  | 'name' 
  | 'sex' 
  | 'purePhoneNumber' 
  | 'activityWorkVolunteerState' 
  | 'volunteerState'
  | 'activityWorkVolunteerIdentity'
> & { 
  activityWorkId: number;
  volunteerIdentity: VolunteerIdentity;
  school: string;
  activityCount: number;
  searchActivityId: number;
};

export const SignUpRecordList = ({ id }: { id: number }) => {

  const [isExporting, setIsExporting] = useState(false);

  const message = useMessage();
  const { download } = useCOS();
  const [expandedRowKeys, setExpandedRowKeys] = useState<readonly Key[]>([]);

  const {
    reload,
    state: {
      paginationConfig,
      loading: [isLoading],
      dataSource: [signUpRecordList, setSignUpRecordList],
    },
    handler: {
      handleFilterQuery,
      handleFilterReset,
    }
  } = usePagingAndQuery<ISignUpRecord, FilterForm>({
    pagingRequest: (params) => HttpClient.getPagingSignUpRecords({ ...params, activityId: id }),
    queryRequest: (form) => HttpClient.filterSignUpRecords({...form, activityId: id }),
    filterFormTransform: (form) => ({
      sex: form.sex ?? null,
      name: form.name ?? null,
      school: form.school ?? null,
      activityWorkId: form.activityWorkId ?? null,
      volunteerState: form.volunteerState ?? null,
      purePhoneNumber: form.purePhoneNumber ?? null,
      id: form.id ? parseInt(form.id as unknown as string) : null,
      activityWorkVolunteerState: form.activityWorkVolunteerState ?? null,
      activityWorkVolunteerIdentity: form.activityWorkVolunteerIdentity ?? null,
      volunteerIdentity: form.volunteerIdentity ?? null,
      activityCount: form.activityCount ?? null,
      searchActivityId: form.searchActivityId ?? null,
    }),
  });

  const handleSetSignUpState = async (id: number, state: VolunteerSignUpState) => {
    await HttpClient.setSignUpRecordState({ id, activityWorkVolunteerState: state });
    setSignUpRecordList(list => {
      const index = list.findIndex(({ id: _id }) => _id === id);
      if(index < 0) return list;

      const signUpRecordList = [...list];
      signUpRecordList[index].activityWorkVolunteerState = state;
      return signUpRecordList;
    })
    message.success('状态更改成功');
  };

  return (
    <ProTable<ISignUpRecord, FilterForm>
      rowKey="id"
      loading={isLoading}
      dataSource={signUpRecordList}
      form={{ variant: 'filled', ignoreRules: false }}
      search={{ span: 5, defaultCollapsed: false }}
      onSubmit={handleFilterQuery}
      onReset={handleFilterReset}
      toolbar={{
        actions: [
          <Dropdown
            key="export"
            menu={{
              items: [
                { key: 'list', label: '志愿者名单', icon: <FileExcelOutlined /> },
                { key: 'pics', label: '证件照合集', icon: <FileZipOutlined /> },
              ],
              onClick: async ({ key }) => {
                setIsExporting(true);
                const getKey = key === 'list' ? HttpClient.getExportedVolunteerListKey : HttpClient.getExportedIdCardPicsZipKey;
                const filename = key === 'list' ? '志愿者列表.xlsx' : '证件照合集.zip';
                const fileKey = await getKey({ id });
                download(fileKey, filename)
                  .then(() => message.success('导出成功'))
                  .catch(() => message.error('导出失败'))
                  .finally(() => setIsExporting(false));
              },
            }}
          >
            <Button type="text" icon={<DownloadOutlined />} loading={isExporting}>导出</Button>
          </Dropdown>,
          <TempVolunteerModal key="append" id={id} onSubmit={reload} />,
          <BatchImportModal key="batch" onSubmit={reload} />,
          <Popconfirm 
            key="sendSms"
            title="提示"
            description="确认对审核通过的志愿者群发短信通知吗？"
            onConfirm={async () => HttpClient.batchSendSmsNotification({ id }).then(() => {message.success('发送成功')}).then(() => reload())}
          >
            <Button type="primary" icon={<SendOutlined />}>群发短信</Button>
          </Popconfirm>,
          <Popconfirm 
            key="auditReject"
            title="提示"
            description="确认将待审核的志愿全部审核不通过吗？"
            onConfirm={async () => HttpClient.auditIgnoredVolunteerReject({ id }).then(() => {message.success('操作成功')})}
          >
            <Button type="primary" icon={<StopOutlined />} danger>一键不通过</Button>
          </Popconfirm>,
        ]
      }}
      expandable={{ 
        expandedRowKeys,
        onExpandedRowsChange: setExpandedRowKeys,
        expandedRowRender: ({ id }) => <SignUpRecordDetail id={id} />, 
      }}
      pagination={paginationConfig}
      onRow={({ id }) => ({
        onClick: () => {
          const rowKeys = [...expandedRowKeys];
          const index = rowKeys.findIndex(key => key === id);
          index !== -1 ? rowKeys.splice(index, 1) : rowKeys.push(id);
          setExpandedRowKeys(rowKeys);
        }
      })}
      columns={[
        {
          title: '编号',
          key: 'id',
          dataIndex: 'id',
          valueType: 'text',
          formItemProps: {
            rules: [{
              validateTrigger: 'submit',
              validator: (_, value) => !value || /^(\d?)+.$/.test(value) ? Promise.resolve() : Promise.reject(new Error('编号需为纯数字')),
            }],
          },
        },
        {
          title: '姓名',
          key: 'name',
          valueType: 'text',
          renderText: (_, { name, activityWorkVolunteerIdentity: type }) => (
            <>
              {name}
              {type !== VolunteerType.normal 
                && (
                  <Tag 
                    style={{ marginLeft: 8 }}
                    bordered={false}
                    color={volunteerTypeValueEnumMap.get(type)?.status}
                  >
                    {volunteerTypeValueEnumMap.get(type)?.text}
                  </Tag>
                )}
            </>
          )
        },
        {
          title: '性别',
          key: 'sex',
          dataIndex: 'sex',
          valueEnum: genderValueEnumMap,
        },
        {
          title: '年龄',
          dataIndex: 'age',
          valueType: 'digit',
          hideInSearch: true,
        },
        {
          title: '手机号',
          dataIndex: 'purePhoneNumber',
          valueType: 'text',
        },
        {
          title: '学校',
          key: 'school',
          valueType: 'text',
          hideInTable: true,
        },
        {
          title: '报名岗位',
          dataIndex: ['activityWork', 'label'],
          valueType: 'text',
          hideInSearch: true,
        },
        {
          title: '报名时间',
          dataIndex: 'joinAt',
          hideInSearch: true,
        },
        {
          title: '报名状态',
          dataIndex: 'activityWorkVolunteerState',
          valueEnum: volunteerSignUpStateValueEnumMap,
        },
        {
          title: '白名单状态',
          dataIndex: 'volunteerState',
          valueEnum: volunteerWhitelistStateValueEnumMap,
          hideInTable: true,
        },
        {
          title: '志愿者类型',
          dataIndex: 'activityWorkVolunteerIdentity',
          valueEnum: volunteerTypeValueEnumMap,
          hideInTable: true,
        },
        {
          title: '岗位',
          key: 'activityWorkId',
          valueType: 'select',
          request: () => HttpClient.getActivityWorks({ id }).then(works => works.map(({ id, label }) => ({ label, value: id }))),
          hideInTable: true,
        },
        {
          title: '审核人',
          valueType: 'text',
          dataIndex: 'reviewerName',
          hideInSearch: true,
        },
        {
          title: '审核时间',
          valueType: 'dateTime',
          dataIndex: 'reviewAt',
          hideInSearch: true,
        },
        {
          title: '志愿者身份',
          key: 'volunteerIdentity',
          hideInTable: true,
          valueType: 'select',
          valueEnum: volunteerIdentityValueEnumMap,
        },
        {
          title: '参与活动次数',
          key: 'activityCount',
          hideInTable: true,
          valueType: 'digit',
        },
        {
          title: '历史参与活动',
          key: 'searchActivityId',
          hideInTable: true,
          valueType: 'select',
          request: () => HttpClient.getActivityOptions({ isFilter: true }),
          fieldProps: { showSearch: true },
        },
        {
          title: '操作',
          key: 'option',
          valueType: 'option',
          align: 'center',
          width: 240,
          render: (_, record) => {
            const domList: ReactNode[] = [];
            const { id, useWhite, activityWorkVolunteerState: state, activityWorkVolunteerIdentity: type } = record;
            if(type === VolunteerType.normal) domList.push(
              <>
                {useWhite && <Tag color="processing" bordered={false}>白名单</Tag>}
                {state === VolunteerSignUpState.awaitingAudit
                  && (
                    <>
                      <Button type="link" size="small" onClick={e => {
                        e.stopPropagation();
                        handleSetSignUpState(id, VolunteerSignUpState.auditPassed);
                      }}>通过</Button>
                      <Button type="link" size="small" onClick={e => {
                        e.stopPropagation();
                        handleSetSignUpState(id, VolunteerSignUpState.auditFailed);
                      }} danger>不通过</Button>
                    </>
                  )}
              </>
            );
            else domList.push(
              <Popconfirm
                  title="警告"
                  description="该操作不可撤销，确认删除吗？"
                  onPopupClick={e => e.stopPropagation()}
                  onCancel={e => e?.stopPropagation()}
                  onConfirm={e => HttpClient.batchRemoveTempVolunteers({ ids: [id] }).then(() => {
                    e?.stopPropagation();
                    message.success('删除成功');
                    reload();
                  })}
                >
                  <Button type="text" size="small" onClick={e => e.stopPropagation()} danger>删除</Button>
                </Popconfirm>
            );
            
            domList.push(
              <Dropdown
                trigger={['click']}
                menu={{
                  items: valueEnum2MenuItem(
                    volunteerSignUpStateValueEnumMap,
                    [VolunteerSignUpState.awaitingAudit, VolunteerSignUpState.cancelled, VolunteerSignUpState.cancelledOutOfIllegal],
                  ),
                  onClick: async ({ key, domEvent }) =>  {
                    domEvent.stopPropagation();
                    const state = parseInt(key);
                    await handleSetSignUpState(id, state);
                    record.activityWorkVolunteerState = state;
                  },
                }}
              >
                <a onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                }}>
                  <Space>
                    更改状态
                    <DownOutlined />
                  </Space>
                </a>
              </Dropdown>
            );

            return domList;
          }
        }
      ]}
      cardBordered
    />
  )
};