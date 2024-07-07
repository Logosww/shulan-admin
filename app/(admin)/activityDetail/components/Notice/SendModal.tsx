import { useRef } from 'react';
import { Form } from 'antd';
import { ModalForm, ProFormItem, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { HttpClient } from '@/utils';
import { Editor } from '@/components';
import { useMessage } from '@/hooks';

import type { Value } from '@udecode/plate-common';
import type { EditorRef } from '@/components';
import type { INoticeRecord } from '@/utils/http/api-types';

export type NoticeTargetType = Pick<INoticeRecord, 'id' | 'name' | 'phone' | 'activityWork'> | null;

interface ISendModalProps {
  id: number;
  open: boolean;
  target: NoticeTargetType;
  workList: { value: number; label: string; }[];
  onOpenChange: (open: boolean) => void;
  reloadTable: () => Promise<void>;
};

const SendModal = ({ id, open, target, workList, onOpenChange, reloadTable }: ISendModalProps) => {
  const editorRef = useRef<EditorRef>(null);
  const message = useMessage();
  const [form] = Form.useForm();

  const handleSubmit = async ({ title, activityWorkId }: { title: string; activityWorkId: number }) => {
    if(!editorRef.current) return;

    let doSend: Promise<void>;
    const rawContent = JSON.stringify(editorRef.current.getRawValue()!);
    const htmlContent = editorRef.current.generateHTML()!;
    const noticeForm = { title, rawContent, htmlContent };
    doSend = target
      ? HttpClient.sendNoticeToSingle({ id: target.id, ...noticeForm })
      : HttpClient.sendNoticeToAll({ activityId: id, activityWorkId, ...noticeForm  });
    return doSend.then(() => { message.success('通知下发成功') }).then(reloadTable).then(() => true);
  };

  return (
    <ModalForm<{ title: string; activityWorkId: number }>
      title="消息通知"
      variant="filled"
      validateTrigger="submit"
      width={500}
      open={open}
      form={form}
      modalProps={{ centered: true }}
      submitter={{ searchConfig: { submitText: '发送' }}}
      onFinish={handleSubmit}
      onOpenChange={open => {
        if(open && target) HttpClient.getNoticeContent({ id: target.id }).then(({ title, rawContent }) => {
          form.setFieldValue('title', title);
          editorRef.current?.setRawValue(JSON.parse(rawContent) as Value);
        });
        else setTimeout(() => form.resetFields());
        onOpenChange(open);
      }}
    >
      <ProFormItem
        label="发送给"
        initialValue={`${target?.name} - ${target?.phone} - ${target?.activityWork.label}`}
        hidden={!target}
      >
        {`${target?.name} - ${target?.phone} - ${target?.activityWork.label}`}
      </ProFormItem>
      <ProFormSelect<number, { label: string, value: number }>
        name="activityWorkId"
        label="发送给"
        width="sm"
        options={workList}
        hidden={!!target}
        rules={[{ required: !target, message: '请选择要通知的工作岗位' }]}
      />
      <ProFormText name="title" label="标题" rules={[ { required: true, message: '请输入消息通知标题' }]} />
      <ProFormItem
        name="content"
        label="内容"
        rules={[{
          validator: () => {
            const isEmpty = !(editorRef.current && editorRef.current.getRawValue()![0].children[0].text);

            return isEmpty ? Promise.reject(new Error('请输入消息通知内容')) : Promise.resolve();
          }
        }]}
      >
        <Editor ref={editorRef} />
      </ProFormItem>
    </ModalForm>
  );
};

export default SendModal;