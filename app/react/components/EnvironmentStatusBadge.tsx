import { CheckCircle, XCircle } from 'lucide-react';

import { EnvironmentStatus } from '@/react/portainer/environments/types';

import { EnvironmentStatusBadgeItem } from './EnvironmentStatusBadgeItem';

interface Props {
  status: EnvironmentStatus;
}

export function EnvironmentStatusBadge({ status }: Props) {
  return status === EnvironmentStatus.Up ? (
    <EnvironmentStatusBadgeItem color="success" icon={CheckCircle}>
      已启动
    </EnvironmentStatusBadgeItem>
  ) : (
    <EnvironmentStatusBadgeItem color="danger" icon={XCircle}>
      已停止
    </EnvironmentStatusBadgeItem>
  );
}