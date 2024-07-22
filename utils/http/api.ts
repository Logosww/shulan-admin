import { get, post, put, del } from '@/utils/http/request';
import {
  Gender,
  ActivityState,
  AdminAccoutState,
  VolunteerSignUpState,
  VolunteerIdentity,
  VolunteerWhitelistState,
  NotificationState,
  VolunteerType,
  Role,
  PayrollState,
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
  ILive,
  IActivityStatistics,
  INotification,
  ICertificate,
  ICheckinRecord,
  IOption,
  IPayrollRecord,
  INoticeRecord,
  INotice,
  IPaymentPreview,
  IPayrollDetail,
} from './api-types';

export const login = (params: ILoginForm) =>
  post<{ role: Role }>('/public/manage/account/smsLogin', {
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

export const deleteActivityDraft = (params: { id: number }) => del('/manage/activity/delete', params);

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
  reviewerId: number;
  school: string;
}>) => post<IVolunteer[]>('/superAdmin/volunteer/search', params);

export const batchModifyVolunteerWhitelistState = (params: { ids: number[]; state: VolunteerWhitelistState; }) =>
  put('/superAdmin/volunteer/changeBatchState', params);

export const batchAddonVolunteerWhitelist = (params: { ids: number[]; expireAt: string | null }) => put('/superAdmin/volunteer/editBatchWhite', params);

export const batchForbidVolunteer = (params: { ids: number[]; releaseAt: string | null }) => put('/superAdmin/volunteer/editBatchViolate', params);

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

export const getCOSPrivateBucketCredentials = () => get<ICOSBucketCredentials>('/public/cos/secret');

export const getCOSPublicBucketCredentials = () => get<ICOSBucketCredentials>('/public/cos/secret2');

export const getPagingSignUpRecords = (params: IPagingParams & { activityId: number }) => get<IPagingResult<ISignUpRecord>>('/manage/activityWorkVolunteer/page', params);

export const filterSignUpRecords = (
  params: NullableFilter<{
    id: number;
    name: string;
    activityWorkId: number;
    activityWorkVolunteerState: VolunteerSignUpState;
    volunteerState: VolunteerWhitelistState;
    purePhoneNumber: string;
    activityWorkVolunteerIdentity: VolunteerType,
    volunteerIdentity: VolunteerIdentity,
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

export const getBanners = () => get<IBanner[]>('/superAdmin/banner/list');

export const appendBanner = (params: Omit<IBanner, 'id' | 'coverUrl'> & { coverPath: string }) =>
  post('/superAdmin/banner/add', params);

export const modifyBanner = (params: Omit<IBanner, 'coverUrl'> & { coverPath: string }) =>
  put('/superAdmin/banner/update', params);

export const deleteBanner = (params: { id: number }) => del('/superAdmin/banner/delete', params);

export const setBannerList = (params: number[]) => put('/superAdmin/banner/setSort', params);

/**
 * 
 * @param isFilter 是否过滤待开始状态前的活动 
 * @returns 
 */
export const getActivityOptions = (params: { isFilter: boolean }) =>
  get<OptionType[], { label: string, id: number }[]>('/selectBox/getActivities', params, { transform: (options) => options.map(({ label, id }) => ({ label, value: id }))});

/**
 * @param isFilter 是否过滤未结束的活动
 * @returns 
 */
export const getLiveOptions = (params: { isFilter: boolean }) =>
  get<OptionType[], { label: string, id: number }[]>('/selectBox/getLives', params, { transform: (options) => options.map(({ label, id }) => ({ label, value: id }))});

export const getActivityTotalClick = (params: { id: number }) => get<number>('/manage/activity/data/viewVolume', params);

export const getActivityTotalShare = (params: { id: number }) => get<number>('/manage/activity/data/shareVolume', params);

export const getActivityTotalSignUp = (params: { id: number }) => get<number>('/manage/activity/data/submitVolume', params);

export const getActivityToBeAudit = (params: { id: number }) => get<number>('/manage/activity/data/auditVolume', params);

export const getActivityAuditPass = (params: { id: number }) => get<number>('/manage/activity/data/auditSuccessVolume', params);

export const getActivityAuditReject = (params: { id: number }) => get<number>('/manage/activity/data/auditFailVolume', params);

export const getActivityCancelled = (params: { id: number }) => get<number>('/manage/activity/data/cancelVolume', params);

export const getActivityIllegalCancelled = (params: { id: number }) => get<number>('/manage/activity/data/violateCancelVolume', params);

export const getActivityFinished = (params: { id: number }) => get<number>('/manage/activity/data/actualParticipateVolume', params);

export const getActivitAtWork = (params: { id: number }) => get<number>('/manage/activity/data/processVolume', params);

export const getActivityOffWork = (params: { id: number }) => get<number>('/manage/activity/data/notArriveVolume', params);

export const getActivityWorksVolume = (params: { id: number }) => get<IActivityStatistics['worksVolume']>('/manage/activity/data/workVolume', params);

export const getExportedVolunteerListKey = (params: { id: number }) => post<string>('/excel/export/activityWorkVolunteer', params);

export const getExportedIdCardPicsZipKey = (params: { id: number }) => post<string>('/zip/exportActivityWorkVolunteerIdPhoto', params);

export const batchSendSmsNotification = (params: { id: number }) => get('/sms/sendActivityReviewNotice', params);

export const getLive = (params: { id: number }) => get<ILive>('/manage/activity/history/get', params);

export const modifyLive = (params: Omit<ILive, 'coverUrl'> & { coverPath: string }) => put('/manage/activity/history/edit', params);

export const deleteLive = (params: { id: number }) => del('/manage/activity/history/delete', params);

export const auditIgnoredVolunteerReject = (params: { id: number }) => put('/manage/activityWorkVolunteer/reviewFailAllBlackList', params);

export const batchImportAndAuditVolunteerSignUpState = (params: { key: string; activityWorkVolunteerState: VolunteerSignUpState }) =>
  put('/excel/importChangeActivityWorkVolunteerStateList', params);

export const batchIgnoreVolunteer = (params: { ids: number[]; reason: string }) => put('/superAdmin/volunteer/editBatchBlack', params);

export const getPagingNotification = (params: IPagingParams & { state?: NotificationState }) => post<IPagingResult<INotification>>('/manage/message/search', params);

export const batchReadNotification = (params: { ids: number[] }) => put('/manage/message/updateState', { state: NotificationState.read, ...params });

export const batchDeleteNotification = (params: { ids: number[] }) => del('/manage/message/deleteBatch', params);

export const getUnreadNotificationCount = () => get<number>('/manage/message/unreadCount');

export const readAllNotification = () => put('/manage/message/readAll');

export const getActivityCertificate = (params: { id: number }) => get<ICertificate>('/manage/activity/certificate/get', params);

export const modifyActivityCertificate = (params: Omit<ICertificate, 'coverUrl'> & { coverPath: string }) => put('/manage/activity/certificate/edit', params);

export const deleteActivityCertificate = (params: { id: number }) => del('/manage/activity/certificate/delete', params);

export const getPagingCheckinRecords = (params: IPagingParams & { activityId: number }) => get<IPagingResult<ICheckinRecord>>('/manage/activityWorkVolunteer/check/page', params);

export const filterCheckinRecords = (params: NullableFilter<{
  activityWorkId: number;
  activityWorkVolunteerIdentity: VolunteerType;
  purePhoneNumber: string;
  name: string;
  id: number;
  sex: Gender;
  isChecked: boolean;
}> & { activityId: number }) => post<ICheckinRecord[]>('/manage/activityWorkVolunteer/check/search', params);

export const getUsersByRole = (params: { code: Role }) => get<IOption[]>('/selectBox/getRoleUser', params);

export const getAllExportedVolunteerListKey = () => post<string>('/superAdmin/excel/export/volunteer');

export const getPagingPayrollRecords = (params: IPagingParams & { activityId: number }) => get<IPagingResult<IPayrollRecord>>('/manage/activityWorkVolunteerTransferOrder/page', params);

export const filterPayrollRecords = (params: NullableFilter<{
  id: number;
  name: string;
  phone: string;
  activityWorkId: number;
  wxmpUserTransferOrderState: PayrollState;
}> & { activityId: number }) => post<IPayrollRecord[]>('/manage/activityWorkVolunteerTransferOrder/search', params);

export const doPaymentToSingle = (params: { id: number; money: number; title: string; smsCode: string; remark: string }) => post('/superAdmin/activityWorkVolunteerTransferOrder/transfer', params);

export const doPaymentToAll = (params: { id: number; title: string; smsCode: string; remark: string }) => post('/superAdmin/activityWorkVolunteerTransferOrder/batchTransfer', params);

export const sendPaymentVerifySmsCode = (params: { purePhoneNumber: string }) => post('/superAdmin/sms/sendTransferOrderVerify', { countryCode: '86', ...params });

export const getPaymentToAllPreview = (params: { id: number }) => get<IPaymentPreview>('/manage/activityWorkVolunteerTransferOrder/preview', params);

export const getPayrollDetails = (params: { id: number }) => get<IPayrollDetail[]>('/manage/activityWorkVolunteerTransferOrder/transferDetail', params);

export const exportPayrollRecords = (params: { id: number }) => post<string>('/excel/export/activityTransferOrder', params);

export const getPagingNoticeRecords = (params: IPagingParams & { activityId: number }) => get<IPagingResult<INoticeRecord>>('/manage/activityWorkVolunteerNotice/page', params); 

export const filterNoticeRecords = (params: NullableFilter<{
  isSend: boolean;
  activityWorkId: number;
} & Pick<INoticeRecord, 
  | 'id'
  | 'name'
  | 'phone'
  | 'readState'
  | 'activityWorkVolunteerState'
  | 'activityWorkVolunteerIdentity'
  >
> & { activityId: number }) => post<INoticeRecord[]>('/manage/activityWorkVolunteerNotice/search', params);

export const getNoticeContent = (params: { id: number }) => get<INotice>('/manage/activityWorkVolunteerNotice/get', params);

export const sendNoticeToSingle = (params: { id: number } & INotice) => post('/manage/activityWorkVolunteerNotice/send', params);

export const sendNoticeToAll = (params: { activityId: number; activityWorkId: number } & INotice) => post('/manage/activityWorkVolunteerNotice/sendAll', params);