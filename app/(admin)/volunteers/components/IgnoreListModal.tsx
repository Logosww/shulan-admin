'use client';

import { Button } from 'antd';
import { HttpClient } from '@/utils/http';
import { VolunteerWhitelistState } from '@/constants/value-enum';
import { ProFormText, ProFormGroup } from '@ant-design/pro-components';
import BatchWhitelistStateModal from './BatchWhitelistStateModal';

import type { IBatchWhitelistStateModalProps } from './BatchWhitelistStateModal';

export const IgnoreListModal = ({ reloadTable }: Pick<IBatchWhitelistStateModalProps, 'reloadTable'>) => (
  <BatchWhitelistStateModal<{ reason: string }>
    title="黑名单管理"
    trigger={<Button type="primary">黑名单管理</Button>}
    whitelistState={VolunteerWhitelistState.forbidden}
    reloadTable={reloadTable}
    batchRequest={({ ids, form }) => HttpClient.batchIgnoreVolunteer({ ids, ...form })}
  >
    <ProFormGroup> 
      <ProFormText label="拉黑原因" name="reason" width="md" rules={[{ required: true, message: '请输入拉黑原因' }]} />
    </ProFormGroup>
  </BatchWhitelistStateModal>
);

export default IgnoreListModal;