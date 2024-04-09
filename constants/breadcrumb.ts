import { adminMenuItems } from '.';

export const breadcrumbItemMap: Record<string, string> = {
  '/admins': '管理员管理',
  '/activityDetail': '活动详情',
};
adminMenuItems.forEach(({ key, label }) => breadcrumbItemMap[key as string] = label as string);