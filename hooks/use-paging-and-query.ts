import { useEffect, useRef, useState } from 'react';
import { isEmptyObject } from '@/utils';

import type { Dispatch, SetStateAction } from 'react';
import type { IPagingParams, IPagingResult, NullableFilter } from '@/utils/http/api-types';

export const usePagingAndQuery = <DataT, FilterFormType extends Record<string, any>>(option: {
  /**@default 12 */
  defaultPageSize?: number;
  pagingRequest: (params: IPagingParams) => Promise<IPagingResult<DataT>>;
  queryRequest: (params: NullableFilter<FilterFormType>) => Promise<DataT[]>;
  filterFormTransform: (form: FilterFormType) => NullableFilter<FilterFormType>;
}) => {
  const isQueryed = useRef(false);

  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<DataT[]>([]);
  const [paginationConfig, setPaginationConfig] = useState<{ current: number; total: number; }>();

  const { defaultPageSize, pagingRequest, queryRequest, filterFormTransform } = option;
  const pageSize = defaultPageSize ?? 12;

  const getList = async (page = 1) => {
    setLoading(true);
    const { records, total } = await pagingRequest({ page, size: pageSize })
      .finally(() => setTimeout(() => setLoading(false), 200));
    setPaginationConfig({ total, current: page });
    setDataSource(records);
  };

  const handleFilterQuery = async (form: FilterFormType) => {
    if(isEmptyObject(form)) return;

    setLoading(true);
    const queryResult = await queryRequest(filterFormTransform(form))
      .finally(() => setTimeout(() => setLoading(false), 200));
    setPaginationConfig({
      current: 1,
      total: queryResult.length,
    });
    setDataSource(queryResult);
    isQueryed.current = true;
  };

  const handlePageChange = (page: number) => {
    if(!isQueryed.current) getList(page);
    else setPaginationConfig({
      ...paginationConfig!,
      current: page,
    });
  };

  const handleFilterReset = () => {
    if(!isQueryed.current) return;

    isQueryed.current = false;
    getList();
  };

  useEffect(() => {
    getList();
  }, []);

  return {
    reload: getList,
    state: {
      loading: [loading, setLoading] as [boolean, Dispatch<SetStateAction<boolean>>],
      dataSource: [dataSource, setDataSource] as [DataT[], Dispatch<SetStateAction<DataT[]>>],
      paginationConfig: {
        ...paginationConfig,
        defaultPageSize: pageSize,
        showSizeChanger: false,
        onChange: handlePageChange,
      },
    },
    handler: {
      handleFilterQuery,
      handleFilterReset,
    },
  };
};