import _ from 'lodash';
import clsx from 'clsx';
import { CellContext } from '@tanstack/react-table';

import { Task } from '@/react/nomad/types';

import { filterHOC } from '@@/datatables/Filter';

import { columnHelper } from './helper';

export const taskStatus = columnHelper.accessor('State', {
  header: '任务状态',
  id: 'status',
  meta: {
    filter: filterHOC('按状态筛选'),
  },
  cell: StateCell,
  enableColumnFilter: true,
});

function StateCell({ getValue }: CellContext<Task, string>) {
  const state = getValue();
  const className = getClassName();

  return <span className={clsx('label', className)}>{state}</span>;

  function getClassName() {
    if (['dead'].includes(_.toLower(state))) {
      return 'label-danger';
    }

    if (['pending'].includes(_.toLower(state))) {
      return 'label-warning';
    }

    return 'label-success';
  }
}
