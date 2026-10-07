import {beforeEach, describe, expect, it, jest} from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getRecentPlaces, rememberPlace} from '../src/services/discovery';
jest.mock('../src/services/request', () => ({get: jest.fn()}));
beforeEach(async () => {
  await AsyncStorage.clear();
});
describe('discovery history', () => {
  it('isolates accounts, deduplicates and preserves concurrent visits', async () => {
    await Promise.all([
      rememberPlace(1, 7),
      rememberPlace(1, 8),
      rememberPlace(1, 7),
    ]);
    expect(await getRecentPlaces(1)).toEqual([7, 8]);
    expect(await getRecentPlaces(2)).toEqual([]);
  });
  it('recovers from corrupt storage and caps the history at twelve', async () => {
    await AsyncStorage.setItem('discovery:recent:1', 'invalid');
    expect(await getRecentPlaces(1)).toEqual([]);
    for (let id = 1; id <= 15; id++) await rememberPlace(1, id);
    expect(await getRecentPlaces(1)).toHaveLength(12);
  });
});
