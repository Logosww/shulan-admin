import { useEffect, useState } from 'react';
import { Button, Form, Input, Skeleton, Typography } from 'antd';
import { ModalForm, ProFormDigit, ProFormText } from '@ant-design/pro-components';
import { useCountdown } from 'usehooks-ts';
import { useMessage } from '@/hooks';
import { HttpClient } from '@/utils';

import type { IPaymentPreview, IPayrollRecord } from '@/utils/http/api-types';

type FormData = { 
  title: string;
  remark: string;
  smsCode: string;
  phone?: string;
  money?: number;
  target?: PaymentTarget;
};
export type PaymentTarget = Pick<
  IPayrollRecord, 
  | 'id'
  | 'name'
  | 'phone'
  | 'activityWork'
  | 'shouldTransferMoney'
  | 'actualTransferMoney'
> | null;

interface IPaymentModalProps {
  open: boolean;
  activityId: number;
  target: PaymentTarget;
  onOpenChange: (open: boolean) => void;
  reloadTable: () => Promise<void>;
};

const PaymentToAllPreview = ({ id }: { id: number }) => {
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [preview, setPreview] = useState<IPaymentPreview>();

  useEffect(() => {
    HttpClient.getPaymentToAllPreview({ id }).then(preview => setTimeout(() => {
      setPreview(preview);
      setIsLoadingPreview(false);
    }, 600));
  }, [id]);

  return (
    <Skeleton title={false} paragraph={{ rows: 3 }} loading={isLoadingPreview} active>
      <Typography.Text>{
        `此次打款总人数 ${preview?.totalNumber} 人，总金额 ${[preview?.totalMoney]} 元，其中：`
      }</Typography.Text>
      {
        preview?.workPreviewVo.map(({ name, localNumber: number, localMoney: money }, index) => 
          <div key={index}><Typography.Text>{`-- ${name} ${number} 人， 总计 ${money} 元`}</Typography.Text></div>)
      }
      {preview?.tips && <div><Typography.Text type="warning">注意：{preview.tips}</Typography.Text></div>}
    </Skeleton>
  );
};

const PaymentModal = ({ open, activityId, target, onOpenChange, reloadTable }: IPaymentModalProps) => {

  const [isCodeSent, setIsCodeSent] = useState(false);
  const message = useMessage();
  const [form] = Form.useForm();
  const phone = Form.useWatch('phone', form);
  const [count, { startCountdown, resetCountdown }] = useCountdown({ countStart: 60 });

  const handleSendCode = async () => {
    if(!phone) return;
    if(!/^(13[0-9]|14[5-9]|15[0-3,5-9]|16[6]|17[0-8]|18[0-9]|19[0-9])\d{8}$/.test(phone))
      return message.error({ content: '无效的手机号' });

    await HttpClient.sendPaymentVerifySmsCode({ purePhoneNumber: phone });
    setIsCodeSent(true);
    startCountdown();
    message.success({ content: '验证码发送成功' });
  };

  const handleDoPayment = async (form: FormData) => {
    let doPayment: Promise<boolean>;
    delete form.target, delete form.phone;
    if(target) {
      const { id } = target;
      doPayment = HttpClient.doPaymentToSingle({ 
        id,
        money: form.money!,
        title: form.title,
        remark: form.remark,
        smsCode: form.smsCode,
      }).then(() => {message.success('打款成功')}).then(reloadTable).then(() => true);
    } else {
      delete form.money;
      doPayment = HttpClient.doPaymentToAll({ id: activityId, ...form }).then(() => {message.success('打款成功')}).then(reloadTable).then(() => true);
    }
    return doPayment;
  };

  useEffect(() => {
    if(count === 0) {
      setIsCodeSent(false);
      resetCountdown();
    }
  }, [count, resetCountdown]);

  return (
    <ModalForm<FormData>
      width={360}
      open={open}
      form={form}
      title={target ? '单独打款' : '一键打款'}
      modalProps={{ centered: true, destroyOnClose: true }}
      onOpenChange={onOpenChange}
      onFinish={handleDoPayment}
    >
      {
        target
          ? (
            <>
              <ProFormText 
                width="md"
                name="target"
                label="打款给"
                initialValue={`${target.name} - ${target.phone} - ${target.activityWork.label}`}
                readonly
              />
              <ProFormDigit
                name="money"
                label="金额"
                tooltip="由于微信打款平台限制，酬金单次打款上限为 500 元"
                width={128}
                max={500}
                disabled={!target}
                initialValue={(target.shouldTransferMoney - target.actualTransferMoney) > 0 ? (target.shouldTransferMoney - target.actualTransferMoney) : target.shouldTransferMoney}
                rules={[{ required: true, message: '金额不能为空' }]}
              />
            </>
          )
          : (
            <>
              <ProFormText 
                width="md"
                name="target"
                label="打款给"
                initialValue="全体已完成志愿者"
                readonly
              />
              <Form.Item name="money" label="金额">
                <PaymentToAllPreview id={activityId} />
              </Form.Item>
            </>
          )
      }
      <ProFormText name="title" label="标题" width="md" rules={[{ required: true, message: '标题不能为空' }]} />
      <ProFormText name="remark" label="备注" width="md" />
      <Form.Item name="phone" label="手机号" tooltip="打款属于敏感操作，需要负责人手机验证码验证">
        <Input.Search
          maxLength={11}
          enterButton={
            <Button type="primary" ghost disabled={isCodeSent || !phone} onClick={handleSendCode}>
              { isCodeSent ? `${count} 获取验证码` : '获取验证码' }
            </Button>
          }
        />
      </Form.Item>
      <ProFormText name="smsCode" label="验证码" width="xs" rules={[{ required: true, message: '请输入验证码' }]} />
    </ModalForm>
  );
};

export default PaymentModal;