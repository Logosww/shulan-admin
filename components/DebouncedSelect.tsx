'use client';

import debounce from 'lodash-es/debounce';
import React, { useMemo, useRef, useState } from 'react';
import { Select, Spin } from 'antd';

import type { SelectProps } from 'antd';
import type { BaseOptionType, DefaultOptionType } from 'antd/es/select';


interface DebounceSelectProps<
  ValueType extends string | number = string,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
>
  extends Omit<SelectProps<ValueType | ValueType[], OptionType>, 'options' | 'children'> {
  fetchOptions: (search: string) => Promise<OptionType[]>;
  debounceTimeout?: number;
}

export const DebounceSelect = <
  ValueType extends string | number = string,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
>({ fetchOptions, debounceTimeout = 800, ...props }: DebounceSelectProps<ValueType, OptionType>) => {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<OptionType[]>([]);
  const fetchRef = useRef(0);

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);

      fetchOptions(value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }

        setOptions(newOptions);
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  return (
    <Select<ValueType | ValueType[], OptionType>
      filterOption={false}
      showSearch={true}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      {...props}
      options={options}
    />
  );
};