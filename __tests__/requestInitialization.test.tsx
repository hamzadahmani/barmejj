import React, {useEffect} from 'react';
import {act, create} from 'react-test-renderer';
import {beforeEach, expect, it, jest} from '@jest/globals';
import axios from 'axios';
import {getRefreshToken, setRefreshToken} from '../src/services/authToken';
import instance, {AxiosInterceptor} from '../src/services/request';

const mockRequestUse = instance.interceptors.request.use;
const mockResponseUse = instance.interceptors.response.use;
const mockToast = {show: jest.fn()};
jest.mock('axios', () => ({
  post: jest.fn(),
  create: () => ({
    interceptors: {
      request: {use: jest.fn(), eject: jest.fn()},
      response: {use: jest.fn(), eject: jest.fn()},
    },
  }),
}));
jest.mock('native-base', () => ({useToast: () => mockToast}));
jest.mock('../src/components/toast', () => 'Toast');
beforeEach(() => {jest.clearAllMocks(); setRefreshToken(null);});

it('keeps the refresh session when renewal fails temporarily', async () => {
  setRefreshToken('retained-refresh');
  jest.mocked(axios.post).mockRejectedValueOnce({response: {status: 503}});
  let tree!: ReturnType<typeof create>;
  await act(async () => {tree = create(<AxiosInterceptor/>);});
  const reject = jest.mocked(instance.interceptors.response.use).mock.calls[0][1]!;
  await expect(reject({response: {status: 401}, config: {url: 'getUserById', headers: {}}})).rejects.toMatchObject({response: {status: 503}});
  expect(getRefreshToken()).toBe('retained-refresh');
  await act(async () => {tree.unmount();});
});

it('does not refresh a failed sign-in request', async () => {
  setRefreshToken('existing-refresh');
  let tree!: ReturnType<typeof create>;
  await act(async () => {tree = create(<AxiosInterceptor/>);});
  const reject = jest.mocked(instance.interceptors.response.use).mock.calls[0][1]!;
  await expect(reject({response: {status: 401}, config: {url: 'authenticate', headers: {}}})).rejects.toMatchObject({response: {status: 401}});
  expect(axios.post).not.toHaveBeenCalled();
  expect(getRefreshToken()).toBe('existing-refresh');
  await act(async () => {tree.unmount();});
});

it('installs authentication interceptors before mounting screens that fetch data', async () => {
  const mounted = jest.fn();
  function Screen() {
    useEffect(() => {
      expect(mockRequestUse).toHaveBeenCalledTimes(1);
      expect(mockResponseUse).toHaveBeenCalledTimes(1);
      mounted();
    }, []);
    return null;
  }
  let tree!: ReturnType<typeof create>;
  await act(async () => {
    tree = create(
      <AxiosInterceptor>
        <Screen />
      </AxiosInterceptor>,
    );
  });
  expect(mounted).toHaveBeenCalledTimes(1);
  await act(async () => {
    tree.unmount();
  });
  expect(instance.interceptors.request.eject).toHaveBeenCalledTimes(1);
  expect(instance.interceptors.response.eject).toHaveBeenCalledTimes(1);
});
