import type { ItemType } from "antd/es/menu/hooks/useItems"
import type { ProSchemaValueEnumType } from "@ant-design/pro-components";
import type { ReactNode } from "react";

export const valueEnum2MenuItem = <Enum = number>(valueEnum: Map<Enum, string | ProSchemaValueEnumType>, exclude?: Enum[]) => {
  const items: { key: Enum; label: ReactNode }[] = [];
  valueEnum.forEach((value, key) => items.push({
    key,
    label: typeof value === 'string' ? value : value.text,
  }));
  return (exclude ? items.filter(item => !exclude.includes(item.key)) : items) as ItemType[];
};