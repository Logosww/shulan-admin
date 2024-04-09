
import { useState } from 'react';
import { Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { ModalForm, ProFormGroup, ProFormDigit } from '@ant-design/pro-components';

import type { ISettingForm } from '@/utils/http/api-types';

export const SettingsModal = () => {

  const [isModifying, setIsModifying] = useState(false);
  return (
    <>
      <ModalForm<ISettingForm>
        variant="filled"
        submitter={
          isModifying 
            ? { searchConfig: { resetText: '取消' } }
            : false
        }
        onReset={() => setIsModifying(false)}
        readonly={!isModifying}
      >
        <ProFormGroup>
          <ProFormDigit label="活动取消报名上限" rules={[{ required: true }]} />
          <ProFormDigit label="志愿者违规上限" rules={[{ required: true }]} />
        </ProFormGroup>
        <ProFormGroup>
          <ProFormDigit label="白名单默认时长" rules={[{ required: true }]} />
          <ProFormDigit label="封禁默认时长" rules={[{ required: true }]} />
        </ProFormGroup>
      </ModalForm>
      {!isModifying &&<Button type="primary" icon={<EditOutlined />} onClick={() => setIsModifying(true)}>编辑</Button>}
    </>
  );
};