import { get, post, put, del } from '@/utils/http/request';

import  {
  Gender,
  ActivityState,
  AdminAccoutState,
  VolunteerSignUpState,
  VolunteerIdentity,
  VolunteerWhitelistState,
} from '@/constants/value-enum';
import type { 
  ILoginForm, 
  IUserProfile,
  IPagingParams,
  IPagingResult,
  IAdminAccount,
  ActivityPreview,
  IActivityDetail,
  ActivityForm,
  IVolunteer,
  NullableFilter,
  IVolunteerDetail,
  IVolunteerWork,
  OptionType,
  ICOSBucketCredentials,
  ISignUpRecord,
  SignUpRecordDetail,
  TemporaryVolunteerForm,
  ISettingForm,
  IBanner,
  VolunteerWorkForm,
} from './api-types';

export const login = (params: ILoginForm) =>
  post('/public/manage/account/smsLogin', {
    countryCode: '86',
    smsCode: params.code,
    purePhoneNumber: params.phone,
  });

export const sendSmsCode = (phone: string) =>
  post('/public/sms/manage/send', {
    countryCode: '86',
    purePhoneNumber: phone,
  });

export const sendSmsCodeWithoutCheck = (phone: string) =>
  post('/public/sms/send', {
    countryCode: '86',
    purePhoneNumber: phone,
  });

export const logout = () => del('/manage/account/logout');

export const getUserProfile = () => get<IUserProfile>('/manage/account');

export const modifyUserProfile = (params: Pick<IUserProfile, 'name' | 'sex'>) => put('/manage/account', params);

export const updatePhoneNumber = (params: ILoginForm) =>
  put('/manage/account/changePhone', {
    countryCode: '86',
    smsCode: params.code,
    purePhoneNumber: params.phone,
  });

export const getPagingAdmins = (params: IPagingParams) => get<IPagingResult<IAdminAccount>>('/superAdmin/manager/page', params);

export const getAdminAccount = (id: number) => get<IAdminAccount>('/superAdmin/manager', { id });

export const addAdminAccount = (params: Omit<IAdminAccount, 'id' | 'state'>) => post('/superAdmin/manager', { countryCode: '86', ...params });

export const modifyAdminAccount = (params: IAdminAccount) => put('/superAdmin/manager', { countryCode: '86', ...params });

export const filterAdminAccount = (params: NullableFilter<{
  name: string;
  sex: Gender;
  state: AdminAccoutState;
}>) => post<IAdminAccount[]>('/superAdmin/search', params);

export const getPagingActivities = (params: IPagingParams) => get<IPagingResult<ActivityPreview>>('/manage/activity/page', params);

export const filterActivities = (params: NullableFilter<{ 
  state: ActivityState;
  keyword: string 
}>) => post<ActivityPreview[]>('/manage/activity/search', params);

export const getActivityDetail = (params: { id: number }) => get<IActivityDetail>('/manage/activity/detail', params);

export const createActivityDraft = (params: ActivityForm) => post('/admin/manage/activity/saveDraft', params);

export const deleteActivityDraft = (params: { id: number }) => del('/admin/manage/activity/delete', params);

export const modifyActivityDraft = (params: ActivityForm & { id: number }) => put('/manage/activity/update', params);

export const getActivityDraft = (params: { id: number }) => get<ActivityForm & { id: number; state: ActivityState }>('/manage/activity/get', params);

export const createActivity = (params: ActivityForm) => post('/superAdmin/manage/activity/publish', params);

export const endActivity = (params: { id: number }) => put('/manage/activityWorkVolunteer/ended', params);

export const appendWork = (params: { id: number; form: VolunteerWorkForm }) => post('/manage/activity/work/batchAdd', { id: params.id, workList: [params.form] });

export const auditPassActivity = (parmas: { id: number }) => put('/superAdmin/manage/activity/reviewSuccess', parmas);

export const auditRejectActivity = (params: { id: number }) => put('/superAdmin/manage/activity/reviewFail', params);

export const applyForActivity = (params: { id: number }) => put('/admin/manage/activity/apply', params);

export const cancelActivityApplication = (params: { id: number }) => put('/admin/manage/activity/cancel', params);

export const getPagingVolunteers = (params: IPagingParams) => get<IPagingResult<IVolunteer>>('/superAdmin/volunteer/page', params);

export const filterVolunteers = (params: NullableFilter<{
  state: VolunteerWhitelistState;
  name: string;
  identity: VolunteerIdentity,
  purePhoneNumber: string;
}>) => post<IVolunteer[]>('/superAdmin/volunteer/search', params);

export const batchModifyVolunteerWhitelistState = (params: { ids: number[]; state: VolunteerWhitelistState; }) =>
  put('/superAdmin/volunteer/changeBatchState', params);

export const batchAddonVolunteerWhitelist = (params: { ids: number[]; expireAt: string; }) => put('/superAdmin/volunteer/editBatchWhite', params);

export const batchForbidVolunteer = (params: { ids: number[]; releaseAt: string }) => put('/superAdmin/volunteer/editBatchViolate', params);

export const getVolunteerDetail = (params: { id: number }) => get<IVolunteerDetail>('/superAdmin/volunteer/detail', params);

export const getActivityWorkDetail = (params: { id: number }) => get<IVolunteerWork>('/manage/activityWork/detail', params);

export const getActivityVolunteers = (params: { activityId: number; activityWorkId: number; }) => 
  get<IVolunteer & { activityWorkVolunteerState: VolunteerSignUpState }>('/manage/activityWorkVolunteer/list', params);

export const filterActivityVolunteers = (params: NullableFilter<{
  activityId: number;
  activityWorkId: number;
  activityWorkVolunteerState?: VolunteerSignUpState;
  volunteerState: VolunteerWhitelistState;
  purePhoneNumber: string;
  idCard: string;
}>) => post<IVolunteer & { activityWorkVolunteerState: VolunteerSignUpState }>('/manage/activityWorkVolunteer/search', params);

export const batchAuditVolunteerSignUpState = (params: { ids: number[]; activityWorkVolunteerState: VolunteerSignUpState; }) =>
  put('activityWorkVolunteerState', params);

export const setWorkAvailable = (params: { activityId: number; workId: number; isFull: boolean }) => put('/manage/activity/work/setFull', params);

export const autoCompleteCity = (params: { keyword: string }) => get<OptionType<string>[]>('/public/autoComplete/city', params);

export const getCOSBucketCredentials = () => get<ICOSBucketCredentials>('/public/cos/secret');

export const getPagingSignUpRecords = (params: IPagingParams & { activityId: number }) => get<IPagingResult<ISignUpRecord>>('/manage/activityWorkVolunteer/page', params);

export const filterSignUpRecords = (
  params: NullableFilter<{ 
    activityWorkId: number;
    activityWorkVolunteerState: VolunteerSignUpState;
    volunteerState: VolunteerWhitelistState;
    purePhoneNumber: string;
  }> & { activityId: number }
) => post<ISignUpRecord[]>('/manage/activityWorkVolunteer/search', params);

export const getActivityWorks = (params: { id: number }) => get<{ id: number; label: string }[]>('/selectBox/activityWork', params);

export const getSignUpRecordDetail = (params: { id: number }) => get<SignUpRecordDetail>('/manage/activityWorkVolunteer/detail', params);

export const setSignUpRecordState = (params: { id: number; activityWorkVolunteerState: VolunteerSignUpState }) => put('/manage/activityWorkVolunteer/changeState', params);

export const searchAvailableVolunteers = (params: { activityId: number; purePhoneNumbers: string[] }) => 
  post<{
    result: IVolunteer[];
    notFound: string[];
  }>('/manage/activityWorkVolunteer/searchWillPushVolunteer', params);

export const batchSetTempVolunteers = (params: TemporaryVolunteerForm) => post('/manage/activityWorkVolunteer/batchPull', params);

export const batchRemoveTempVolunteers = (params: { ids: number[] }) => del('/manage/activityWorkVolunteer/batchKick', params);

export const searchVolunteers = (params: { purePhoneNumbers: string[] }) => post<{
  result: IVolunteer[];
  notFound: string[];
}>('/superAdmin/volunteer/searchedVolunteer', params);

export const getSystemSettings = () => get<ISettingForm>('/superAdmin/redis/get');

export const modifySystemSettings = (params: ISettingForm) => put('/superAdmin/redis/set', params);

export const getBanners = () => get<IBanner[]>('/superAdmin/getBannerList');

export const appendBanner = (params: Omit<IBanner, 'id' | 'coverUrl'> & { coverPath: string }) =>
  post('/addBanner', params);

export const modifyBanner = (params: Omit<IBanner, 'coverUrl'> & { coverPath: string }) =>
  put('/modifyBanner', params);

export const deleteBanner = (params: { id: number }) => del('/deleteBanner', params);

export const setBannerList = (params: number[]) => put('/setBannerList', params);

export const getActivityOptions = () => get<OptionType[]>('/getActivities');

export const getLiveOptions = () => get<OptionType[]>('/getLives');