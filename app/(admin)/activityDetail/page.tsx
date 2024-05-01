'use client';

import { Tabs } from 'antd';
import { useSearchParams } from 'next/navigation';
import { ActivityBasicInfo } from './components/BasicInfo';
import { SignUpRecordList } from './components/RecordList';
import { Statistics } from './components/Stastics';
import { Suspense } from 'react';
import { ProSkeleton } from '@ant-design/pro-components';
import { Live } from './components/Live';
import { Certificate } from './components/Certificate';
import { CheckinRecodList } from './components/CheckinRecodList';

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
        key: 'checkin',
        label: '签到记录',
        children: <CheckinRecodList id={activityId} />
      },
    ]} />
  );
};

const ActivityDetail = () => (
  <Suspense fallback={<ProSkeleton type="descriptions" />}>
    <ActivityDetailInner />
  </Suspense>
);

export default ActivityDetail;