'use client';

import { ActivityState, Role } from '@/constants/value-enum';
import { ProForm, ProFormInstance, ProFormSelect, ProFormText, ProList, ProSkeleton } from '@ant-design/pro-components';
import { HttpClient } from '@/utils/http';
import { Suspense, useRef } from 'react';
import { Button, Popconfirm, Tag } from 'antd';
import { CheckOutlined, ClockCircleFilled, CopyOutlined, DeleteOutlined, EditOutlined, EnvironmentFilled, PlusOutlined, RollbackOutlined, SendOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useMessage, usePagingAndQuery } from '@/hooks';
import { activityStateValueEnumMap } from '@/constants';
import useStore from '@/store';

import type { ActivityPreview } from '@/utils/http/api-types';

type FilterForm = { state: ActivityState; keyword: string };

const ActivityList = () => {

  const router = useRouter();
  const message = useMessage();
  const role = useStore(state => state.role);
  const formRef = useRef<ProFormInstance>(void 0);

  const {
    reload,
    state: {
      paginationConfig,
      loading: [loading],
      dataSource: [activityList, setActivityList],
    },
    handler: {
      handleFilterQuery,
      handleFilterReset,
    }
  } = usePagingAndQuery<ActivityPreview, FilterForm>({
    pagingRequest: HttpClient.getPagingActivities,
    queryRequest: HttpClient.filterActivities,
    filterFormTransform: (form) => ({ state: form.state ?? null, keyword: form.keyword ?? null }),
  });

  const handleCopyActivity = (id: number) => router.push(`/activityForm?operation=copy&id=${id}`);

  const handleModifyActivity = (id: number) => router.push(`/activityForm?operation=modify&id=${id}`);

  const handleDeleteActivity = async (id: number) => {
    await HttpClient.deleteActivityDraft({ id });
    message.success('删除活动成功');
    reload();
  };

  const handleCancelApplication = async (id: number) => {
    await HttpClient.cancelActivityApplication({ id });
    setActivityList(_activityList => {
      const index = _activityList.findIndex(({ id: _id }) => _id === id);
      if (index < 0) return _activityList;

      const activityList = [..._activityList];
      activityList[index].state = ActivityState.awaitingSubmit;
      return activityList;
    });
    message.success('退回审核活动成功');
  };

  const handleApplyForActivity = async (id: number) => {
    await HttpClient.applyForActivity({ id });
    setActivityList(_activityList => {
      const index = _activityList.findIndex(({ id: _id }) => _id === id);
      if (index < 0) return _activityList;

      const activityList = [..._activityList];
      activityList[index].state = ActivityState.awaitingAudit;
      return activityList;
    });
    message.success('申请审核活动成功');
  };

  const handleAuditRejectActivity = async (id: number) => {
    await HttpClient.auditRejectActivity({ id });
    setActivityList(_list => {
      const index = _list.findIndex(({ id: _id }) => _id === id);
      if (index < 0) return _list;

      const activityList = [..._list];
      activityList[index].state = ActivityState.auditFailed;
      return activityList;
    });
    message.success('审核退回活动成功');
  };

  const handleAuditPassActivity = async (id: number) => {
    await HttpClient.auditPassActivity({ id });
    reload();
    message.success('审核通过活动成功');
  };

  return <>
    {/* filter form */}
    <div className="flex justify-between mb-[12px]">
      <ProForm<FilterForm>
        layout="inline"
        variant="filled"
        formRef={formRef}
        submitter={{ searchConfig: { submitText: '搜索' } }}
        onFinish={handleFilterQuery}
        onReset={handleFilterReset}
      >
        <ProFormSelect label="活动状态" name="state" width="xs" valueEnum={activityStateValueEnumMap} />
        <ProFormText label="活动名称" name="keyword" width="md" fieldProps={{ onPressEnter: formRef.current?.submit }} />
      </ProForm>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/activityForm?operation=append')}>新增活动</Button>
    </div>
    {/* list */}
    <ProList<ActivityPreview>
      loading={loading}
      pagination={paginationConfig}
      grid={{ gutter: { xl: 48, xxl: 72 }, column: 2, xs: 1, sm: 1, md: 1, lg: 1, xl: 3, xxl: 4 }}
      onItem={({ id, state }) => {
        return {
          onClick: () => state >= ActivityState.auditPassed && router.push(`/activityDetail?id=${id}`)
        };
      }}
      metas={{
        title: {
          render: (_, item) => (
            <div className="text-lg flex items-center pl-[12px] font-[700]">{item.name}</div>
          )
        },
        content: {
          render: (_, item) => <>
            <img className="w-[88px] h-[120px] rounded-[8px] object-cover" src={item.coverUrl} />
            <div className="ml-[12px] text-[#666] flex flex-col gap-[8px]">
              <div><ClockCircleFilled className="mr-[4px]" />{`${item.startAt}-${item.endAt}`}</div>
              <div><EnvironmentFilled className="mr-[4px]" />{item.city} {item.address}</div>
              <div>状态：<Tag bordered={false} color={activityStateValueEnumMap.get(item.state)?.status}>{activityStateValueEnumMap.get(item.state)?.text}</Tag></div>
            </div>
          </>
        },
        actions: {
          cardActionProps: 'actions',
          render: (_, item) => {
            if (role === Role.superAdmin)
              return (
                <>
                  {item.state === ActivityState.awaitingAudit
                    && (
                      <>
                        <Button type="link" icon={<CheckOutlined />} onClick={() => handleAuditPassActivity(item.id)}>通过</Button>
                        <Popconfirm title="提示" description="确认审核退回该活动吗" onConfirm={() => handleAuditRejectActivity(item.id)}>
                          <Button type="link" icon={<RollbackOutlined />} danger>退回</Button>
                        </Popconfirm>
                      </>
                    )
                  }
                  {item.state !== ActivityState.awaitingSubmit && <Button type="text" icon={<CopyOutlined />} onClick={() => handleCopyActivity(item.id)}>复制</Button>}
                  <Button type="link" icon={<EditOutlined />} onClick={() => handleModifyActivity(item.id)}>编辑</Button>
                  {
                    [ActivityState.awaitingSubmit, ActivityState.auditFailed, ActivityState.auditPassed].includes(item.state)
                    && (
                      <Popconfirm title="警告" description="该操作不可撤销，确认删除该活动吗" onConfirm={() => handleDeleteActivity(item.id)}>
                        <Button type="link" icon={<DeleteOutlined />} danger>删除</Button>
                      </Popconfirm>
                    )
                  }
                </>
              );

            return (
              <>
                {
                  [ActivityState.awaitingSubmit, ActivityState.auditFailed].includes(item.state)
                  && (
                    <Popconfirm title="提示" description="确认提交该活动的审核申请吗" onConfirm={() => handleApplyForActivity(item.id)}>
                      <Button type="text" icon={<SendOutlined />}>提交审核</Button>
                    </Popconfirm>
                  )
                }
                {item.state === ActivityState.awaitingAudit && (
                  <Popconfirm title="提示" description="确认取消申请审核该活动吗" onConfirm={() => handleCancelApplication(item.id)}>
                    <Button type="link" icon={<RollbackOutlined />} danger>取消申请</Button>
                  </Popconfirm>
                )}
                {item.state >= ActivityState.auditPassed && <Button type="text" icon={<CopyOutlined />} onClick={() => handleCopyActivity(item.id)}>复制</Button>}
                {item.state !== ActivityState.finished && <Button type="link" icon={<EditOutlined />} onClick={() => handleModifyActivity(item.id)}>编辑</Button>}
                {
                  [ActivityState.awaitingSubmit, ActivityState.auditFailed, ActivityState.auditPassed].includes(item.state)
                  && (
                    <Popconfirm title="警告" description="该操作不可撤销，确认删除该活动吗" onConfirm={() => handleDeleteActivity(item.id)}>
                      <Button type="link" icon={<DeleteOutlined />} danger>删除</Button>
                    </Popconfirm>
                  )
                }
              </>
            );
          }
        }
      }}
      itemCardProps={{
        bodyStyle: { paddingTop: 0 },
      }}
      dataSource={activityList}
    />
  </>;
};

const ActivitiesPage = () => (
  <Suspense fallback={<ProSkeleton type="list" />}>
    <ActivityList />
  </Suspense>
);

export default ActivitiesPage;