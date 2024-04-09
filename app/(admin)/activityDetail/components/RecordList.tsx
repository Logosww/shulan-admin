import { useState } from 'react';
import { Popover, Space, Image, Button, Tag, Dropdown, Form, Input, Popconfirm, Typography } from 'antd';
import { HttpClient, valueEnum2MenuItem } from '@/utils';
import { useMessage, useModal, usePagingAndQuery } from '@/hooks';
import { VolunteerType, VolunteerSignUpState, idCardTypeValueEnumMap, genderValueEnum } from '@/constants/value-enum';
import { ModalForm, ProDescriptions, ProFormDigit, ProFormGroup, ProFormSegmented, ProList, ProTable } from '@ant-design/pro-components';
import { DownOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { volunteerSignUpStateValueEnum, volunteerTypeForFormValueEnum, volunteerTypeValueEnum, volunteerWhitelistStateValueEnum } from '@/constants';

import type { Key, ReactNode } from 'react';
import type {
  ISignUpRecord,
  IVolunteer,
  TemporaryVolunteerForm,
  SignUpRecordDetail as _SignUpRecordDetail,
} from '@/utils/http/api-types';

type FilterForm = Pick<ISignUpRecord, 
  'purePhoneNumber' | 'activityWorkVolunteerState' | 'volunteerState'
> & { activityWork: number };
type FilterFormTransformed = NonNullable<Omit<FilterForm, 'activityWork'> & { activityWorkId: number }>;

const SignUpRecordDetail = ({ id }: { id: number }) => (
  <ProDescriptions<_SignUpRecordDetail, { id: number }>
    column={3}
    params={{ id }}
    request={params => HttpClient.getSignUpRecordDetail(params as { id: number }).then(data => ({ data, success: true }))}
    columns={[
      {
        title: '身份',
        renderText: (_, { volunteerIdentityVo }) => (
          <>
            {volunteerIdentityVo.school ? '学生' : '社会人士'}
            <Popover
              trigger="click"
              title="身份详情"
              content={
                <ProDescriptions
                  column={2}
                  bordered={true}
                  dataSource={volunteerIdentityVo}
                  columns={
                    volunteerIdentityVo.school
                      ? [
                        {
                          title: '学校',
                          dataIndex: 'school',
                          valueType: 'text',
                        },
                        {
                          title: '专业',
                          dataIndex: 'major',
                          valueType: 'text',
                        },
                        {
                          title: '年级',
                          dataIndex: 'grade',
                          valueType: 'text',
                        },
                        {
                          title: '学生证',
                          renderText: () => (
                            <Space>
                              {volunteerIdentityVo.studentCardPicUrls.map((url, index) => <Image className="object-cover" key={index} src={url} style={{ width: 96, height: 60, borderRadius: 6 }} />)}
                            </Space>
                          )
                        },
                      ]
                      : [
                        {
                          title: '毕业院校',
                          dataIndex: 'school',
                          valueType: 'text',
                        },
                        {
                          title: '入职单位',
                          dataIndex: 'jobUnit',
                          valueType: 'text',
                        },
                        {
                          title: '入职单位证明',
                          hide: volunteerIdentityVo.identityCertPicUrls.length === 0,
                          renderText: () => (
                            <Space>
                              {volunteerIdentityVo.identityCertPicUrls.map((url, index) => <Image className="object-cover" key={index} src={url} style={{ width: 96, height: 60, borderRadius: 6 }} />)}
                            </Space>
                          )
                        },
                      ]
                  }
                />
              }
            >
              <Button type="link" size="small" icon={<EyeOutlined />}>详情</Button>
            </Popover>
          </>
        )
      },
      {
        title: '证件照',
        dataIndex: 'idPhotoUrl',
        renderText: (_, { idPhotoUrl }) => <Image className="rounded-[6px] object-cover" src={idPhotoUrl} width={90} height={120} />
      },
      {
        title: '证件类型',
        dataIndex: 'idCardType',
        valueEnum: idCardTypeValueEnumMap,
      },
      {
        title: '证件号码',
        dataIndex: 'idCard',
      },
      {
        title: '报名原因',
        dataIndex: 'reason',
        valueType: 'text',
      },
      {
        title: '证件扫描件',
        renderText: (_ ,{ idCardNationalUrl, idCardPortraitUrl }) => (
          <Space>
            <Image className="object-cover" src={idCardNationalUrl} style={{ width: 96, height: 60, borderRadius: 6 }} />
            <Image className="object-cover" src={idCardPortraitUrl} style={{ width: 96, height: 60, borderRadius: 6 }} />
          </Space>
        ),
      },
      {
        title: '相关经历',
        dataIndex: 'experience',
        valueType: 'text',
      },
      {
        title: '相关经历证明',
        renderText: (_, { experiencePicUrls }) => (
          <Space>
            {experiencePicUrls.map((url, index) => <Image className="object-cover" key={index} src={url} style={{ width: 96, height: 60, borderRadius: 6 }} />)}
          </Space>
        )
      },
      {
        title: '违规情况',
        renderText: (_, { volunteerViolateVo: { currentViolateCount, violateCount, violateAt, releaseAt } }) => (
          violateCount
            ? `当前违规：${currentViolateCount}次 | 累计违规：${violateCount}次 | 封禁时间：${violateAt} | 解禁时间: ${releaseAt}`
            : '无'
        )
      },
      {
        title: '累计参与活动数',
        dataIndex: 'activityWorkExperienceTotalNum',
        valueType: 'digit',
      },
      {
        title: '历史志愿活动',
        dataIndex: 'activityWorkExperienceVos',
        valueType: 'textarea',
        renderText: (_, { activityWorkExperienceVos: works }) => 
          works.map(({ activityName, activityWorkNames }, index) => <div key={index}>【{activityName}】{activityWorkNames}</div>)
      }
    ]}
  />
);

const TempVolunteerModal = ({ id, onSubmit }:{ id: number; onSubmit: () => void }) => {
  
  const [isLoading, setIsLoading] = useState(false);
  const [volunteerList, setVolunteerList] = useState<IVolunteer[]>([]);

  const message = useMessage();
  const modal = useModal();
  const [form] = Form.useForm();


  const handleSearch = async () => {
    const phones = form.getFieldValue('phones') as string;
    if(!phones) return;

    setIsLoading(true);
    const purePhoneNumbers = phones.split(' ').filter(val => val);
    const { result, notFound } = await HttpClient.searchAvailableVolunteers({ activityId: id, purePhoneNumbers }).finally(() => setIsLoading(false));
    if(!result.length) return message.error('未找到符合条件的志愿者');
    const list = result.filter(({ id }) => volunteerList.findIndex(({ id: _id }) => _id === id) < 0);
    if(!list.length) return message.warning('请勿重复添加');

    setVolunteerList([...volunteerList, ...list]);
    if(notFound.length) modal.error({
      footer: null,
      centered: true,
      closable: true,
      title: '未找到以下手机号',
      content: notFound.map((phone, index) => <div key={index}>{phone}</div>),
    });
  };

  const handleSubmit = async (form: Omit<TemporaryVolunteerForm, 'id' | 'volunteerIds'>) => {
    const volunteerIds = volunteerList.map(({ id }) => id);
    await HttpClient.batchSetTempVolunteers({ id, volunteerIds, ...form });
    onSubmit();
    return true;
  };

  return (
    <ModalForm
      title="临时拉人"
      variant="filled"
      width={480}
      form={form}
      modalProps={{ centered: true, destroyOnClose: true }}
      submitter={{ submitButtonProps: { disabled: !volunteerList.length } }}
      trigger={<Button type="primary" icon={<PlusOutlined />}>临时拉人</Button>}
      onFinish={handleSubmit}
      onOpenChange={open => !open && setVolunteerList([])}
    >
      <ProFormGroup> 
        <ProFormSegmented label="身份" name="activityWorkVolunteerIdentity" initialValue={1} valueEnum={volunteerTypeForFormValueEnum} rules={[{ required: true }]} />
        <ProFormDigit label="酬金" name="money" width="xs" max={500} rules={[{ required: true }]} />
        <ProFormDigit label="积分" name="integral" width="xs" max={1000} rules={[{ required: true }]} />
      </ProFormGroup>
      <Form.Item name="phones">
        <Input.Search placeholder="请输入手机号，并以空格分隔" enterButton="批量导入" onSearch={handleSearch} />
      </Form.Item>
      <ProList<IVolunteer>
        rowKey="id"
        loading={isLoading}
        dataSource={volunteerList}
        pagination={{ pageSize: 6, total: volunteerList.length }}
        metas={{
          title: {
            dataIndex: 'name'
          },
          subTitle: {
            render: (_, { purePhoneNumber: phone }) => <Typography.Text>手机号：{phone}</Typography.Text>
          },
          actions: {
            render: (_, { id }, index) => [
              <Button 
                type="text"
                size="small"
                key={id}
                onClick={() => setVolunteerList(_list => {
                  const list = [..._list];
                  list.splice(index, 1);
                  return list;
                })}
                danger
              >
                删除
              </Button>
            ]
          }
        }}
      />
    </ModalForm>
  )
};

export const SignUpRecordList = ({ id }: { id: number }) => {

  const message = useMessage();
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
    queryRequest: (_form) => {
      const form: Record<string, any> = {..._form};
      form['activityWorkId'] = _form.activityWork;
      delete form['activityWork'];
      return HttpClient.filterSignUpRecords({...form as FilterFormTransformed, activityId: id });
    },
    filterFormTransform: (form) => ({
      activityWork: form.activityWork ?? null,
      volunteerState: form.volunteerState ?? null,
      purePhoneNumber: form.purePhoneNumber ?? null,
      activityWorkVolunteerState: form.activityWorkVolunteerState ?? null,
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
      form={{ variant: 'filled' }}
      search={{ span: 4 }}
      onSubmit={handleFilterQuery}
      onReset={handleFilterReset}
      toolbar={{
        actions: [<TempVolunteerModal key="append" id={id} onSubmit={reload} />]
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
          title: '姓名',
          key: 'name',
          hideInSearch: true,
          renderText: (_, { name, activityWorkVolunteerIdentity: type }) => (
            <>
              {name}
              {type !== VolunteerType.normal && <Tag style={{ marginLeft: 8 }} color={volunteerTypeValueEnum.get(type)?.status}>{volunteerTypeValueEnum.get(type)?.text}</Tag>}
            </>
          )
        },
        {
          title: '性别',
          dataIndex: 'sex',
          hideInSearch: true,
          valueEnum: genderValueEnum,
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
          valueEnum: volunteerSignUpStateValueEnum,
        },
        {
          title: '白名单状态',
          dataIndex: 'volunteerState',
          valueEnum: volunteerWhitelistStateValueEnum,
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
                    volunteerSignUpStateValueEnum,
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