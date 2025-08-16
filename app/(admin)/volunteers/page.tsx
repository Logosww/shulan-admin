'use client';

import { useState } from 'react';
import { DownOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Popover, Space, Image, Dropdown, Tag, Form, Table } from 'antd';
import { ProDescriptions, ProTable } from '@ant-design/pro-components';
import { HttpClient } from '@/utils';
import { useCOS, useMessage, usePagingAndQuery } from '@/hooks';
import { Role, VolunteerIdentity, VolunteerWhitelistState, hasActivityExperienceValueEnumMap, idCardTypeValueEnumMap, isCheckedValueEnumMap } from '@/constants/value-enum';
import { genderValueEnumMap, volunteerIdentityValueEnumMap, volunteerWhitelistStateValueEnumMap } from '@/constants';
import WhitelistDrawer from './components/WhitelistDrawer';
import ForbbidenListDrawer from './components/ForbbidenListDrawer';
import IgnoreListDrawer from './components/IgnoreListDrawer';

import type { ProDescriptionsProps } from '@ant-design/pro-components';
import type { IVolunteer, IVolunteerDetail } from '@/utils/http/api-types';

type FilterForm = {
  name: string;
  school: string;
  reviewerId: number;
  purePhoneNumber: string;
  identity: VolunteerIdentity,
  state: VolunteerWhitelistState;
  activityCount: number;
  searchActivityId: number;
  hasActivityExperience: boolean;
  isStudentVerified: boolean;
};

const { Summary } = Table;
const { Cell, Row } = Summary;

const studentColumns: ProDescriptionsProps<IVolunteerDetail>['columns'] = [
  {
    title: '学校',
    dataIndex: ['volunteerIdentityVo', 'school'],
    valueType: 'text',
  },
  {
    title: '专业',
    dataIndex: ['volunteerIdentityVo', 'major'],
    valueType: 'text',
  },
  {
    title: '年级',
    dataIndex: ['volunteerIdentityVo', 'grade'],
    valueType: 'text',
  },
  {
    title: '学生证',
    renderText: (_, { volunteerIdentityVo: { studentCardPicUrls } }) => (
      <div className="flex items-center gap-2 flex-wrap justify-start">
        {studentCardPicUrls.map((url, index) => <Image className="rounded-[6px] object-cover" key={index} src={url} style={{ width: 96, height: 60, borderRadius: 6 }} />)}
      </div>
    )
  },
];
const socialFigureColumns: ProDescriptionsProps<IVolunteerDetail>['columns'] = [
  {
    title: '毕业院校',
    dataIndex: ['volunteerIdentityVo', 'school'],
    valueType: 'text',
  },
  {
    title: '入职单位',
    dataIndex: ['volunteerIdentityVo', 'jobUnit'],
    valueType: 'text',
  },
  {
    title: '入职单位证明',
    renderText: (_, { volunteerIdentityVo: { identityCertPicUrls } }) => (
      identityCertPicUrls.length
      && <Space>
        {identityCertPicUrls.map((url, index) => <Image className="rounded-[6px] object-cover" key={index} src={url} style={{ width: 96, height: 60, borderRadius: 6 }} />)}
      </Space>
    )
  }
];

const VolunteersPage = () => {

  const [isExporting, setIsExporting] = useState(false);
  const [searchForm] = Form.useForm();
  const isSignedUp = Form.useWatch('hasActivityExperience', searchForm);
  const message = useMessage();
  const { download } = useCOS();
  const {
    reload,
    state: {
      paginationConfig,
      loading: [loading],
      dataSource: [volunteerList, setVolunteerList],
    },
    handler: {
      handleFilterQuery,
      handleFilterReset,
    }
  } = usePagingAndQuery<IVolunteer, FilterForm>({
    pagingRequest: HttpClient.getPagingVolunteers,
    queryRequest: HttpClient.filterVolunteers,
    filterFormTransform: (form) => ({
      name: form.name ?? null,
      state: form.state ?? null,
      school: form.school ?? null,
      identity: form.identity ?? null,
      reviewerId: form.reviewerId ?? null,
      purePhoneNumber: form.purePhoneNumber ?? null,
      activityCount: form.activityCount ?? null,
      searchActivityId: form.searchActivityId ?? null,
      hasActivityExperience: form.hasActivityExperience ?? null,
      isStudentVerified: form.isStudentVerified ?? null,
    }),
  });

  const handleExport = async () => {
    setIsExporting(true);
    const key = await HttpClient.getAllExportedVolunteerListKey();
    await download(key);
    message.success('导出成功');
    setIsExporting(false);
  };

  return (
    <ProTable<IVolunteer, FilterForm>
      rowKey="id"
      form={{ variant: 'filled' }}
      scroll={{ x: '100%' }}
      loading={loading}
      dataSource={volunteerList}
      pagination={paginationConfig}
      onSubmit={handleFilterQuery}
      onReset={handleFilterReset}
      search={{ span: 5, defaultCollapsed: false, form: searchForm }}
      toolbar={{
        actions: [
          <Button key="export" type="text" loading={isExporting} icon={<DownloadOutlined />} onClick={handleExport}>导出 Excel</Button>,
          <WhitelistDrawer key="whitelist" reloadTable={reload} />,
          <IgnoreListDrawer key="ignoreList" reloadTable={reload} />,
          <ForbbidenListDrawer key="forbbidenList" reloadTable={reload} />,
        ],
      }}
      columns={[
        {
          title: '姓名',
          dataIndex: 'name',
          valueType: 'text',
          className: 'whitespace-nowrap',
        },
        {
          title: '性别',
          dataIndex: 'sex',
          valueEnum: genderValueEnumMap,
          search: false,
        },
        {
          title: '年龄',
          dataIndex: 'age',
          valueType: 'digit',
          search: false,
        },
        {
          title: '身份',
          dataIndex: 'identity',
          valueType: 'select',
          valueEnum: volunteerIdentityValueEnumMap,
          render: (_, { identity, isStudentVerified }) => (
            identity === VolunteerIdentity.student
              ? (
                <div className="flex items-center gap-2">
                  <span className="flex-none">{volunteerIdentityValueEnumMap.get(identity)}</span>
                  {isStudentVerified && <Tag bordered={false} color="processing">已认证</Tag>}
                </div>
              )
              : volunteerIdentityValueEnumMap.get(identity)
          )
        },
        {
          dataIndex: 'isStudentVerified',
          title: '认证学生',
          valueType: 'select',
          valueEnum: isCheckedValueEnumMap,
          hideInTable: true,
        },
        {
          title: '手机号',
          dataIndex: 'purePhoneNumber',
          valueType: 'text',
        },
        {
          title: '注册时间',
          dataIndex: 'createAt',
          valueType: 'dateTime',
          search: false,
        },
        {
          title: '状态',
          dataIndex: 'state',
          valueType: 'select',
          valueEnum: volunteerWhitelistStateValueEnumMap,
          renderText: (_, { state }) => <Tag bordered={false} color={volunteerWhitelistStateValueEnumMap.get(state)?.status}>{volunteerWhitelistStateValueEnumMap.get(state)?.text}</Tag>
        },
        {
          title: '操作人',
          dataIndex: 'reviewerName',
          key: 'reviewerId',
          valueType: 'text',
          request: () => HttpClient.getUsersByRole({ code: Role.superAdmin }).then(users => users.map(({ label, id: value }) => ({ label, value }))),
        },
        {
          title: '操作时间',
          dataIndex: 'reviewAt',
          valueType: 'dateTime',
          search: false,
        },
        {
          title: '学校',
          key: 'school',
          valueType: 'text',
          hideInTable: true,
        },
        {
          title: '历史参与',
          key: 'hasActivityExperience',
          valueType: 'select',
          valueEnum: hasActivityExperienceValueEnumMap,
          hideInTable: true,
        },
        {
          title: '参与次数',
          key: 'activityCount',
          hideInTable: true,
          valueType: 'digit',
          fieldProps: { placeholder: '请输入（≥）' },
          search: isSignedUp,
        },
        {
          title: '历史活动',
          key: 'searchActivityId',
          hideInTable: true,
          valueType: 'select',
          search: isSignedUp,
          request: () => HttpClient.getActivityOptions({ isFilter: true }),
          fieldProps: { showSearch: true },
        },
        {
          title: '操作',
          key: 'option',
          valueType: 'option',
          width: 180,
          render: (_, { id, state, identity }, index) => (
            <>
              <Popover
                trigger="click"
                title="更多详情"
                placement="right"
                classNames={{ root: 'max-h-screen overflow-y-auto overflow-x-hidden' }}
                content={
                  <ProDescriptions<IVolunteerDetail>
                    size="small"
                    bordered={true}
                    column={3}
                    request={() => HttpClient.getVolunteerDetail({ id }).then(data => ({ data, success: true }))}
                    columns={[
                      {
                        title: '姓名',
                        dataIndex: 'name',
                      },
                      {
                        title: '昵称',
                        dataIndex: 'nickname',
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
                        title: '证件扫描件',
                        renderText: (_, { idCardNationalUrl, idCardPortraitUrl }) => (
                          <Space>
                            <Image className="rounded-[6px] object-cover" src={idCardNationalUrl} style={{ width: 96, height: 60, borderRadius: 6 }} />
                            <Image className="rounded-[6px] object-cover" src={idCardPortraitUrl} style={{ width: 96, height: 60, borderRadius: 6 }} />
                          </Space>
                        ),
                      },
                      ...(identity === VolunteerIdentity.student ? studentColumns : socialFigureColumns),
                      {
                        title: '相关经历',
                        dataIndex: 'experience',
                        valueType: 'textarea',
                        render: (_, { experience }) => (
                          experience
                            ? (
                              <div className="whitespace-pre-line max-w-[300px] max-h-[200px] overflow-y-auto">
                                {experience}
                              </div>
                            )
                            : '无'
                        ),
                      },
                      {
                        title: '相关经历证明',
                        renderText: (_, { experiencePicUrls }) => (
                          <div className="flex items-center gap-2 flex-wrap justify-start">
                            {experiencePicUrls.map((url, index) => <Image className="rounded-[6px] object-cover" key={index} src={url} style={{ width: 96, height: 60, borderRadius: 6 }} />)}
                          </div>
                        )
                      },
                      {
                        title: '白名单情况',
                        renderText: (_, { stateVo: { whiteListExpireAt } }) => whiteListExpireAt ? `${whiteListExpireAt} 到期` : '无',
                      },
                      {
                        title: '违规情况',
                        renderText: (_, { stateVo: { currentViolateCount, violateCount, violateAt, releaseAt, blackReason } }) => (
                          violateCount || blackReason || releaseAt || violateAt
                            ? `当前违规：${currentViolateCount}次 | 累计违规：${violateCount}次 | 封禁时间：${violateAt} | 解禁时间: ${releaseAt}${blackReason && ` | 拉黑原因：${blackReason}`}`
                            : '无'
                        )
                      },
                      // {
                      //   title: '累计参与活动数',
                      //   dataIndex: 'activityWorkExperienceTotalNum',
                      //   valueType: 'digit',
                      // },
                      {
                        title: '历史志愿活动',
                        dataIndex: 'activityWorkExperienceVos',
                        valueType: 'textarea',
                        render: (_, {
                          totalActivityTransferAmount,
                          activityWorkExperienceTotalNum,
                          activityWorkExperienceVos: works,
                        }) =>
                          works.length
                            ? (
                              <div className="p-[8px] w-full">
                                <Table<IVolunteerDetail['activityWorkExperienceVos'][number]>
                                  size="small"
                                  style={{ maxWidth: 400, marginInline: 0, marginBlock: 0 }}
                                  bordered
                                  pagination={false}
                                  scroll={{ y: 200, x: '100%' }}
                                  dataSource={works}
                                  columns={[
                                    {
                                      title: '活动名称',
                                      dataIndex: 'activityName',
                                      className: 'max-w-[100px]',
                                      ellipsis: true,
                                    },
                                    {
                                      title: '岗位',
                                      dataIndex: 'activityWorkNames',
                                      ellipsis: true,
                                      width: 80,
                                    },
                                    {
                                      title: '转账金额',
                                      dataIndex: 'activityTransferAmount',
                                      render: amount => `${amount} 元`,
                                      width: 80,
                                    },
                                  ]}
                                  summary={
                                    () => {
                                      const totalAmount = totalActivityTransferAmount ?? works.reduce((acc, cur) => acc + cur.activityTransferAmount, 0);
                                      const totalNum = activityWorkExperienceTotalNum || works.length;

                                      return (
                                        <Summary fixed>
                                          <Row>
                                            <Cell index={0} colSpan={3}>
                                              合计：历史累计参与活动 {totalNum} 次，累计转账金额 {totalAmount} 元
                                            </Cell>
                                          </Row>
                                        </Summary>
                                      );
                                    }
                                  }
                                />
                              </div>
                            )
                            : '无'
                      }
                    ]}
                  />
                }
              >
                <Button type="link" size="small" icon={<EyeOutlined />}>详情</Button>
              </Popover>
              <Dropdown
                trigger={['click']}
                menu={{
                  items: state === VolunteerWhitelistState.normal
                    ? [{ key: VolunteerWhitelistState.ignored, label: '拉黑' }]
                    : state === VolunteerWhitelistState.ignored
                      ? [{ key: VolunteerWhitelistState.normal, label: '取消拉黑' }]
                      : state === VolunteerWhitelistState.whitelist
                        ? [{ key: VolunteerWhitelistState.normal, label: '移出白名单' }]
                        : state === VolunteerWhitelistState.forbidden
                          ? [{ key: VolunteerWhitelistState.normal, label: '解封' }]
                          : [],
                  onClick: async ({ key }) => {
                    const state = parseInt(key);
                    await HttpClient.batchModifyVolunteerWhitelistState({ ids: [id], state });
                    message.success('更改状态成功');
                    setVolunteerList(_list => {
                      const list = [..._list];
                      list[index].state = state;
                      return list;
                    });
                  }
                }}
              >
                <a onClick={e => e.preventDefault()}>
                  <Space>
                    更改状态
                    <DownOutlined />
                  </Space>
                </a>
              </Dropdown>
            </>
          )
        }
      ]}
      cardBordered
    />
  );
};

export default VolunteersPage;