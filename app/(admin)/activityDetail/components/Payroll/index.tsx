import { useState } from 'react';
import { Button, Popover, Tag } from 'antd';
import { DownloadOutlined, EyeOutlined, PayCircleOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { HttpClient } from '@/utils/http';
import { useCOS, useMessage, usePagingAndQuery } from '@/hooks';
import {
  PayrollState, 
  payrollStateValueEnumMap,
  VolunteerType,
  volunteerTypeValueEnumMap, 
} from '@/constants';
import PaymentModal from './PaymentModal';
import HistoryCard from './HistoryCard';

import type { IPayrollRecord } from '@/utils/http/api-types';
import type { PaymentTarget } from './PaymentModal';

type FilterForm = {
  id: number;
  name: string;
  phone: string;
  activityWorkId: number;
  wxmpUserTransferOrderState: PayrollState;
  activityWorkVolunteerIdentity: VolunteerType;
};

export const Payroll = ({ id }: { id: number }) => {

  const [modalOpen, setModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<PaymentTarget>(null);
  const message = useMessage();
  const { download } = useCOS();
  const {
    reload: reloadTable,
    state: {
      paginationConfig,
      loading: [loading],
      dataSource: [checkinRecordList],
    },
    handler: {
      handleFilterQuery,
      handleFilterReset,
    }
  } = usePagingAndQuery<IPayrollRecord, FilterForm>({
    pagingRequest: form => HttpClient.getPagingPayrollRecords({ ...form, activityId: id }),
    queryRequest: form => HttpClient.filterPayrollRecords({ ...form, activityId: id }),
    filterFormTransform: (form) => ({
      name: form.name ?? null,
      phone: form.phone ?? null,
      activityWorkId: form.activityWorkId ?? null,
      id: form.id ? parseInt(form.id as unknown as string) : null,
      wxmpUserTransferOrderState: form.wxmpUserTransferOrderState ?? null,
      activityWorkVolunteerIdentity: form.activityWorkVolunteerIdentity ?? null,
    }),
  });

  const handleDoPaymentSingle = (record: IPayrollRecord) => {
    const target: PaymentTarget = {
      id: record.id,
      name: record.name,
      phone: record.phone,
      activityWork: record.activityWork,
      shouldTransferMoney: record.shouldTransferMoney,
      actualTransferMoney: record.actualTransferMoney,
    };
    setPaymentTarget(target);
    setModalOpen(true);
  };

  const handleExportRecords = async () => {
    setIsExporting(true);
    const key = await HttpClient.exportPayrollRecords({ id });
    await download(key);
    message.success('导出成功');
    setIsExporting(false);
  };

  return (<>
    <ProTable<IPayrollRecord, FilterForm>
      rowKey='id'
      loading={loading}
      dataSource={checkinRecordList}
      pagination={paginationConfig}
      form={{ variant: 'filled', ignoreRules: false }}
      search={{ span: 5, defaultCollapsed: false }}
      toolbar={{
        actions: [
          <Button 
            key="export"
            type="text" 
            loading={isExporting}
            icon={<DownloadOutlined />}
            onClick={handleExportRecords}
          >
            导出报表
          </Button>,
          <Button
            key="doPaymentBatch"
            type="primary"
            icon={<PayCircleOutlined />}
            onClick={() => {setPaymentTarget(null), setModalOpen(true)}}
          >
            一键打款
          </Button>
        ]
      }}
      onReset={handleFilterReset}
      onSubmit={handleFilterQuery}
      columns={[
        {
          title: '编号',
          key: 'id',
          dataIndex: 'id',
          valueType: 'text',
          formItemProps: {
            rules: [{
              validateTrigger: 'submit',
              validator: (_, value) => !value || /^(\d?)+$/.test(value) ? Promise.resolve() : Promise.reject(new Error('编号需为纯数字')),
            }],
          },
        },
        {
          title: '姓名',
          dataIndex: 'name',
          valueType: 'text',
        },
        {
          title: '手机号',
          dataIndex: 'phone',
          valueType: 'text',
        },
        {
          title: '志愿者类型',
          dataIndex: 'activityWorkVolunteerIdentity',
          valueType: 'select',
          valueEnum: volunteerTypeValueEnumMap,
          renderText: (_, { activityWorkVolunteerIdentity: volunteerType }) =>
            <Tag bordered={false} color={volunteerTypeValueEnumMap.get(volunteerType)?.status}>{volunteerTypeValueEnumMap.get(volunteerType)?.text}</Tag>,
        },
        {
          title: '报名岗位',
          dataIndex: ['workVo', 'name'],
          valueType: 'text',
          hideInSearch: true,
          renderText: (_, { activityWork: { label } }) => label,
        },
        {
          title: '报名岗位',
          key: 'activityWorkId',
          valueType: 'select',
          hideInTable: true,
          request: () => HttpClient.getActivityWorks({ id }).then(works => works.map(({ id, label }) => ({ label, value: id }))),
        },
        {
          title: '应得酬金',
          dataIndex: 'shouldTransferMoney',
          valueType: 'money',
          hideInSearch: true,
        },
        {
          title: '实际酬金',
          dataIndex: 'actualTransferMoney',
          valueType: 'money',
          hideInSearch: true,
        },
        {
          title: '状态',
          dataIndex: 'wxmpUserTransferOrderState',
          valueType: 'select',
          valueEnum: payrollStateValueEnumMap,
        },
        {
          title: '操作',
          key: 'option',
          valueType: 'option',
          align: 'center',
          width: 180,
          renderText: (_, record) => (
            <>
              <Popover
                trigger="click"
                placement="right"
                content={<HistoryCard id={record.id} />}
              >
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  disabled={record.wxmpUserTransferOrderState === PayrollState.unpaid}
                >
                  详情
                </Button>
              </Popover>
              <Button
                type="link"
                icon={<PayCircleOutlined />}
                onClick={() => handleDoPaymentSingle(record)}
              >
                打款
              </Button>
            </>
          )
        }
      ]}
    >
    </ProTable>
    <PaymentModal
      activityId={id}
      open={modalOpen}
      target={paymentTarget}
      onOpenChange={setModalOpen}
      reloadTable={reloadTable}
    />
  </>);
};

export default Payroll;