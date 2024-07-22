import { Suspense } from 'react';
import { Layout } from '@/components';
import LoadingUI from './loading';

const PendingBlank = async () => new Promise<null>(resolve => setTimeout(() => resolve(null), 1500));

const AdminLayout = ({ children }: React.PropsWithChildren) => (
  <Suspense fallback={<LoadingUI />}>
    <Layout>{children}</Layout>
    <PendingBlank />
  </Suspense>
);

export default AdminLayout;