'use client';

import { DownOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Popover, Space, Image, Dropdown, Tag } from 'antd';
import { ProDescriptions, ProTable } from '@ant-design/pro-components';
import { HttpClient } from '@/utils';
import { useMessage, usePagingAndQuery } from '@/hooks';
import { VolunteerIdentity, VolunteerWhitelistState, idCardTypeValueEnumMap } from '@/constants/value-enum';
import { genderValueEnum, volunteerIdentityValueEnum, volunteerWhitelistStateValueEnum } from '@/constants';
import { WhitelistModal } from './components/WhitelistModal';
import { ForbbidenListModal } from './components/ForbbidenListModal';

import type { ProDescriptionsProps } from '@ant-design/pro-components';
import type { IVolunteer, IVolunteerDetail } from '@/utils/http/api-types';
import { IgnoreListModal } from './components/IgnoreListModal';

type FilterForm = {
  name: string;
  purePhoneNumber: string;
  identity: VolunteerIdentity,
  state: VolunteerWhitelistState;
};

const descriptionItemStyle = { whiteSpace: 'pre-line', maxWidth: 500 };

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
      <Space>
        {studentCardPicUrls.map((url, index) => <Image className="rounded-[6px] object-cover" key={index} src={url} style={{ width: 96, height: 60, borderRadius: 6 }} />)}
      </Space>
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
  
  const message = useMessage();
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
      identity: form.identity ?? null,
      purePhoneNumber: form.purePhoneNumber ?? null,
    }),
  });

  return (
    <ProTable<IVolunteer, FilterForm>
      rowKey="id"
      search={{ span: 4 }}
      form={{ variant: 'filled' }}
      loading={loading}
      dataSource={volunteerList}
      pagination={paginationConfig}
      onSubmit={handleFilterQuery}
      onReset={handleFilterReset}
      toolbar={{
        actions: [
          <WhitelistModal key="whitelist" reloadTable={reload} />,
          <IgnoreListModal key="ignoreList" reloadTable={reload} />,
          <ForbbidenListModal key="forbbidenList" reloadTable={reload} />,
        ],
      }}
      columns={[
        {
          title: '姓名',
          dataIndex: 'name',
          valueType: 'text',
        },
        {
          title: '性别',
          dataIndex: 'sex',
          valueEnum: genderValueEnum,
          hideInSearch: true,
        },
        {
          title: '年龄',
          dataIndex: 'age',
          valueType: 'digit',
          hideInSearch: true,
        },
        {
          title: '身份',
          dataIndex: 'identity',
          valueType: 'select',
          valueEnum: volunteerIdentityValueEnum,
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
          hideInSearch: true,
        },
        {
          title: '状态',
          dataIndex: 'state',
          valueType: 'select',
          valueEnum: volunteerWhitelistStateValueEnum,
          renderText: (_, { state }) => <Tag bordered={false} color={volunteerWhitelistStateValueEnum.get(state)?.status}>{volunteerWhitelistStateValueEnum.get(state)?.text}</Tag>
        },
        {
          title: '操作人',
          dataIndex: 'reviewerName',
          valueType: 'text',
          hideInSearch: true,
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
                        renderText: (_ ,{ idCardNationalUrl, idCardPortraitUrl }) => (
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
                        contentStyle: descriptionItemStyle,
                      },
                      {
                        title: '相关经历证明',
                        renderText: (_, { experiencePicUrls }) => (
                          <Space>
                            {experiencePicUrls.map((url, index) => <Image className="rounded-[6px] object-cover" key={index} src={url} style={{ width: 96, height: 60, borderRadius: 6 }} />)}
                          </Space>
                        )
                      }
                    ]}
                  />
                }
              >
                <Button type="link"size="small" icon={<EyeOutlined />}>详情</Button>
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