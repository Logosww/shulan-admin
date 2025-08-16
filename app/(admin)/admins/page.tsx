'use client';

import { Suspense, useState } from 'react';
import { useMessage, usePagingAndQuery } from '@/hooks';
import { Button, Form, Switch } from 'antd';
import { HttpClient } from '@/utils';
import { ModalForm, ProFormSelect, ProFormText, ProSkeleton, ProTable } from '@ant-design/pro-components';
import { AdminAccoutState } from '@/constants/value-enum';
import { PlusOutlined } from '@ant-design/icons';
import { adminAccnoutStateValueEnumMap, genderValueEnumMap } from '@/constants';

import type { Gender } from '@/constants/value-enum';
import type { ProColumns } from '@ant-design/pro-components';
import type { IAdminAccount } from '@/utils/http/api-types';

type FilterForm = {
  name: string;
  sex: Gender;
  state: AdminAccoutState;
};
type FormType = Omit<IAdminAccount, 'id'>;

const AddAdminModal = () => {

  const message = useMessage();
  const [form] = Form.useForm<FormType>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddAdmin = async (form: FormType) => {
    setIsSubmitting(true);
    await HttpClient.addAdminAccount(form).finally(() => setIsSubmitting(false));
    message.success({ content: '操作成功' });
    return true;
  };

  return (
    <ModalForm<FormType>
      title="新增管理员"
      layout="vertical"
      variant="filled"
      validateTrigger="onSubmit"
      width={400}
      form={form}
      requiredMark={false}
      loading={isSubmitting}
      trigger={
        <Button type="primary" icon={<PlusOutlined />}>新增管理员</Button>
      }
      onFinish={handleAddAdmin}
      autoFocusFirstInput
    >
      <ProFormText width="sm" name="name" label="姓名" rules={[{ required: true }]} />
      <ProFormSelect
        width="xs"
        name="sex"
        label="性别"
        rules={[{ required: true }]}
        valueEnum={genderValueEnumMap}
      />
      <ProFormText width="sm" name="purePhoneNumber" label="手机号" rules={[{ required: true }]} />
    </ModalForm>
  );
};

const AdminsPage = () => {

  const message = useMessage();
  const {
    state: {
      paginationConfig,
      loading: [loading],
      dataSource: [adminList, setAdminList],
    },
    handler: {
      handleFilterQuery,
      handleFilterReset,
    }
  } = usePagingAndQuery<IAdminAccount, FilterForm>({
    pagingRequest: HttpClient.getPagingAdmins,
    queryRequest: HttpClient.filterAdminAccount,
    filterFormTransform: (form) => ({
      sex: form.sex ?? null,
      name: form.name ?? null,
      state: form.state ?? null,
    }),
  });

  return (
    <Suspense fallback={<ProSkeleton type="list" />}>
      <ProTable<IAdminAccount, Pick<IAdminAccount, 'name' | 'sex' | 'state'>>
        rowKey="id"
        headerTitle="管理员账号"
        form={{ variant: 'filled' }}
        scroll={{ x: '100%' }}
        loading={loading}
        dataSource={adminList}
        pagination={paginationConfig}
        onReset={handleFilterReset}
        onSubmit={handleFilterQuery}
        toolBarRender={() => [<AddAdminModal key="add" />]}
        columns={[
          {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
          },
          {
            title: '姓名',
            dataIndex: 'name',
          },
          {
            title: '性别',
            dataIndex: 'sex',
            valueEnum: genderValueEnumMap,
            valueType: 'text',
            search: false,
          },
          {
            disable: true,
            title: '手机号',
            dataIndex: 'purePhoneNumber',
          },
          {
            disable: true,
            title: '状态',
            dataIndex: 'state',
            valueType: 'select',
            valueEnum: adminAccnoutStateValueEnumMap,
          },
          {
            title: '操作',
            valueType: 'option',
            key: 'option',
            render: (_, record, index) => {
              const StateSwitch = () => {
                const [isLoading, setIsLoading] = useState(false);

                const handleCheckedChange = async (checked: boolean) => {
                  const state = checked ? AdminAccoutState.normal : AdminAccoutState.disabled;
                  setIsLoading(true);
                  await HttpClient.modifyAdminAccount({ ...record, state }).finally(() => setIsLoading(false));
                  setAdminList(_list => {
                    const list = [..._list];
                    list[index].state = state;
                    return list;
                  });
                  message.success({ content: '修改成功' });
                };

                return (
                  <Switch
                    checkedChildren='开启'
                    unCheckedChildren='停用'
                    loading={isLoading}
                    checked={record.state === AdminAccoutState.normal}
                    onChange={handleCheckedChange}
                  />
                );
              };

              return <StateSwitch />;
            }
          }
        ]}
        cardBordered
      />
    </Suspense>
  )
};

export default AdminsPage;