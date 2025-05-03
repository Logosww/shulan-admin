import { Tooltip } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { HttpClient } from '@/utils/http';
import { PayrollAPIState, payrollAPIStateValueEnumMap } from '@/constants';

import type { IPayrollDetail } from '@/utils/http/api-types';

const HistoryCard = ({ id }: { id: number }) => (
  <ProTable<IPayrollDetail>
    headerTitle="转账明细"
    search={false}
    pagination={false}
    toolbar={{ actions: [], settings: [] }}
    params={{ id }}
    request={params => HttpClient.getPayrollDetails(params as { id: number }).then(data => ({ data, success: true }))}
    columns={[
      {
        dataIndex: 'outDetailNo',
        title: '批次订单号',
        valueType: 'text',
        copyable: true,
      },
      {
        dataIndex: 'transferAmount',
        title: '转账金额',
        valueType: 'money',
      },
      {
        dataIndex: 'transferRemark',
        title: '转账备注',
        valueType: 'text',
      },
      {
        dataIndex: 'detailStatus',
        title: '订单状态',
        renderText: (_, { detailStatus: state, failReason }) => (
          <>
            <div className="inline-block mr-[4px]">{payrollAPIStateValueEnumMap.get(state)!}</div>
            {
              state === PayrollAPIState.fail 
              && (
                <Tooltip title={`失败原因：${failReason}`}>
                  <QuestionCircleOutlined />
                </Tooltip>
              )
            }
          </>
        )
      },
      {
        dataIndex: 'transferorName',
        title: '操作人',
      },
      {
        dataIndex: 'transferAt',
        title: '转账时间',
        valueType: 'dateTime',
      },
    ]}
  />
);

export default HistoryCard;