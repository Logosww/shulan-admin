'use client';

import { useEffect, useState } from 'react';
import { Form, Input, Button, Flex, ConfigProvider } from 'antd';
import { MobileOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useMessage, useNotification } from '@/hooks';
import { defaultTheme } from '@/theme/config';
import { HttpClient } from '@/utils/http';
import { useCountdown } from 'usehooks-ts';
import useStore from '@/store';

import type { ILoginForm } from '@/utils/http/api-types';

const LoginPage = () => {

  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();
  const phone = Form.useWatch('phone', form) as string;
  const router = useRouter();
  const message = useMessage();
  const notification = useNotification();
  const [count, { startCountdown, resetCountdown }] = useCountdown({ countStart: 60 });
  const login = useStore(state => state.login);
  const setRole = useStore(state => state.setRole);

  useEffect(() => {
    if(count === 0) {
      setIsCodeSent(false);
      resetCountdown();
    }
  }, [count, resetCountdown]);

  const handleFinish = async (form: ILoginForm) => {
    setIsSubmitting(true);
    const { role } = await HttpClient.login(form).finally(() => setIsSubmitting(false));
    login();
    setRole(role);
    notification.success({ message: '登录成功' });
    router.push('/');
  };

  const handleSendCode = async () => {
    if(!phone) return;
    if(!/^(13[0-9]|14[5-9]|15[0-3,5-9]|16[6]|17[0-8]|18[0-9]|19[0-9])\d{8}$/.test(phone))
      return message.error({ content: '无效的手机号' });

    await HttpClient.sendSmsCode(phone);
    setIsCodeSent(true);
    startCountdown();
    message.success({ content: '验证码发送成功' });
  };

  return (
    <ConfigProvider theme={defaultTheme}>
      <div className="absolute w-full h-full flex items-center justify-center bg-slate-100">
        <div className="relative w-[420px] py-[32px] px-[56px] bg-white border rounded-2xl border-slate-100 shadow">
          <div className='flex justify-center mb-[16px]'>
            <img src="/image/logo.png" alt="logo" width={119} height={80} decoding='async' />
          </div>
          <Form name="login" form={form} onFinish={handleFinish}>
            <Form.Item
              name="phone"
              rules={[{ required: true, message: '请输入手机号' }]}
            >
              <Input prefix={<MobileOutlined />} size="large" placeholder="手机号" maxLength={11} />
            </Form.Item>
            <Form.Item
              name="code"
              rules={[{ required: true, message: '请输入验证码' }]}
            >
              <Flex justify='space-between' gap={8}>
                <Input prefix={<LockOutlined />} size="large" placeholder="验证码" />
                <Button size="large" disabled={isCodeSent || !phone} onClick={handleSendCode}>
                  { isCodeSent ? `${count} 获取验证码` : '获取验证码' }
                </Button>
              </Flex>
            </Form.Item>
            <Button className="mb-[8px]" size="large" type="primary" htmlType="submit" loading={isSubmitting} block>
              登录
            </Button>
          </Form>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default LoginPage;