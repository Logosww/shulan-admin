'use client';

import React, { useEffect, useState } from 'react';
import { Button, Carousel, Form, Image, Modal, Popconfirm, Spin } from 'antd';
import { ModalForm, ProFormDependency, ProFormGroup, ProFormSegmented, ProFormSelect, ProFormUploadButton, ProTable } from '@ant-design/pro-components';
import { BannerType, bannerTypeValueEnumMap } from '@/constants';
import { DeleteOutlined, EditOutlined, EyeOutlined, LoadingOutlined, MenuOutlined, PlusOutlined } from '@ant-design/icons';
import { HttpClient } from '@/utils';
import { useCOS, useMessage, useModal } from '@/hooks';
import { DndContext } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { FormInstance, UploadFile } from 'antd';
import type { IBanner } from '@/utils/http/api-types';
import type { DragEndEvent } from '@dnd-kit/core';

interface IRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
}

type BannerForm = Omit<IBanner, 'id' | 'coverUrl'> & { coverPath: string };

const BannerModal = ({ open, form, title, onFinish, onOpenChange }: { 
  title: string;
  open: boolean;
  form: FormInstance;
  onFinish: () => Promise<any>;
  onOpenChange: (open: boolean) => void;
}) => {
  const modal = useModal();
  const message = useMessage();
  const { upload } = useCOS();

  const handlePreviewPic = (file: UploadFile) => {
    const { originFileObj, url } = file;
    if(!(originFileObj || url)) return;

    const src = url || URL.createObjectURL(originFileObj!);
    modal.info({
      centered: true,
      maskClosable: true,
      width: 'auto',
      modalRender: () => <img className="rounded-[6px] max-h-[70vh] overflow-hidden" src={src} />,
    });
  };

  const handleSubmit = async (_form: IBanner) => {
    const { id, coverUrl } = _form;
    const form: Record<string, any>= {..._form};
    form['coverPath'] = URL.canParse(coverUrl) ? new URL(coverUrl).pathname.slice(1) : coverUrl;
    delete form['coverUrl'];
    await (id ? HttpClient.modifyBanner({ ...form as BannerForm, id }) : HttpClient.appendBanner(form as BannerForm));
    onFinish();
    message.success(id ? '编辑成功' : '添加成功');
    onOpenChange(false);
  };

  return (
    <ModalForm<IBanner>
      width={440}
      variant="filled"
      form={form}
      open={open}
      title={title}
      onOpenChange={onOpenChange}
      onFinish={handleSubmit}
    >
      <Form.Item name="id" noStyle />
      <ProFormUploadButton 
        label="Banner 封面"
        name="coverUrl"
        listType="picture-card"
        tooltip="建议上传尺寸为 1029x450 的 png"
        max={1}
        rules={[{ required: true, message: 'Banner 封面不能为空' }]}
        convertValue={(value: string) => {
          if(!value || !value.length) return [] as UploadFile[];
          if(typeof value === 'string') return [{
            status: 'done',
            url: value,
          }] as UploadFile[];
          return value;
        }}
        transform={(file: UploadFile[] | string) => Array.isArray(file) ? file[0].response : file}
        fieldProps={{
          onPreview: handlePreviewPic,
          customRequest: async ({ onProgress, onSuccess, file }) => {
            const covertPath = await upload(file as File, void 0, e => onProgress?.(e));
            onSuccess?.(covertPath);
            message.success('封面上传成功');
          }
        }}
      />
      <ProFormGroup>
        <ProFormSegmented label="跳转类型" name="type" initialValue={BannerType.activity} valueEnum={bannerTypeValueEnumMap} />
        <ProFormDependency name={['type']}>
          {({ type }) => (
            <ProFormSelect
              width="md"
              name="targetId"
              label={`目标${bannerTypeValueEnumMap.get(type)}`}
              request={type === BannerType.activity ? HttpClient.getActivityOptions : HttpClient.getLiveOptions}
            />
          )}
        </ProFormDependency>
      </ProFormGroup>
    </ModalForm>
  );
};

const Row = ({ children, ...props }: IRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props['data-row-key'],
  });

  const style: React.CSSProperties = {
    ...props.style,
    cursor: 'default',
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  };

  return (
    <tr {...props} ref={setNodeRef} style={style} {...attributes}>
      {React.Children.map(children, (child) => {
        if ((child as React.ReactElement).key === 'sort') {
          return React.cloneElement(child as React.ReactElement, {
            children: (
              <MenuOutlined
                ref={setActivatorNodeRef}
                style={{ touchAction: 'none', cursor: 'move' }}
                {...listeners}
              />
            ),
          });
        }
        return child;
      })}
    </tr>
  );
};

const BannerPreviewModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [bannerList, setBannerList] = useState<string[]>();

  const getBannerList = async () => {
    setIsLoading(true);
    const list = await HttpClient.getBanners().then(_list => _list.map(({ coverUrl }) => coverUrl));
    await Promise.all(list.map(src => new Promise(resolve => {
      const img = document.createElement('img');
      img.onload = resolve;
      img.src = src;
    })));
    setBannerList(list);
    setIsLoading(false);
  };

  useEffect(() => {
    open && getBannerList();
  }, [open]);

  return (
    <Modal title="Banner 预览" footer={false} open={open} onCancel={() => onOpenChange(false)} centered>
      <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} />} spinning={isLoading}>
        <Carousel autoplay>
          {bannerList?.map((bannerSrc, index) => <img className="w-full h-[200px] rounded-[6px] object-cover" key={index} src={bannerSrc} />)}
        </Carousel>
      </Spin>
    </Modal>
  )
};

const BannersPage = () => {
  const [modalTitle, setModalTitle] = useState('新增 Banner');
  const [modalOpen, setModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [bannerList, setBannerList] = useState<IBanner[]>([]);
  const [modalForm] = Form.useForm();
  const message = useMessage();

  const handleDelele = async (id: number) => {
    await HttpClient.deleteBanner({ id });
    setBannerList(_list => {
      const list = [..._list];
      const index = list.findIndex(({ id: _id }) => _id === id);
      if(index >= 0) list.splice(index, 1);
      return list;
    });
    message.success('删除成功');
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      const activeIndex = bannerList.findIndex(({ id }) => id === active.id);
      const overIndex = bannerList.findIndex(({ id }) => id === over?.id);
      const list = arrayMove(bannerList, activeIndex, overIndex);
      setBannerList(list);
      HttpClient.setBannerList(list.map(({ id }) => id)).then(() => message.success('列表更新成功')).catch(getBannerList);
    }
  };

  const getBannerList = async () => HttpClient.getBanners().then(bannerList => setBannerList(bannerList));

  useEffect(() => {
    getBannerList();
  },[]);

  return (
    <>
      <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
        <SortableContext
          items={bannerList.map(({ id }) => id)}
          strategy={verticalListSortingStrategy}
        >
          <ProTable<IBanner>
            rowKey="id"
            search={false}
            pagination={false}
            dataSource={bannerList}
            toolbar={{
              actions: [
                <Button key="preview" icon={<EyeOutlined />} onClick={() => setPreviewModalOpen(true)}>预览</Button>,
                <Button key="append" type="primary" icon={<PlusOutlined />} onClick={() => { setModalTitle('新增 Banner'), modalForm.resetFields(), setModalOpen(true) }}>新增 Banner</Button>,
              ]
            }}
            components={{
              body: {
                row: Row,
              }
            }}
            columns={[
              { key: 'sort', width: 48 },
              {
                dataIndex: 'index',
                valueType: 'indexBorder',
                width: 48,
                title: '序号',
              },
              {
                dataIndex: 'coverUrl',
                title: '封面图片',
                renderText: (_, banner) => <Image className="rounded-[6px] object-cover" width={240} height={160} src={banner.coverUrl} />
              },
              {
                dataIndex: 'type',
                title: '跳转类型',
                valueEnum: bannerTypeValueEnumMap,
              },
              {
                dataIndex: 'targetName',
                title: '跳转目标标题',
                valueType: 'text',
              },
              {
                key: 'option',
                valueType: 'option',
                title: '操作',
                width: 200,
                renderText: (_, banner) => (
                  <>
                    <Button type="link" icon={<EditOutlined />} onClick={() => { setModalTitle('编辑 Banner'), modalForm.setFieldsValue(banner), setModalOpen(true) }}>编辑</Button>
                    <Popconfirm title="警告" description="该操作不可撤销，确认删除吗" onConfirm={() => handleDelele(banner.id)}>
                      <Button type="link" icon={<DeleteOutlined />} danger>删除</Button>
                    </Popconfirm>
                  </>
                )
              }
            ]}
          />
        </SortableContext>
      </DndContext>
      <BannerModal open={modalOpen} form={modalForm} title={modalTitle} onFinish={getBannerList} onOpenChange={setModalOpen} />
      <BannerPreviewModal open={previewModalOpen} onOpenChange={setPreviewModalOpen} />
    </>
  );
};

export default BannersPage;