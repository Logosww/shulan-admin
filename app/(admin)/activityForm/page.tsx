'use client';

import dayjs from 'dayjs';
import { Suspense, useContext } from 'react';
import { Form } from 'antd';
import { 
  ProForm,
  ProFormText,
  ProFormUploadButton,
  ProFormSwitch,
  ProFormList,
  ProCard,
  ProFormDigit,
  ProFormTextArea,
  ProFormDateTimeRangePicker,
  ProFormDateTimePicker,
  ProFormSegmented,
  ProFormCheckbox,
  ProSkeleton,
} from '@ant-design/pro-components';
import { useRouter, useSearchParams } from 'next/navigation';
import { ActivityState, Role } from '@/constants/value-enum';
import { useMessage, useModal, useCOSUpload } from '@/hooks';
import { DebounceSelect, PageTitle, UserRoleContext } from '@/components';
import { HttpClient } from '@/utils';
import { activityFeatureValueEnum, activityTypeValueEnum } from '@/constants';
import { formOperationMap, formTitleMap, FormOperation } from '.';

import type { UploadFile } from 'antd';
import type { ActivityForm as _ActivityForm } from '@/utils/http/api-types'
import type { IActivityFormProps, ActivityFormType, PoiType, PoiOption } from '.';
const amapKey = process.env.NEXT_PUBLIC_AMAP_AMP_KEY;

const fetchCityList = (keyword: string) => HttpClient.autoCompleteCity({ keyword });

const getFormInitialValues = async (params: Record<string, any>) => {
  const activityFormRaw = await HttpClient.getActivityDraft(params as { id: number });
  const activityForm: Record<string, any> = { ...activityFormRaw };
  const { startAt, endAt, coverUrl, signupStartAt, signupEndAt, signupCancelAt, workList } = activityFormRaw;
  activityForm['coverPath'] = coverUrl;
  activityForm['signupCancelAt'] = dayjs(signupCancelAt);
  activityForm['dateRange'] = [dayjs(startAt), dayjs(endAt)];
  activityForm['signUpRange'] = [dayjs(signupStartAt), dayjs(signupEndAt)];
  activityForm['workList'] = workList.map(work => ({ ...work, dateRange: [dayjs(work.startAt), dayjs(work.endAt)] }));

  return activityForm as ActivityFormType;
};

const fetchPoiList = async (keywords: string, city?: string) => {
  if(!amapKey) return [];
  const url = `https://restapi.amap.com/v3/assistant/inputtips?${
    new URLSearchParams({
      keywords,
      key: amapKey,
      dataType: 'poi',
      ...(city ? { city } : {}),
    }).toString()
  }`;

  return fetch(url)
    .then(response => response.json())
    .then(({ tips, status }: { tips: PoiType[]; status: 0 | 1 }) => {
      if(!status || tips.length === 0) return [];

      return tips.filter(({ id }) => id).map(({ name, address, location }, index) => {
        const locationArr = location.split(',');
        return {
          key: index,
          value: name,
          label: <span>{name} | {address}</span>,
          detail: {
            detail: address,
            longitude: locationArr[0],
            latitude: locationArr[1],
          },
        };
      });
    }) as Promise<PoiOption[]>;
};

const ActivityForm = ({ id, operation, initialValues }: IActivityFormProps) => {
  
  const router = useRouter();
  const message = useMessage();
  const modal = useModal();
  const { upload } = useCOSUpload();
  const [role] = useContext(UserRoleContext)!;
  const [form] = Form.useForm<ActivityFormType>();
  const state = Form.useWatch('state', form) as ActivityState;
  const isWorkListModifiable = operation === FormOperation.modify && state >= ActivityState.activated ? false : true;

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

  const handleFetchPoiList = (keywords: string) => {
    const city = form.getFieldValue('city');
    return fetchPoiList(keywords, city);
  };

  const handleSelectPoi = (_: string, { detail }: PoiOption) => form.setFieldValue('addressDetail', detail);;

  const handleFormSubmit = async (_form: ActivityFormType) => {
    const isModifying = operation === FormOperation.modify, isSuperAdmin = role === Role.superAdmin;
    const { dateRange, signUpRange, workList, coverPath } = _form;
    const form: Record<string, any> = { ..._form };
    form['coverPath'] = URL.canParse(coverPath) ? new URL(coverPath).pathname.slice(1) : coverPath;
    form['startAt'] = dateRange[0], form['endAt'] = dateRange[1];
    form['signupStartAt'] = signUpRange[0], form['signupEndAt'] = signUpRange[1];
    form['workList'] = isWorkListModifiable ? workList.map(_work => {
      const { dateRange } = _work;
      const work: Record<string, any> = { ..._work, startAt: dateRange[0], endAt: dateRange[1] };
      delete work['dateRange'], delete work['id'];
      return work;
    }) : [];
    delete form['dateRange'], delete form['signUpRange'], delete form['state'];

    if(isModifying) await HttpClient.modifyActivityDraft({ ...(form as _ActivityForm), id: id! });
    else await (isSuperAdmin ? HttpClient.createActivity : HttpClient.createActivityDraft)(form as _ActivityForm);
    message.success(`${
      isModifying
        ? '编辑活动成功'
        : (isSuperAdmin ? '创建活动成功' : '保存草稿成功')
    }`);
    router.replace('/activities');
  };

  return (
    <>
      <ProForm<ActivityFormType>
        className="h-full overflow-y-auto"
        variant="filled"
        validateTrigger="onSubmit"
        requiredMark={false}
        form={form}
        request={id ? getFormInitialValues : void 0}
        onFinish={handleFormSubmit}
        params={id ? { id } : void 0}
        submitter={{ searchConfig: { 
          submitText: operation === FormOperation.modify
            ? '保存编辑'
            : role === Role.superAdmin ? '创建活动' : '保存草稿'
        }}}
        autoFocusFirstInput
      >
        <ProForm.Group>
          <ProFormText label="活动名称" name="name" width="md" rules={[{ required: true, message: '活动名称不能为空' }]} />
          <ProFormSegmented label="活动类型" name="type" valueEnum={activityTypeValueEnum} initialValue={id ? void 0 : 0} rules={[{ required: true, message: '活动类型不能为空' }]} />
          <Form.Item label="城市" name="city" rules={[{ required: true, message: '城市不能为空' }]}>
            <DebounceSelect
              fetchOptions={fetchCityList}
              style={{ width: 104 }}
              allowClear
            />
          </Form.Item>
          <Form.Item label="具体地址" name="address" rules={[{ required: true, message: '具体地址不能为空' }]}>
            <DebounceSelect<string, PoiOption> 
              placeholder="请输入地址"
              fetchOptions={handleFetchPoiList}
              style={{ width: 328 }}
              onSelect={handleSelectPoi}
              allowClear
            />
          </Form.Item>
          <Form.Item name="addressDetail" noStyle />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormDateTimeRangePicker 
            label="活动时间"
            name="dateRange"
            rules={[{ required: true, message: '活动时间不能为空' }]}
          />
          <ProFormDateTimeRangePicker 
            label="报名时间"
            name="signUpRange"
            rules={[
              { required: true, message: '报名时间不能为空' },
              ({ getFieldValue }) => ({
                validator: (_, [signUpStart, signUpEnd]) => {
                  const [start] = getFieldValue('dateRange');
                  if(signUpStart && signUpEnd && signUpStart.isSame(signUpEnd)) return Promise.reject(new Error('报名时长不能为0'));
                  if(start && signUpStart.isAfter(start)) return Promise.reject(new Error('报名开始时间不能晚于活动开始时间'));
                  if(start && signUpEnd.isAfter(start)) return Promise.reject(new Error('报名截止时间不能晚于活动开始时间'));
                  if(signUpStart && signUpEnd && signUpStart.isSame(signUpEnd)) return Promise.reject('报名开始和截止时间不能一致');
                  return Promise.resolve();
                }
              }),
            ]}
          />
          <ProFormDateTimePicker 
            label="取消报名截止时间" 
            name="signupCancelAt"
            rules={[
              { required: true, message: '取消报名截止时间不能为空' },
              ({ getFieldValue }) => ({
                validator: (_, value) => {
                  const [signUpStart] = getFieldValue('signUpRange');
                  if(signUpStart && value && (signUpStart.isSame(value) || signUpStart.isAfter(value)))
                    return Promise.reject(new Error('取消报名截止时间不能早于报名开始时间'));
                  else return Promise.resolve();
                }
              }),
            ]} 
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormSwitch label="是否展示" name="isDisplay" initialValue={id ? void 0 : true} />
          <ProFormSwitch label="启用白名单" name="isWhite" initialValue={id ? void 0 : false} tooltip="启用白名单后，白名单用户报名后将直接通过审核" />
          <ProFormCheckbox.Group label="活动保障" name="features" valueEnum={activityFeatureValueEnum} initialValue={id ? void 0 : []} />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormUploadButton 
            label="活动封面"
            name="coverPath"
            listType="picture-card"
            tooltip="建议上传尺寸为 282x384 的 png"
            max={1}
            rules={[{ required: true, message: '活动封面不能为空' }]}
            convertValue={(value: string | UploadFile[]) => {
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
          <ProFormTextArea label="活动描述" name="description" width="md" fieldProps={{ maxLength: 500, showCount: true }}  initialValue={id ? void 0 : ''} />
          <ProFormTextArea label="活动公告" name="announcement" width="md" fieldProps={{ maxLength: 500, showCount: true }} initialValue={id ? void 0 : ''} />
          <ProFormList
            label="岗位列表"
            name="workList"
            emptyListMessage="岗位列表不能为空"
            className="m-h-[500px] overflow-y-auto"
            min={1}
            copyIconProps={false}
            tooltip="报名开始后，活动将处于进行中状态，此后岗位列表不支持编辑。如需改动，请在活动详情页进行新增岗位补录。"
            creatorButtonProps={{ block: false, creatorButtonText: '添加岗位', disabled: !isWorkListModifiable }}
            actionRender={(_, __, defaultActionDom) => isWorkListModifiable ? defaultActionDom : []}
            itemRender={({ listDom, action }, { index }) => (
              <ProCard
                style={{ marginBlockEnd: 8 }}
                title={`岗位${index + 1}`}
                extra={action}
                bodyStyle={{ paddingBlockEnd: 0 }}
                checked={!isWorkListModifiable}
                bordered
              >
                {listDom}
              </ProCard>
            )}
            isValidateList
            required
          >
            <ProForm.Group>
              <ProFormText label="名称" name="name" width="xs" rules={[{ required: true, message: '岗位名称不能为空' }]} readonly={!isWorkListModifiable} />
              <ProFormDigit label="酬金" name="money" width="xs" max={500} rules={[{ required: true, message: '岗位酬金不能为空' }]} readonly={!isWorkListModifiable} />
              <ProFormDigit label="积分" name="integral" width="xs" max={1000} rules={[{ required: true, message: '岗位积分不能为空' }]} readonly={!isWorkListModifiable} />
            </ProForm.Group>
            <ProForm.Group>
              <ProFormDateTimeRangePicker
                label="工作时间"
                name="dateRange"
                readonly={!isWorkListModifiable}
                rules={isWorkListModifiable ? [
                  { required: true, message: '工作时间不能为空' },
                  ({ getFieldValue }) => ({
                    validator: (_, [workStart, workEnd]) => {
                      const signUpEnd = getFieldValue(['signUpRange', 1]);
                      const end = getFieldValue(['dateRange', 1]);
                      if(workStart && workEnd && workStart.isSame(workEnd)) return Promise.reject(new Error('工作时长不能为0'));
                      if(signUpEnd && workStart && ( workStart.isSame(signUpEnd) || workStart.isBefore(signUpEnd))) 
                        return Promise.reject(new Error('工作开始时间不能早于报名截止时间'));
                      if(end && workEnd && workEnd.isAfter(end)) return Promise.reject(new Error('工作结束时间不能晚于活动结束时间'));
                      return Promise.resolve();
                    }
                  }),
                ] : void 0}
              />
            </ProForm.Group>
              <ProFormTextArea label="工作内容" name="description" rules={[{ required: true, message: '工作内容不能为空' }]} fieldProps={{ maxLength: 250, showCount: true }} readonly={!isWorkListModifiable} />
          </ProFormList>
        </ProForm.Group>
        <Form.Item name="state" noStyle />
      </ProForm>
    </>
  );
};

const ActivityFormPageInner = async () => {
  const query = useSearchParams();
  const formOperation = query.get('operation');
  const activityId = parseInt(query.get('id') ?? '') || void 0;
  
  if(
    !formOperation 
    || !formOperationMap.includes(formOperation)
    || (formOperation !== FormOperation.append && !activityId)
  ) throw new Error('Invalid Params');

  return (
    <>
      <PageTitle title={formTitleMap[formOperation as FormOperation]} />
      <ActivityForm id={activityId} operation={formOperation as FormOperation} />
    </>
  );
};

const ActivityFormPage = () => (
  <Suspense fallback={<ProSkeleton type="result" />}>
    <ActivityFormPageInner />
  </Suspense>
);

export default ActivityFormPage;