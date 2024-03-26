import { Package } from 'lucide-react';

import { useEnvironmentId } from '@/react/hooks/useEnvironmentId';
import Subscription from '@/assets/ico/subscription.svg?c';

import { PageHeader } from '@@/PageHeader';
import { DashboardItem } from '@@/DashboardItem';
import { DashboardGrid } from '@@/DashboardItem/DashboardGrid';

import { useResourceGroups } from '../queries/useResourceGroups';
import { useSubscriptions } from '../queries/useSubscriptions';

export function DashboardView() {
  const environmentId = useEnvironmentId();

  const subscriptionsQuery = useSubscriptions(environmentId);

  const resourceGroupsQuery = useResourceGroups(
    environmentId,
    subscriptionsQuery.data
  );

  const subscriptionsCount = subscriptionsQuery.data?.length;
  const resourceGroupsCount = Object.values(
    resourceGroupsQuery.resourceGroups
  ).flatMap((x) => Object.values(x)).length;

  return (
    <>
      <PageHeader title="首页" breadcrumbs={[{ label: '仪表盘' }]} />

      <div className="mx-4">
        {subscriptionsQuery.data && (
          <DashboardGrid>
            <DashboardItem
              value={subscriptionsCount as number}
              isLoading={subscriptionsQuery.isLoading}
              isRefetching={subscriptionsQuery.isRefetching}
              icon={Subscription}
              type="订阅"
            />
            {!resourceGroupsQuery.isError && !resourceGroupsQuery.isLoading && (
              <DashboardItem
                value={resourceGroupsCount}
                isLoading={resourceGroupsQuery.isLoading}
                icon={Package}
                type="资源组"
              />
            )}
          </DashboardGrid>
        )}
      </div>
    </>
  );
}
