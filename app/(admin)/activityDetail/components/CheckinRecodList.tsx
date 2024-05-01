'use client';

import { ProTable } from '@ant-design/pro-components';
import { usePagingAndQuery } from '@/hooks';
import { HttpClient } from '@/utils';
import { Gender, VolunteerType, genderValueEnum, volunteerTypeValueEnum } from '@/constants';

import type { ICheckinRecord, NullableFilter } from '@/utils/http/api-types';
import { Tag } from 'antd';

type FilterForm = NullableFilter<{
  activityWorkId: number;
  activityWorkVolunteerIdentity: VolunteerType;
  purePhoneNumber: string;
  name: string;
  id: number;
  sex: Gender;
}>;

export const CheckinRecodList = ({ id }: { id: number }) => {
  const {
    state: {
      paginationConfig,
      loading: [loading],
      dataSource: [checkinRecordList],
    },
    handler: {
      handleFilterQuery,
      handleFilterReset,
    }
  } = usePagingAndQuery<ICheckinRecord, FilterForm>({
    pagingRequest: form => HttpClient.getPagingCheckinRecords({ ...form, activityId: id }),
    queryRequest: form => HttpClient.filterCheckinRecords({ ...form, activityId: id }),
    filterFormTransform: (form) => ({
      sex: form.sex ?? null,
      name: form.name ?? null,
      activityWorkId: form.activityWorkId ?? null,
      purePhoneNumber: form.purePhoneNumber ?? null,
      id: form.id ? parseInt(form.id as unknown as string) : null,
      activityWorkVolunteerIdentity: form.activityWorkVolunteerIdentity ?? null,
    }),
  });

  return (
    <ProTable<ICheckinRecord, FilterForm>
      rowKey="id"
      form={{ variant: 'filled' }}
      loading={loading}
      dataSource={checkinRecordList}
      pagination={paginationConfig}
      onReset={handleFilterReset}
      onSubmit={handleFilterQuery}
      search={{ span: 5, defaultCollapsed: false }}
      columns={[
        {
          title: '编号',
          key: 'id',
          dataIndex: 'id',
          valueType: 'text',
        },
        {
          title: '姓名',
          dataIndex: 'name',
          valueType: 'text',
        },
        {
          title: '性别',
          dataIndex: 'sex',
          valueEnum: genderValueEnum,
        },
        {
          title: '年龄',
          dataIndex: 'age',
          valueType: 'text',
          hideInSearch: true,
        },
        {
          title: '手机号',
          dataIndex: 'purePhoneNumber',
          valueType: 'text',
        },
        {
          title: '志愿者类型',
          dataIndex: 'activityWorkVolunteerIdentity',
          valueEnum: volunteerTypeValueEnum,
          renderText: (_, { activityWorkVolunteerIdentity: type }) => (
            <Tag bordered={false} color={volunteerTypeValueEnum.get(type)!.status}>{volunteerTypeValueEnum.get(type)!.text}</Tag>
          ),
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
          request: () => HttpClient.getActivityWorks({ id }).then(works => works.map(({ id, label }) => ({ label, value: id }))),
          hideInTable: true,
        },
        {
          title: '是否签到',
          dataIndex: 'isChecked',
          renderText: (_, { isChecked }) => isChecked ? '是' : '否',
          hideInSearch: true,
        },
        {
          title: '负责人',
          dataIndex: 'reviewerName',
          valueType: 'text',
          hideInSearch: true,
        },
        {
          title: '签到时间',
          dataIndex: 'checkAt',
          valueType: 'dateTime',
          hideInSearch: true,
        },
      ]}
    />
  );
};