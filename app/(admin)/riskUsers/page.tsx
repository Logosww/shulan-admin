'use client';

import { ModalForm, ProFormSelect, ProFormText, ProFormUploadDragger, ProTable } from '@ant-design/pro-components';
import { HttpClient } from '@/utils/http';
import { useCOS, useMessage, usePagingAndQuery } from '@/hooks';
import { IRiskUser } from '@/utils/http/api-types';
import { idCardTypeValueEnumMap } from '@/constants';
import { Button, Form, Popconfirm, Space, UploadFile } from 'antd';
import { DownloadOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { nanoid } from 'nanoid';

type FilterForm = Pick<IRiskUser, 'name' | 'phone' | 'idCard'>;

const BatchImportModal = ({ onFinish }: {
  onFinish: () => Promise<void>;
}) => {
  const message = useMessage();
  const [form] = Form.useForm();
  const { upload } = useCOS();

  const handleSubmit = async (form: { key: string }) => {
    await HttpClient.batchImportRiskUsers(form);
    message.success('导入成功');
    onFinish();

    return true;
  };

  return (
    <ModalForm<{ key: string }>
      title="批量导入"
      variant="filled"
      width={480}
      form={form}
      trigger={<Button icon={<UploadOutlined />}>批量导入</Button>}
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
            <a href="//common-1323578300.cos.ap-shanghai.myqcloud.com/shulan-manage/risk_user_pattern.xlsx"><DownloadOutlined />下载模板</a>
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
}

const AppendRiskUserModal = ({ onFinish }: {
  onFinish: () => Promise<any>;
}) => {
  const message = useMessage();
  const [form] = Form.useForm();

  const handleAdd = async (values: IRiskUser) => {
    await HttpClient.appendRiskUser(values);
    message.success('封禁成功');
    onFinish();

    return true;
  };

  return (
    <ModalForm
      title="封禁风险用户"
      variant="filled"
      validateTrigger="onSubmit"
      width={400}
      form={form}
      modalProps={{ centered: true, afterClose: form.resetFields }}
      onFinish={handleAdd}
      trigger={
        <Button type="primary" icon={<PlusOutlined />}>封禁风险用户</Button>
      }
      autoFocusFirstInput
    >
      <ProFormText name="name" label="姓名" width="sm" initialValue="" />
      <ProFormText name="phone" label="手机号" width="md" initialValue="" />
      <ProFormSelect
        name="idCardType"
        label="证件类型"
        width="sm"
        valueEnum={idCardTypeValueEnumMap}
        rules={[{ required: true }]}
      />
      <ProFormText name="idCard" label="证件号码" rules={[{ required: true }]} />
    </ModalForm>
  );
}

const RiskUsersPage = () => {
  const message = useMessage();
  const {
    reload,
    state: {
      paginationConfig,
      loading: [loading],
      dataSource: [dataSource, setDataSource],
    },
    handler: {
      handleFilterQuery,
      handleFilterReset,
    }
  } = usePagingAndQuery<IRiskUser, FilterForm>({
    pagingRequest: HttpClient.getPagingRiskUsers,
    queryRequest: HttpClient.filterRiskUsers,
    filterFormTransform: form => ({
      name: form.name ?? null,
      phone: form.phone ?? null,
      idCard: form.idCard ?? null,
    }),
  });

  const handleRemove = async (id: number) => {
    await HttpClient.deleteRiskUser({ id });
    message.success('移除成功');
    reload();
  };

  return (
    <ProTable<IRiskUser, FilterForm>
      rowKey="id"
      form={{ variant: 'filled' }}
      scroll={{ x: '100%' }}
      toolbar={{
        actions: [
          <BatchImportModal key="import" onFinish={reload} />,
          <AppendRiskUserModal key="add" onFinish={reload} />,
        ]
      }}
      columns={[
        { title: '姓名', dataIndex: 'name' },
        { title: '手机号', dataIndex: 'phone' },
        { title: '证件类型', dataIndex: 'idCardType', search: false, renderText: (_, { idCardType }) => idCardTypeValueEnumMap.get(idCardType) },
        { title: '证件号码', dataIndex: 'idCard' },
        { title: '是否曾认证', dataIndex: 'onceCertified', search: false, renderText: (_, { onceCertified }) => onceCertified ? '是' : '否' },
        { title: 'IP 归属地', dataIndex: 'ip', search: false },
        { title: '操作人', dataIndex: 'operator', search: false },
        { title: '操作时间', dataIndex: 'createAt', search: false },
        {
          title: '操作',
          key: 'option',
          valueType: 'option',
          render: (_, record) => [
            <Popconfirm
              key="delete"
              title="确认移除？"
              onConfirm={() => handleRemove(record.id)}
            >
              <Button type="link" danger>移除</Button>
            </Popconfirm>
          ],
        }
      ]}
      loading={loading}
      dataSource={dataSource}
      onDataSourceChange={setDataSource}
      pagination={paginationConfig}
      onReset={handleFilterReset}
      onSubmit={handleFilterQuery}
      cardBordered
    />
  );
};

export default RiskUsersPage;