'use client';

import { Tabs } from 'antd';
import { useSearchParams } from 'next/navigation';
import {
  Live,
  // Payroll,
  Statistics,
  Certificate,
  SignUpRecordList,
  CheckinRecodList,
  ActivityBasicInfo,
  Notice,
} from './components';
import { Suspense } from 'react';
import { ProSkeleton } from '@ant-design/pro-components';

const ActivityDetailInner = () => {

  const query = useSearchParams();
  const activityId = parseInt(query.get('id') ?? '') || void 0;
  if(!activityId) throw new Error('Invalid Params');

  return (
    <Tabs items={[
      {
        key: 'basic',
        label: '基本信息',
        children: <ActivityBasicInfo id={activityId} />,
      },
      {
        key: 'statistics',
        label: '活动数据',
        children: <Statistics id={activityId} />
      },
      {
        key: 'live',
        label: '现场回顾',
        children: <Live id={activityId} />,
      },
      {
        key: 'certificate',
        label: '纪念证书',
        children: <Certificate id={activityId} />
      },
      {
        key: 'audi',
        label: '志愿者审核',
        children: <SignUpRecordList id={activityId} />,
      },
      {
        key: 'notice',
        label: '消息通知',
        children: <Notice id={activityId} />,
      },
      {
        key: 'checkin',
        label: '签到记录',
        children: <CheckinRecodList id={activityId} />
      },
      // {
      //   key: 'payroll',
      //   label: '酬金打款',
      //   children: <Payroll id={activityId} />,
      // },
    ]} />
  );
};

const ActivityDetail = () => (
  <Suspense fallback={<ProSkeleton type="descriptions" />}>
    <ActivityDetailInner />
  </Suspense>
);

export default ActivityDetail;