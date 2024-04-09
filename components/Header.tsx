'use client';

import { useContext, useEffect, useState } from 'react';
import { Avatar, UserRoleContext } from '@/components';
import { Layout, Button, Switch, Modal, Form } from 'antd';
import { useDarkMode } from 'usehooks-ts';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { EditOutlined, SettingOutlined } from '@ant-design/icons';
import { Icon } from '@iconify/react';
import sunLow from '@iconify/icons-tabler/sun-low';
import moon from '@iconify/icons-tabler/moon';
import { ProFormDigit, ProForm } from '@ant-design/pro-components';


import type { ISettingForm } from '@/utils/http/api-types';
import { Role } from '@/constants';
import { HttpClient } from '@/utils';
import { useMessage } from '@/hooks';

const { Header: AHeader } = Layout;

export interface IHeaderProps {
  backgroundColor: string;
  collapsed: boolean;
  onCollapse: () => void;
};

export const SettingsModal = ({ open, onOpenChange }: { open: boolean, onOpenChange: (val: boolean) => void }) => {

  const message = useMessage();
  const [form] = Form.useForm();
  const [isModifying, setIsModifying] = useState(false);

  const handleSubmit = async (form: ISettingForm) => {
    await HttpClient.modifySystemSettings(form);
    onOpenChange(false);
    message.success('更新成功');
  };

  useEffect(() => {
    open && HttpClient.getSystemSettings().then(formData => form.setFieldsValue(formData));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Modal
      title="系统设置"
      width={420}
      open={open}
      onCancel={() => onOpenChange(false)}
      afterClose={() => setIsModifying(false)}
      footer={
        isModifying
          ? (
            <>
              <Button onClick={() => { form.resetFields(), setIsModifying(false) }}>取消</Button>
              <Button type="primary" htmlType="submit" onClick={form.submit}>确定</Button>
            </>
          )
          : <Button type="primary" icon={<EditOutlined />} onClick={() => setIsModifying(true)}>编辑</Button>
      }
      centered
    >
      <ProForm<ISettingForm> 
        variant="filled"
        form={form}
        submitter={false}
        readonly={!isModifying}
        onFinish={handleSubmit}
      >
        <ProForm.Group>
          <ProFormDigit label="活动取消报名上限（次）" name="activityCancelCountLimit" width="xs" rules={[{ required: true }]} />
          <ProFormDigit label="志愿者违规上限（次）" name="violateCountLimit" width="xs" rules={[{ required: true }]} />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormDigit label="白名单默认时长（月）" name="whiteExpire" width="xs" rules={[{ required: true }]} />
          <ProFormDigit label="封禁默认时长（月）" name="violateExpire" width="xs" rules={[{ required: true }]} />
        </ProForm.Group>
      </ProForm>
    </Modal>
  );
};

export const Header = ({
  backgroundColor,
  collapsed,
  onCollapse
}: IHeaderProps) => {
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const { toggle } = useDarkMode();
  const [role] = useContext(UserRoleContext)!;
  
  return (
    <AHeader style={{ 
        paddingLeft: 0,
        paddingRight: 24,
        marginBottom: 12,
        background: backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onCollapse}
        style={{
          fontSize: '16px',
          width: 64,
          height: 64,
        }}
      />
      <div className='flex items-center'>
        <Switch
          style={{ marginInlineEnd: 16 }}
          checkedChildren={<Icon width={14} height={22} icon={moon} />}
          unCheckedChildren={<Icon width={14} height={22} icon={sunLow} />}
          onChange={toggle}
        />
        { role === Role.superAdmin && (
          <>
            <SettingsModal open={settingsModalOpen} onOpenChange={setSettingsModalOpen} />
            <Button type="text" style={{ marginInlineEnd: 16 }} icon={<SettingOutlined />} onClick={() => setSettingsModalOpen(true)} />
          </>
        )}
        <Avatar />
      </div>
    </AHeader>
  )
};