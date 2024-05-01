'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Empty, Form, Popconfirm } from 'antd';
import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { CoverUploader } from '@/components';
import { useMessage } from '@/hooks';
import { HttpClient } from '@/utils';
import Meta from 'antd/es/card/Meta';

import type { ICertificate } from '@/utils/http/api-types';

type CertificateForm = Omit<ICertificate, 'coverUrl'> & { coverPath: string };

export const CertificateModal = ({ open, initialValues, onOpenChange, onFinish }: { 
  open: boolean;
  initialValues?: ICertificate;
  onFinish: () => Promise<any>;
  onOpenChange: (open: boolean) => void;
}) => {
  const message = useMessage();

  const handleSubmit = async (_form: ICertificate) => {
    const form: Record<string, any> = {..._form};
    form['coverPath'] = URL.canParse(_form.coverUrl) ? new URL(_form.coverUrl).pathname.slice(1) : _form.coverUrl;;
    delete form.coverUrl;
    await HttpClient.modifyActivityCertificate(form as CertificateForm);
    onFinish();
    message.success('编辑成功');
    return true;
  };

  return (
    <ModalForm<ICertificate>
      title="纪念证书"
      width={480}
      open={open}
      initialValues={initialValues}
      onFinish={handleSubmit}
      onOpenChange={onOpenChange}
    >
      <Form.Item name="id" noStyle />
      <CoverUploader name="coverUrl" label="封面" tooltip="建议上传尺寸为 1125 x 843 的 png" />
      <ProFormText name="title" label="标题" width="md" fieldProps={{ maxLength: 250 }} rules={[{ required: true, message: '标题不能为空' }]} />
    </ModalForm>
  );
};

export const Certificate = ({ id }: { id: number }) => {
  const message = useMessage();
  const [certificate, setCertificate] = useState<ICertificate>();
  const [modalOpen, setModalOpen] = useState(false);

  const getCertificate = () => HttpClient.getActivityCertificate({ id }).then(certificate => setCertificate(certificate));

  useEffect(() => {
    getCertificate();
  }, []);
  
  return (
    <>
      {
        certificate?.title
         ? (
          <Card
            style={{ width: 400 }}
            cover={<img src={certificate.coverUrl} />}
            actions={[
              <Button key="modify" type="text" icon={<EditOutlined />} onClick={() => setModalOpen(true)} />,
              <Popconfirm key="delete" title="提示" description="确认删除纪念证书吗？" onConfirm={() => HttpClient.deleteActivityCertificate({ id }).then(() => message.success('删除成功')).then(getCertificate)}>
                <Button type="text" icon={<DeleteOutlined />} danger />
              </Popconfirm>,
            ]}
            hoverable
          >
            <Meta title={certificate.title} />
          </Card>
        )
        : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <Button type="primary" onClick={() => setModalOpen(true)}>编辑纪念证书</Button>
          </Empty>
        )
      }
      <CertificateModal open={modalOpen} initialValues={certificate} onOpenChange={setModalOpen} onFinish={getCertificate} />
    </>
  );
};