'use client';

import { cloneElement, useMemo, useState, useEffect, useCallback, type JSX } from 'react';
import { Button, Drawer, Form, Input } from 'antd';
import { HttpClient } from '@/utils/http';
import { useMessage, useModal } from '@/hooks';
import { VolunteerWhitelistState } from '@/constants/value-enum';
import { ProForm, ProList } from '@ant-design/pro-components';
import { DownloadOutlined } from '@ant-design/icons';
import Text from 'antd/es/typography/Text';

import type { ReactNode } from 'react';
import type { IVolunteer } from '@/utils/http/api-types';

export interface IBatchWhitelistStateDrawerProps<T = null> {
  title: string;
  trigger: JSX.Element;
  children: ReactNode;
  whitelistState: VolunteerWhitelistState,
  formTransform?: (form: Record<string, any>) => T;
  batchRequest: (params: { ids: number[]; form: T }) => Promise<any>;
  reloadTable: () => Promise<any>;
};

export const BatchWhitelistStateDrawer = <T extends Record<string, any>>(props: IBatchWhitelistStateDrawerProps<T>) => {
  const { title, trigger: _trigger, children, whitelistState, formTransform, batchRequest, reloadTable } = props;
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [volunteerList, setVolunteerList] = useState<IVolunteer[]>([]);
  const trigger = useMemo(() => cloneElement(_trigger, {
    key: 'trigger',
    ..._trigger.props,
    onClick: (e: any) => {
      setOpen(!open);
      _trigger.props?.onClick?.(e);
    },
  }), [_trigger, open, setOpen])

  const message = useMessage();
  const modal = useModal();
  const [form] = Form.useForm();

  const getVolunteerList = useCallback(() => {
    HttpClient.getVolunteersByWhitelistState({ state: whitelistState })
      .then(list => setTimeout(() => {
        setVolunteerList(list);
        setIsLoading(false);
      }, 450));
  }, [whitelistState]);

  const handleSearch = async () => {
    await form.validateFields();
    const phones = form.getFieldValue('phones') as string;
    if(!phones) return;

    setIsImporting(true);
    const purePhoneNumbers = phones.split(' ').filter(val => val);
    const { result: list, notFound } = await HttpClient.searchVolunteers({ purePhoneNumbers }).finally(() => setTimeout(() => setIsImporting(false), 600));
    if(!list.length) return message.error('未找到符合条件的志愿者');

    const _form = form.getFieldsValue();
    const ids = list.map(({ id }) => id);
    delete _form['phones'];
    await batchRequest({ ids, form: formTransform? formTransform(_form) : _form });
    setVolunteerList([...volunteerList, ...list]);
    message.success('导入成功');
    if(notFound.length) modal.error({
      footer: null,
      centered: true,
      closable: true,
      title: '未找到以下手机号',
      content: notFound.map((phone, index) => <div key={index}>{phone}</div>),
    });
    reloadTable();
  };

  useEffect(() => {
    if(open) getVolunteerList();
    else form.resetFields();
  }, [open, form, getVolunteerList]);

  return (
    <>
      {trigger}
      <Drawer 
        title={title}
        width={500}
        loading={isLoading}
        open={open}
        onClose={() => setOpen(false)}
        destroyOnClose
      >
        <ProForm variant="filled" form={form} submitter={false}>
          {children}
          <Form.Item name="phones">
            <Input.Search 
              placeholder="请输入手机号，并以空格分隔" 
              onSearch={handleSearch}
              enterButton={<Button type="primary" icon={<DownloadOutlined />} loading={isImporting}>批量导入</Button>}
            />
          </Form.Item>
          <ProList<IVolunteer>
            rowKey="id"
            cardProps={{ bodyStyle: { paddingBlock: 0, paddingInline: 8 } }}
            dataSource={volunteerList}
            pagination={{ pageSize: 12, total: volunteerList.length, simple: true, size: 'small', hideOnSinglePage: true }}
            metas={{
              title: {
                dataIndex: 'name'
              },
              subTitle: {
                render: (_, { purePhoneNumber: phone }) => <Text>手机号：{phone}</Text>
              },
            }}
          />

        </ProForm>
      </Drawer>
    </>
  );
};

export default BatchWhitelistStateDrawer;