'use client';

import { Button } from 'antd';
import { HttpClient } from '@/utils/http';
import { VolunteerWhitelistState } from '@/constants/value-enum';
import { ProFormDigit, ProFormGroup } from '@ant-design/pro-components';
import BatchWhitelistStateModal from './BatchWhitelistStateModal';

import type { IBatchWhitelistStateModalProps } from './BatchWhitelistStateModal';
import type { NullableFilter } from '@/utils/http/api-types';

export const ForbbidenListModal = ({ reloadTable }: Pick<IBatchWhitelistStateModalProps, 'reloadTable'>) => (
  <BatchWhitelistStateModal<NullableFilter<{ releaseAt: string }>>
    title="封禁管理"
    trigger={<Button ghost danger>封禁管理</Button>}
    whitelistState={VolunteerWhitelistState.forbidden}
    reloadTable={reloadTable}
    formTransform={form => ({ releaseAt: form.releaseAt ?? null })}
    batchRequest={({ ids, form }) => HttpClient.batchForbidVolunteer({ ids, ...form })}
  >
    <ProFormGroup> 
      <ProFormDigit label="封禁时长" name="releaseAt" width="xs" placeholder="单位：月" min={1} />
    </ProFormGroup>
  </BatchWhitelistStateModal>
);

export default ForbbidenListModal;