'use client';

import { Button } from 'antd';
import { HttpClient } from '@/utils/http';
import { VolunteerWhitelistState } from '@/constants/value-enum';
import { ProFormDigit, ProFormGroup } from '@ant-design/pro-components';
import BatchWhitelistStateDrawer from './BatchWhitelistStateDrawer';

import type { IBatchWhitelistStateDrawerProps } from './BatchWhitelistStateDrawer';
import type { NullableFilter } from '@/utils/http/api-types';

export const WhitelistDrawer = ({ reloadTable }: Pick<IBatchWhitelistStateDrawerProps, 'reloadTable'>) => (
  <BatchWhitelistStateDrawer<NullableFilter<{ expireAt: string }>>
    title="白名单管理"
    trigger={<Button>白名单管理</Button>}
    whitelistState={VolunteerWhitelistState.whitelist}
    reloadTable={reloadTable}
    formTransform={form => ({ expireAt: form.expireAt ?? null })}
    batchRequest={({ ids, form }) => HttpClient.batchAddonVolunteerWhitelist({ ids, ...form })}
  >
    <ProFormGroup> 
      <ProFormDigit label="白名单时长" name="expireAt" width="xs" placeholder="单位：月" min={1} />
    </ProFormGroup>
  </BatchWhitelistStateDrawer>
);

export default WhitelistDrawer;