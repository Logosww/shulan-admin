'use client';

import { Card, Col, Flex, Row, Spin, Statistic } from 'antd';
import { useEffect, useState } from 'react';
import { 
  getActivitAtWork,
  getActivityAuditPass,
  getActivityAuditReject,
  getActivityCancelled,
  getActivityFinished,
  getActivityIllegalCancelled,
  getActivityOffWork,
  getActivityToBeAudit,
  getActivityTotalClick,
  getActivityTotalShare,
  getActivityTotalSignUp,
  getActivityWorksVolume,
} from '@/utils/http/api';
import CountUp from 'react-countup';
import { CarryOutTwoTone, FireTwoTone, HeartTwoTone, LoadingOutlined, setTwoToneColor } from '@ant-design/icons';

import type { StatisticProps } from 'antd';
import type { IActivityStatistics } from '@/utils/http/api-types';


const formatter: StatisticProps['formatter'] = (value) => (
  <CountUp end={value as number} separator="," />
);

export const Statistics = ({ id }: { id: number }) => {

  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState<IActivityStatistics>();
  
  useEffect(() => {
    setTwoToneColor('#38d96b');
    let statistics = {};
    Promise.all([
      getActivityTotalClick({ id }).then(count => ({ totalClick: count })),
      getActivityTotalShare({ id }).then(count => ({ totalShare: count })),
      getActivityTotalSignUp({ id }).then(count => ({ totalSignUp: count })),
      getActivityToBeAudit({ id }).then(count => ({ tobeAudit: count })),
      getActivityAuditPass({ id }).then(count => ({ auditPass: count })),
      getActivityAuditReject({ id }).then(count => ({ auditReject: count })),
      getActivityCancelled({ id }).then(count => ({ cancelled: count })),
      getActivityIllegalCancelled({ id }).then(count => ({ illegalCancelled: count })),
      getActivityFinished({ id }).then(count => ({ finished: count })),
      getActivitAtWork({ id }).then(count => ({ atWork: count })),
      getActivityOffWork({ id }).then(count => ({ offWork: count })),
      getActivityWorksVolume({ id }).then(worksVolume => ({ worksVolume })),
    ]).then(objArr => {
      objArr.forEach(obj => Object.assign(statistics, obj));
      setStatistics(statistics as IActivityStatistics);
      setIsLoading(false);
    })
  }, []);

  return (
    <Spin indicator={<LoadingOutlined />} spinning={isLoading}>
      <Row gutter={[32, 24]}>
        <Col span={12} xxl={{ span: 6 }}>
          <Card>
            <Flex justify="space-around">
              <Statistic title="总浏览量" value={statistics?.totalClick} formatter={formatter} prefix={<FireTwoTone />} />
              <Statistic title="总分享量" value={statistics?.totalShare} formatter={formatter} prefix={<HeartTwoTone />} />
              <Statistic title="总报名数" value={statistics?.totalSignUp} formatter={formatter} prefix={<CarryOutTwoTone />} />
            </Flex>
          </Card>
        </Col>
        <Col span={12} xxl={{ span: 6 }}>
          <Card>
            <Flex justify="space-around">
              <Statistic title="待审核数" value={statistics?.tobeAudit} formatter={formatter} />
              <Statistic title="审核通过" value={statistics?.auditPass} formatter={formatter} />
              <Statistic title="审核不通过" value={statistics?.auditReject} formatter={formatter} />
            </Flex>
          </Card>
        </Col>
        <Col span={12} xxl={{ span: 6 }}>
          <Card>
            <Flex justify="space-around">
              <Statistic title="主动取消数" value={statistics?.cancelled} formatter={formatter} />
              <Statistic title="违规取消数" value={statistics?.illegalCancelled} formatter={formatter} />
            </Flex>
          </Card>
        </Col>
        <Col span={12} xxl={{ span: 6 }}>
          <Card>
            <Flex justify="space-around">
              <Statistic title="进行中人数" value={statistics?.atWork} formatter={formatter} />
              <Statistic title="已完成人数" value={statistics?.finished} formatter={formatter} />
              <Statistic title="未到岗人数" value={statistics?.offWork} formatter={formatter} />
            </Flex>
          </Card>
        </Col>
        <Col span={12} xxl={{ span: 6 }}>
          <Card>
            <Flex justify="space-around">
              {
                statistics?.worksVolume.map((work, index) => <Statistic key={index} title={work.name} value={work.volume} />)
              }
            </Flex>
          </Card>
        </Col>
      </Row>
    </Spin>
  );
};