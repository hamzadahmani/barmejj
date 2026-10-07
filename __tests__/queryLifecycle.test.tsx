import {expect, it, jest} from '@jest/globals';
import React from 'react';
import {AppState} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {focusManager, onlineManager} from '@tanstack/react-query';
import renderer, {act} from 'react-test-renderer';
import NativeQueryLifecycle from '../src/query/NativeQueryLifecycle';

it('tracks mobile focus/connectivity and removes both subscriptions', async () => {
  const remove = jest.fn();
  const unsubscribe = jest.fn();
  const appListener = jest
    .spyOn(AppState, 'addEventListener')
    .mockReturnValue({remove});
  const networkListener = jest
    .mocked(NetInfo.addEventListener)
    .mockReturnValue(unsubscribe);
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<NativeQueryLifecycle />);
  });
  const onAppState = appListener.mock.calls[0][1];
  const onNetwork = networkListener.mock.calls.at(-1)![0];
  onAppState('background');
  expect(focusManager.isFocused()).toBe(false);
  onAppState('active');
  expect(focusManager.isFocused()).toBe(true);
  onNetwork({isConnected: true, isInternetReachable: false} as any);
  expect(onlineManager.isOnline()).toBe(false);
  onNetwork({isConnected: true, isInternetReachable: null} as any);
  expect(onlineManager.isOnline()).toBe(true);
  await act(async () => tree.unmount());
  expect(remove).toHaveBeenCalledTimes(1);
  expect(unsubscribe).toHaveBeenCalledTimes(1);
  appListener.mockRestore();
});
