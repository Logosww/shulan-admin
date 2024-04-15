import { useEffect, useState } from 'react';
import { HttpClient } from '@/utils';
import { Button, Card, Empty, Form, Popconfirm, message } from 'antd';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { CoverUploader } from '@/components';
import Meta from 'antd/es/card/Meta';

import type { ILive } from '@/utils/http/api-types';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

type LiveForm = Omit<ILive, 'coverUrl'> & { coverPath: string };

export const LiveModal = ({ open, initialValues, onOpenChange, onFinish }: { 
  open: boolean;
  initialValues?: ILive;
  onFinish: () => Promise<any>;
  onOpenChange: (open: boolean) => void;
}) => {

  const handleSubmit = async (_form: ILive) => {
    const form: Record<string, any> = {..._form};
    form['coverPath'] = URL.canParse(_form.coverUrl) ? new URL(_form.coverUrl).pathname.slice(1) : _form.coverUrl;;
    delete form.coverUrl;
    await HttpClient.modiftLive(form as LiveForm);
    onFinish();
    message.success('编辑成功');
    return true;
  };

  return (
    <ModalForm<ILive>
      title="现场回顾"
      width={480}
      open={open}
      initialValues={initialValues}
      onFinish={handleSubmit}
      onOpenChange={onOpenChange}
    >
      <Form.Item name="id" noStyle />
      <CoverUploader name="coverUrl" label="封面" tooltip="建议上传尺寸为 1029x405 的 png" />
      <ProFormText name="title" label="标题" width="md" fieldProps={{ maxLength: 250 }} rules={[{ required: true, message: '标题不能为空' }]} />
      <ProFormText 
        name="articleUrl"
        label="文章链接"
        width="md"
        fieldProps={{ maxLength: 250 }}
        rules={[
          { required: true, message: '文章链接不能为空' },
          {
            validator: (_, value) => URL.canParse(value) ? Promise.resolve() : Promise.reject(new Error('链接格式错误'))
          }
        ]}
      />
      <ProFormTextArea name="digest" label="简介" width="md" fieldProps={{ maxLength: 500 }} rules={[{ required: true, message: '简介不能为空' }]} />
    </ModalForm>
  );
};

export const Live = ({ id }: { id: number }) => {

  const [live, setLive] = useState<ILive>();
  const [modalOpen, setModalOpen] = useState(false);

  const getLive = () => HttpClient.getLive({ id }).then(live => setLive(live));

  useEffect(() => {
    getLive();
  }, []);

  return (
    <>
      {
        live?.articleUrl
        ? (
          <Card
            style={{ width: 400 }}
            cover={<img src={live.coverUrl} />}
            actions={[
              <Button key="modify" type="text" icon={<EditOutlined />} onClick={() => setModalOpen(true)} />,
              <Popconfirm key="delete" title="提示" description="确认删除现场回顾吗？" onConfirm={() => HttpClient.deleteLive({ id }).then(() => {message.success('删除成功')})}>
                <Button type="text" icon={<DeleteOutlined />} danger />
              </Popconfirm>,
            ]}
            hoverable
          >
            <Meta title={live.title} description={live.digest} />
          </Card>
        )
        : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <Button type="primary" onClick={() => setModalOpen(true)}>编辑现场回顾</Button>
          </Empty>
        )
      }
      <LiveModal open={modalOpen} initialValues={live} onOpenChange={setModalOpen} onFinish={getLive} />
    </>
  );
};