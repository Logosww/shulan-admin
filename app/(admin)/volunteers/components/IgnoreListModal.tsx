import { useCOS, useMessage } from '@/hooks';
import { HttpClient } from '@/utils';
import { DownloadOutlined } from '@ant-design/icons';
import { ModalForm, ProFormUploadDragger } from '@ant-design/pro-components';
import { Button, Form, Space } from 'antd';
import { nanoid } from 'nanoid';

import type { UploadFile} from 'antd';

export const IgnoreListModal = ({ reloadTable }: { reloadTable: () => Promise<any> }) => {

  const message = useMessage();
  const { upload } = useCOS();
  const [form] = Form.useForm();

  const handleSubmit = async (params: { key: string }) => {
    await HttpClient.importIgnoreList(params);
    message.success('导入成功');
    reloadTable();
    return true;
  };

  return (
    <ModalForm
      title="导入黑名单"
      variant="filled"
      width={480}
      form={form}
      trigger={<Button type="primary">导入黑名单</Button>}
      modalProps={{ 
        centered: true,
        afterClose: form.resetFields,
      }}
      onFinish={handleSubmit}
    >
      <ProFormUploadDragger
        name="key"
        max={1}
        transform={(file: UploadFile[]) => file[0].response}
        rules={[{ required: true, message: '请上传名单' }]}
        label={
          <Space size={4}>
            填写完模板后，上传一键导入。
            <a href="//common-1323578300.cos.ap-shanghai.myqcloud.com/shulan-manage/black_list.xlsx"><DownloadOutlined />下载模板</a>
          </Space>
        }
        fieldProps={{
          customRequest: async ({ onProgress, onSuccess, file }) => {
            const key = await upload(file as File, `excel/${nanoid()}.xlsx`, e => onProgress?.(e));
            onSuccess?.(key);
          }
        }}
      />
    </ModalForm>
  );
};
