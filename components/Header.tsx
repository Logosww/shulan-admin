'use client';

import { useEffect, useState } from 'react';
import { Avatar } from '@/components';
import { Layout, Button, Drawer, Form, Flex } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { SettingOutlined } from '@ant-design/icons';
import { ProFormDigit, ProForm } from '@ant-design/pro-components';
import { Notification } from './Notification';
import { ThemeToggle } from './ThemeToggle';
import useStore from '@/store';
import { Role } from '@/constants';
import { HttpClient } from '@/utils';
import { useMessage } from '@/hooks';


import type { ISettingForm } from '@/utils/http/api-types';

const { Header: AHeader } = Layout;

export interface IHeaderProps {
  backgroundColor: string;
  collapsed: boolean;
  onCollapse: () => void;
};

export const SettingsDrawer = ({ open, onOpenChange }: { open: boolean, onOpenChange: (val: boolean) => void }) => {

  const [isLoading, setIsLoading] = useState(true);
  const message = useMessage();
  const [form] = Form.useForm();

  const handleSubmit = async (form: ISettingForm) => {
    await HttpClient.modifySystemSettings(form);
    onOpenChange(false);
    message.success('更新成功');
  };

  useEffect(() => {
    open && HttpClient.getSystemSettings().then(formData => {
      form.setFieldsValue(formData);
      setTimeout(() => setIsLoading(false), 600);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Drawer
      title="系统设置"
      width={300}
      open={open}
      loading={isLoading}
      onClose={() => onOpenChange(false)}
      footer={
        <Flex justify="flex-end" gap={8}>
          <Button onClick={() => onOpenChange(false)}>取消</Button>
          <Button type="primary" htmlType="submit" onClick={form.submit}>确认</Button>
        </Flex>
      }
    >
      <ProForm<ISettingForm>
        variant="filled"
        form={form}
        submitter={false}
        onFinish={handleSubmit}
      >
        <ProFormDigit label="活动取消报名上限（次）" name="activityCancelCountLimit" width="xs" rules={[{ required: true }]} />
        <ProFormDigit label="志愿者违规上限（次）" name="violateCountLimit" width="xs" rules={[{ required: true }]} />
        <ProFormDigit label="白名单默认时长（月）" name="whiteExpire" width="xs" rules={[{ required: true }]} />
        <ProFormDigit label="封禁默认时长（月）" name="violateExpire" width="xs" rules={[{ required: true }]} />
      </ProForm>
    </Drawer>
  );
};

export const Header = ({
  backgroundColor,
  collapsed,
  onCollapse
}: IHeaderProps) => {
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const role = useStore(state => state.role);

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
      <div className='flex items-center gap-[12px]'>
        <ThemeToggle />
        <Notification />
        {role === Role.superAdmin && (
          <>
            <SettingsDrawer open={settingsModalOpen} onOpenChange={setSettingsModalOpen} />
            <Button type="text" style={{ marginInlineEnd: 16 }} icon={<SettingOutlined />} onClick={() => setSettingsModalOpen(true)} />
          </>
        )}
        <Avatar />
      </div>
    </AHeader>
  )
};