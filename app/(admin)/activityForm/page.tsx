import { Suspense } from 'react';
import { formOperationMap, formTitleMap, FormOperation } from '.';
import { getFormInitialValues } from './action';
import { PageTitle } from '@/components';
import ActivityForm from './components/ActivityForm';
import { Skeleton } from 'antd';

const ActivityFormPageInner = async ({ id, formOperation }: { id?: number, formOperation: FormOperation }) => {

  const initialValues = await getFormInitialValues(id);

  return (
    <>
      <PageTitle title={formTitleMap[formOperation as FormOperation]} />
      <ActivityForm id={id} operation={formOperation as FormOperation} initialValues={initialValues} />
    </>
  );
};

export default async function ActivityFormPage ({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }){
  const query = await searchParams;
  const formOperation = query.operation;
  const activityId = parseInt(query.id ?? '') || void 0;
  
  if(
    !formOperation 
    || !formOperationMap.includes(formOperation)
    || (formOperation !== FormOperation.append && !activityId)
  ) throw new Error('Invalid Params');

  return (
    <Suspense fallback={<Skeleton active />}>
      <ActivityFormPageInner id={activityId} formOperation={formOperation as FormOperation} />
    </Suspense>
  );
};