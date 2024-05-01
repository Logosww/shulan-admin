'use client';

import { Role, genderValueEnum } from '@/constants';
import { HttpClient } from '@/utils';
import { IUserProfile } from '@/utils/http/api-types';
import { LockOutlined, LogoutOutlined, ProfileOutlined, UserOutlined } from '@ant-design/icons';
import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { Avatar as _Avatar, Button, Dropdown, Flex, Form, Input, Space } from 'antd';
import { theme } from 'antd';
import { useContext, useEffect, useRef, useState } from 'react';
import { useMessage, useNotification } from '@/hooks';
import { useRouter } from 'next/navigation';
import { IsLoginContext, UserRoleContext } from '.';
import { useCountdown } from 'usehooks-ts';
import Cookies from 'js-cookie';

import type { MenuProps } from 'antd';

export const Avatar = () => {
  
  const phoneUpdateCount = useRef(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [codeModalOpen, setCodeModalOpen] = useState(false);

  const router = useRouter();
  const message = useMessage();
  const [form] = Form.useForm();
  const [codeForm] = Form.useForm();
  const notification = useNotification();
  const [_, setRole] = useContext(UserRoleContext)!;
  const [__, setIsLogin] = useContext(IsLoginContext)!;
  const { token: { colorPrimary } } = theme.useToken();
  const phone = Form.useWatch('purePhoneNumber', codeForm) as string;
  const [count, { startCountdown, resetCountdown }] = useCountdown({ countStart: 60 });

  const menuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <ProfileOutlined/>,
      label: '查看资料',
      onClick: () => setModalOpen(true),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: async () => {
        await HttpClient.logout();
        setIsLogin(false);
        setRole(Role.user);
        Cookies.remove('Authorization');
        Cookies.remove('Role');
        notification.success({ message: '登出成功' });
        router.push('/login');
      }
    }
  ];

  const handleModifyProfile = async (form: Pick<IUserProfile, 'name' | 'sex' | 'desensitizedPhone'>) => {
    const { name, sex } = form;
    await HttpClient.modifyUserProfile({ name, sex });
    message.success('修改资料成功');
    return true;
  };

  const handleSendCode = async () => {
    const isValid = await codeForm.validateFields(['purePhoneNumber']);
    if(!isValid) return;

    await HttpClient.sendSmsCodeWithoutCheck(phone);
    setIsCodeSent(true);
    startCountdown();
    message.success({ content: '验证码发送成功' });
  };

  const handleCodeSubmit = async (form: { purePhoneNumber: string; code: string; }) => {
    await HttpClient.updatePhoneNumber({ phone: form.purePhoneNumber, code: form.code });
    phoneUpdateCount.current++;
    message.success('换绑成功');
    setCodeModalOpen(false);
  };

  useEffect(() => {
    if(count === 0) {
      setIsCodeSent(false);
      resetCountdown();
    }
  }, [count, resetCountdown]);

  return (
    <>
      <Dropdown menu={{ items: menuItems }}>
        <_Avatar
          className='cursor-pointer'
          shape='circle'
          size={36}
          style={{ backgroundColor: colorPrimary }}
          icon={<UserOutlined/>}
        />
      </Dropdown>
      <ModalForm<IUserProfile> 
        title="个人资料"
        variant="filled"
        width={400}
        form={form}
        open={modalOpen}
        requiredMark={false}
        validateTrigger="onSubmit"
        modalProps={{ centered: true, forceRender: true }}
        submitter={{ 
          searchConfig: { submitText: '保存' },
        }}
        onOpenChange={setModalOpen}
        request={HttpClient.getUserProfile}
        params={{ count: phoneUpdateCount.current }}
        onFinish={handleModifyProfile}
      >
        <ProFormText label="姓名" name="name" width="xs" rules={[{ required: true }]} />
        <ProFormSelect label="性别" name="sex" width="xs" valueEnum={genderValueEnum} rules={[{ required: true }]} />
        <Form.Item label="手机号">
          <Space>
            <Form.Item name="desensitizedPhone" noStyle>
              <Input readOnly />
            </Form.Item>
            <Button type="link" onClick={() => setCodeModalOpen(true)}>换绑</Button>
          </Space>
        </Form.Item>
      </ModalForm>
      <ModalForm 
        width={300}
        variant="filled"
        form={codeForm}
        open={codeModalOpen}
        onOpenChange={setCodeModalOpen}
        onFinish={handleCodeSubmit}
        modalProps={{ afterClose: () => codeForm.resetFields() }}
       >
        <ProFormText 
          label="手机号"
          name="purePhoneNumber"
          rules={[
            { required: true, message: '手机号不能为空' },
            {
              validateTrigger: 'blur',
              validator: async (_, value) => {
                if(/^(13[0-9]|14[5-9]|15[0-3,5-9]|16[6]|17[0-8]|18[0-9]|19[8,9])\d{8}$/.test(value)) return Promise.resolve();
                else return Promise.reject(new Error('无效的手机号'));
              }
            }
          ]}
         />
        <Form.Item label="验证码" name="code" rules={[{ required: true, message: '验证码不能为空' }]}>
          <Flex justify='space-between' gap={8}>
            <Input prefix={<LockOutlined />} />
            <Button type="primary" disabled={isCodeSent || !phone} onClick={handleSendCode}>
              { isCodeSent ? `${count} 获取验证码` : '获取验证码' }
            </Button>
          </Flex>
        </Form.Item>
      </ModalForm>
    </>
  );
};