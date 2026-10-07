import {expect, it, jest} from '@jest/globals';
import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {QueryClientProvider} from '@tanstack/react-query';
import AuthProvider, {
  AuthContextType,
  useAuth,
} from '../src/routes/auth/authProvider';
import {createQueryClient} from '../src/query/client';
import {queryKeys} from '../src/query/keys';
import {expireSession} from '../src/services/authToken';

jest.mock('../src/services/request', () => ({
  __esModule: true,
  default: {post: jest.fn(async () => ({}))},
}));
jest.mock('../src/components/animatedSplash', () => () => null);

it('clears cached queries and mutations on login and session expiration', async () => {
  jest.useFakeTimers();
  const client = createQueryClient();
  let auth!: AuthContextType;
  function Consumer() {
    auth = useAuth();
    return null;
  }
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(
      <QueryClientProvider client={client}>
        <AuthProvider>
          <Consumer />
        </AuthProvider>
      </QueryClientProvider>,
    );
  });
  await act(async () => {
    await jest.advanceTimersByTimeAsync(4000);
  });
  client.setQueryData(queryKeys.profile, {firstName: 'Old'});
  client.getMutationCache().build(client, {mutationFn: async () => undefined});
  await act(async () => {
    auth.login({token: 'new-token', refreshToken: 'refresh', idUser: 2});
  });
  expect(client.getQueryCache().getAll()).toHaveLength(0);
  expect(client.getMutationCache().getAll()).toHaveLength(0);
  expect(auth.userInfo.idUser).toBe(2);
  client.setQueryData(queryKeys.favorites, [{idPlace: 7}]);
  await act(async () => {
    expireSession();
  });
  expect(client.getQueryCache().getAll()).toHaveLength(0);
  expect(auth.user).toBeNull();
  await act(async () => tree.unmount());
  client.clear();
  jest.useRealTimers();
});
