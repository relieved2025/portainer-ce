import { Environment } from '@/react/portainer/environments/types';
import { UserContext } from '@/react/hooks/useUser';
import { UserViewModel } from '@/portainer/models/user';
import { renderWithQueryClient } from '@/react-tools/test-utils';
import { rest, server } from '@/setup-tests/server';

import { EnvironmentList } from './EnvironmentList';

test('when no environments for query should show empty list message', async () => {
  const { findByText } = await renderComponent(false, []);

  await expect(findByText('No environments available.')).resolves.toBeVisible();
});

test('when user is not admin and no environments at all should show empty list info message', async () => {
  const { findByText } = await renderComponent(false, []);

  await expect(
    findByText(
      '您没有访问任何环境的权限。请联系您的管理员。'
    )
  ).resolves.toBeVisible();
});

test('when user is an admin and no environments at all should show empty list info message', async () => {
  const { findByText } = await renderComponent(true);

  await expect(
    findByText(/无环境可用于管理。请前往/)
  ).resolves.toBeVisible();
});

async function renderComponent(
  isAdmin = false,
  environments: Environment[] = []
) {
  const user = new UserViewModel({ Username: 'test', Role: isAdmin ? 1 : 2 });

  server.use(
    rest.get('/api/endpoints', (req, res, ctx) =>
      res(
        ctx.set('x-total-available', environments.length.toString()),
        ctx.set('x-total-count', environments.length.toString()),
        ctx.json(environments)
      )
    )
  );

  const queries = renderWithQueryClient(
    <UserContext.Provider value={{ user }}>
      <EnvironmentList onClickBrowse={jest.fn()} onRefresh={jest.fn()} />
    </UserContext.Provider>
  );

  await expect(queries.findByText('环境')).resolves.toBeVisible();

  return queries;
}
