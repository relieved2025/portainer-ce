import { columnHelper } from './helper';

export const host = columnHelper.accessor('NodeName', {
  header: '主机',
  cell: ({ getValue }) => {
    const value = getValue();
    return value || '-';
  },
});
