'use client';

import { useRouter } from "next/navigation";
import useStore from "@/store";
import { ActivityState, Role } from '@/constants/value-enum';
import { useMessage } from '@/hooks';
import { CoverUploader, DebounceSelect } from '@/components';
import { HttpClient } from '@/utils';
import { activityFeatureValueEnumMap, activityTypeValueEnumMap } from '@/constants';
import { Form } from "antd";
import { FormOperation } from "..";
import { 
  ProForm,
  ProFormText,
  ProFormSwitch,
  ProFormList,
  ProCard,
  ProFormDigit,
  ProFormTextArea,
  ProFormDateTimeRangePicker,
  ProFormDateTimePicker,
  ProFormSegmented,
  ProFormCheckbox,
} from "@ant-design/pro-components";

import type { IActivityFormProps, ActivityFormType, PoiType, PoiOption } from '..';
import type { ActivityForm as _ActivityForm } from '@/utils/http/api-types'
import dayjs, { Dayjs } from "dayjs";

const amapKey = process.env.NEXT_PUBLIC_AMAP_AMP_KEY;

const convertToDayjs = (value: string | string[] | Dayjs | Dayjs[]) => {
  if(Array.isArray(value)) return value.map(val => dayjs.isDayjs(val) ? val : dayjs(val));

  return dayjs.isDayjs(value) ? value : dayjs(value);
};

const fetchCityList = (keyword: string) => HttpClient.autoCompleteCity({ keyword });

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

      return tips.filter(({ id }) => id).map(({ name, location, address: _address }, index) => {
        const locationArr = location.split(',');
        const address = typeof _address === 'string' ? _address : '';
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

export const ActivityForm = ({ id, operation, initialValues }: IActivityFormProps) => {
  
  const router = useRouter();
  const message = useMessage();
  const role = useStore(state => state.role);
  const [form] = Form.useForm<ActivityFormType>();
  const state = Form.useWatch('state', form) as ActivityState;
  const isWorkListModifiable = (operation === FormOperation.modify && state >= ActivityState.activated) ? false : true;

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
    form['workList'] = workList.map(_work => {
      const { dateRange } = _work;
      const work: Record<string, any> = { ..._work, startAt: dateRange[0], endAt: dateRange[1] };
      isWorkListModifiable && (work.id = null);
      delete work['dateRange'];
      return work;
    });
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
        initialValues={initialValues}
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
          <ProFormSegmented label="活动类型" name="type" valueEnum={activityTypeValueEnumMap} initialValue={id ? void 0 : 0} rules={[{ required: true, message: '活动类型不能为空' }]} />
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
                validator: (_, value) => {
                  const [signUpStart, signUpEnd] = convertToDayjs(value) as Dayjs[];
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
            convertValue={convertToDayjs}
            rules={[
              { required: true, message: '取消报名截止时间不能为空' },
              ({ getFieldValue }) => ({
                validator: (_, value) => {
                  const [signUpStart] = convertToDayjs(getFieldValue('signUpRange')) as Dayjs[];
                  if(signUpStart && value && (signUpStart.isSame(value) || signUpStart.isAfter(value)))
                    return Promise.reject(new Error('取消报名截止时间不能早于报名开始时间'));
                  else return Promise.resolve();
                }
              }),
            ]} 
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormSwitch label="是否在小程序展示" name="isDisplay" initialValue={id ? void 0 : true} />
          <ProFormSwitch label="启用白名单" name="isWhite" initialValue={id ? void 0 : false} tooltip="启用白名单后，白名单用户报名后将直接通过审核" />
          <ProFormSwitch label="展示酬金" name="isMoney" initialValue={id ? void 0 : true} />
          <ProFormSwitch label="展示工作须知" name="isWorkInstruction" initialValue={id ? void 0 : true} />
          <ProFormSwitch label="是否线下签到" name="isCheck" initialValue={id ? void 0 : true} />
          <ProFormCheckbox.Group label="活动保障" name="features" valueEnum={activityFeatureValueEnumMap} initialValue={id ? void 0 : []} />
        </ProForm.Group>
        <ProForm.Group>
          <CoverUploader name="coverPath" label="活动封面" tooltip="建议上传尺寸为 282 x 384 的 png" />
          <ProFormTextArea label="活动描述" name="description" width="md" fieldProps={{ maxLength: 500, showCount: true }}  initialValue={id ? void 0 : ''} />
          <ProFormTextArea label="活动公告" name="announcement" width="md" fieldProps={{ maxLength: 500, showCount: true }} initialValue={id ? void 0 : ''} />
          <ProFormList
            label="岗位列表"
            name="workList"
            emptyListMessage="岗位列表不能为空"
            className="m-h-[500px] overflow-y-auto"
            min={1}
            copyIconProps={false}
            tooltip="报名开始后，活动将处于进行中状态，此时岗位列表不支持编辑。如需新增，请在活动详情页进行新增岗位补录。"
            creatorButtonProps={{
              block: false,
              creatorButtonText: '添加岗位',
              disabled: !isWorkListModifiable
            }}
            actionRender={(_, __, defaultActionDom) => isWorkListModifiable ? defaultActionDom : []}
            itemRender={({ listDom, action }, { index }) => (
              <ProCard
                style={{ marginBlockEnd: 8 }}
                title={`岗位${index + 1}`}
                extra={isWorkListModifiable && action}
                bodyStyle={{ paddingBlockEnd: 0 }}
                bordered
              >
                {listDom}
              </ProCard>
            )}
            isValidateList
            required
          >
            <ProForm.Group>
              <ProFormText label="名称" name="name" width="xs" rules={[{ required: true, message: '岗位名称不能为空' }]} />
              <ProFormDigit label="酬金" name="money" width="xs" max={1000} rules={[{ required: true, message: '岗位酬金不能为空' }]} />
              <ProFormDigit label="积分" name="integral" width="xs" max={1000} rules={[{ required: true, message: '岗位积分不能为空' }]} />
            </ProForm.Group>
            <ProForm.Group>
              <ProFormDateTimeRangePicker
                label="工作时间"
                name="dateRange"
                convertValue={convertToDayjs}
                rules={isWorkListModifiable ? [
                  { required: true, message: '工作时间不能为空' },
                  ({ getFieldValue }) => ({
                    validator: (_, value) => {
                      const [workStart, workEnd] = convertToDayjs(value) as Dayjs[];
                      const end = convertToDayjs(getFieldValue(['dateRange', 1])) as Dayjs;
                      if(workStart && workEnd && workStart.isSame(workEnd)) return Promise.reject(new Error('工作时长不能为0'));
                      if(end && workEnd && workEnd.isAfter(end)) return Promise.reject(new Error('工作结束时间不能晚于活动结束时间'));
                      return Promise.resolve();
                    }
                  }),
                ] : void 0}
              />
            </ProForm.Group>
              <ProFormTextArea label="工作内容" name="description" rules={[{ required: true, message: '工作内容不能为空' }]} fieldProps={{ maxLength: 250, showCount: true }} />
          </ProFormList>
        </ProForm.Group>
        <Form.Item name="state" initialValue={ActivityState.awaitingSubmit} noStyle />
      </ProForm>
    </>
  );
};

export default ActivityForm;