import { adminMenuItems } from '.';

export const breadcrumbItemMap: Record<string, string> = {
  '/activityDetail': '活动详情',
  '/notification': '消息通知',
};
adminMenuItems.forEach(({ key, label }) => breadcrumbItemMap[key as string] = label as string);