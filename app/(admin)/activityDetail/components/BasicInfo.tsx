'use client';

import dayjs from 'dayjs';
import { useRef, useState } from 'react';
import { Button, Flex, Image, Popconfirm, Switch, Tag } from 'antd';
import { HttpClient } from '@/utils';
import { useMessage } from '@/hooks';
import { activityStateValueEnumMap, activityTypeValueEnumMap } from '@/constants';
import { PlusOutlined } from '@ant-design/icons';
import { 
  CheckCard,
  ModalForm,
  ProDescriptions,
  ProForm,
  ProFormDateTimeRangePicker,
  ProFormDigit,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { ActivityState, WorkTag, activityFeatureValueEnumMap, workTagValueEnumMap } from '@/constants/value-enum';

import type { ActionType} from '@ant-design/pro-components';
import type { IActivityDetail, IVolunteerWork, VolunteerWorkForm } from '@/utils/http/api-types';

const WorkCard = ({ data, activityId }: { data: IVolunteerWork, activityId: number }) => {
  const [available, setAvailable] = useState(!data.isFull);
  const message = useMessage();

  const handleAvailableChange = async (available: boolean) => {
    await HttpClient.setWorkAvailable({ activityId, workId: data.id, isFull: !available });
    setAvailable(available);
    message.success('修改成功');
  };

  return (
    <CheckCard
      style={{ marginBlockEnd: 8, minWidth: 420 }}
      title={(
        <>
          { data.label !== WorkTag.normal && <Tag bordered={false} color={workTagValueEnumMap.get(data.label)?.status}>{workTagValueEnumMap.get(data.label)?.text}</Tag>}
          { data.name }
        </>
      )}
      bodyStyle={{ paddingBlockEnd: 0 }}
      disabled={!available}
      checked={available}
      extra={<Switch checkedChildren="报名中" unCheckedChildren="已报满" checked={available} onChange={handleAvailableChange} />}
      bordered
    >
      <ProDescriptions<IVolunteerWork>
        column={2}
        dataSource={data}
        columns={[
          {
            title: '酬金',
            dataIndex: 'money',
            valueType: 'money',
          },
          {
            title: '工作时间',
            valueType: 'text',
            renderText: (_, { startAt, endAt }) => `${startAt} 至 ${endAt}`,
          },
          {
            title: '实际参与人数',
            dataIndex: 'signupSuccessCount',
            valueType: 'text',
          },
          {
            title: '积分',
            dataIndex: 'integral',
            valueType: 'text',
          },
          {
            title: '工作内容',
            dataIndex: 'description',
            valueType: 'textarea',
          },
        ]}
      />
    </CheckCard>
  )
};

export const ActivityBasicInfo = ({ id }: { id: number }) => {
  const current = dayjs();
  
  const message = useMessage();
  const actionRef = useRef<ActionType>();

  const handleEndActivity = async (id: number) => {
    await HttpClient.endActivity({ id });
    message.success('结束活动成功');
    actionRef.current?.reload();
  };

  const handleAppendWork = async (_form: VolunteerWorkForm & { dateRange: [string, string] }) => {
    const form: Record<string, any> = {..._form};
    const [startAt, endAt] = _form.dateRange;
    form['startAt'] = startAt, form['endAt'] = endAt;
    delete form['dateRange'];
    await HttpClient.appendWork({ id, form: form as IVolunteerWork });
    actionRef.current?.reload();
    message.success('添加成功');
    return true;
  };

  return (
    <>
      <ProDescriptions<IActivityDetail, { id: number }>
        title="详细信息"
        column={3}
        actionRef={actionRef}
        params={{ id }}
        request={params => HttpClient.getActivityDetail(params as { id: number }).then(data => ({ data, success: true }))}
        columns={[
          {
            valueType: 'option',
            renderText: (_, { id, state }) => 
              state !== ActivityState.finished
              && (
                <Popconfirm title="提示" description="确认提前结束活动吗？" onConfirm={() => handleEndActivity(id)}>
                  <Button ghost danger>结束活动</Button>
                </Popconfirm>
              )
          },
          {
            title: '活动名称',
            dataIndex: 'name',
            valueType: 'text',
          },
          {
            title: '活动类型',
            dataIndex: 'type',
            valueType: 'text',
            valueEnum: activityTypeValueEnumMap,
          },
          {
            title: '活动保障',
            dataIndex: 'features',
            valueType: 'text',
            renderText: (_, { features }) => features.map(feature => activityFeatureValueEnumMap.get(feature)).join(' '),
          },
          {
            title: '活动封面',
            dataIndex: 'coverUrl',
            renderText: (_, { coverUrl }) => <Image className="rounded-[6px] object-cover" width={88} height={120} src={coverUrl} />
          },
          {
            title: '城市',
            dataIndex: 'city',
            valueType: 'text',
          },
          {
            title: '具体地址',
            dataIndex: 'address',
            valueType: 'text',
          },
          {
            title: '活动状态',
            dataIndex: 'state',
            valueType: 'text',
            valueEnum: activityStateValueEnumMap,
            renderText: (_, { state }) => <Tag bordered={false} color={activityStateValueEnumMap.get(state)?.status}>{activityStateValueEnumMap.get(state)?.text}</Tag>
          },
          {
            title: '活动时间',
            valueType: 'text',
            renderText: (_, { startAt, endAt }) => startAt === endAt ? startAt : `${startAt} 至 ${endAt}`,
          },
          {
            title: '报名时间',
            valueType: 'text',
            renderText: (_, { signupStartAt, signupEndAt }) => `${signupStartAt} 至 ${signupEndAt}`
          },
          {
            title: '取消报名截止时间',
            dataIndex: 'signupCancelAt',
            valueType: 'dateTime',
          },
          {
            title: '发起人',
            dataIndex: 'manager',
            valueType: 'text',
            renderText: (_, { manager: { name } }) => name,
          },
          {
            title: '审核人',
            dataIndex: 'reviewer',
            valueType: 'text',
            renderText: (_, { reviewer: { name } }) => name,
          },
          {
            title: '在小程序展示',
            dataIndex: 'isDisplay',
            valueType: 'text',
            renderText: (_, { isDisplay }) => isDisplay ? '是' : '否',
          },
          {
            title: '展示酬金',
            dataIndex: 'isMoney',
            valueType: 'text',
            renderText: (_, { isMoney }) => isMoney ? '是' : '否',
          },
          {
            title: '展示工作须知',
            dataIndex: 'isWorkInstruction',
            valueType: 'text',
            renderText: (_, { isWorkInstruction }) => isWorkInstruction ? '是' : '否',
          },
          {
            title: '使用白名单',
            dataIndex: 'isWhite',
            valueType: 'text',
            renderText: (_, { isWhite }) => isWhite ? '是' : '否',
          },
          {
            title: '线下签到',
            dataIndex: 'isCheck',
            valueType: 'text',
            renderText: (_, { isCheck }) => isCheck ? '是' : '否',
          },
          {
            title: '活动描述',
            dataIndex: 'description',
            valueType: 'textarea',
          },
          {
            title: '活动公告',
            dataIndex: 'announcement',
            valueType: 'textarea',
            span: 3,
          },
          {
            title: '岗位列表',
            dataIndex: 'workList',
            span: 3,
            renderText: (_, { workList, signupEndAt, endAt, id }) => (
              <Flex gap={24} wrap="wrap" className="w-full overflow-x-auto">
                {
                  workList.map((work, index) => <WorkCard data={work} key={index} activityId={id} />)
                }
                <ModalForm<VolunteerWorkForm & { dateRange: [string, string] }>
                  title="新增岗位"
                  variant="filled"
                  width={500}
                  trigger={<Button type="dashed" icon={<PlusOutlined />}>新增岗位</Button>}
                  onFinish={handleAppendWork}
                >
                  <ProForm.Group>
                    <ProFormText label="名称" name="name" width="xs" rules={[{ required: true, message: '岗位名称不能为空' }]} />
                    <ProFormDigit label="酬金" name="money" width="xs" max={500} rules={[{ required: true, message: '岗位酬金不能为空' }]} />
                    <ProFormDigit label="积分" name="integral" width="xs" max={1000} rules={[{ required: true, message: '岗位积分不能为空' }]} />
                  </ProForm.Group>
                  <ProForm.Group>
                    <ProFormDateTimeRangePicker
                      label="工作时间"
                      name="dateRange"
                      fieldProps={{ minDate: current }}
                      rules={[
                        { required: true, message: '工作时间不能为空' },
                        () => ({
                          validator: (_, [workStart, workEnd]) => {
                            if(workStart && workEnd && workStart.isSame(workEnd)) return Promise.reject(new Error('工作时长不能为0'));
                            if(workStart && ( workStart.isSame(signupEndAt) || workStart.isBefore(signupEndAt))) 
                              return Promise.reject(new Error('工作开始时间不能早于报名截止时间'));
                            if(workEnd && workEnd.isAfter(endAt)) return Promise.reject(new Error('工作结束时间不能晚于活动结束时间'));
                            return Promise.resolve();
                          }
                        }),
                      ]}
                    />
                  </ProForm.Group>
                  <ProFormTextArea label="工作内容" name="description" width="lg" rules={[{ required: true, message: '工作内容不能为空' }]} />
                </ModalForm>
              </Flex>
            )
          },
        ]}
      >
      </ProDescriptions>
    </>
  );
};