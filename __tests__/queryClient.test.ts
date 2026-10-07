import {afterEach, describe, expect, it, jest} from '@jest/globals';
import {InfiniteQueryObserver} from '@tanstack/react-query';
import {createQueryClient} from '../src/query/client';
import {queryKeys} from '../src/query/keys';

describe('Query cache v5', () => {
  const client = createQueryClient();
  client.setDefaultOptions({
    queries: {...client.getDefaultOptions().queries, gcTime: Infinity},
    mutations: {...client.getDefaultOptions().mutations, gcTime: Infinity},
  });
  afterEach(() => client.clear());

  it('shares fresh profile data without a second request', async () => {
    const queryFn = jest.fn(async () => ({firstName: 'Sarra'}));
    const options = {queryKey: queryKeys.profile, queryFn};
    await client.fetchQuery(options);
    expect(await client.fetchQuery(options)).toEqual({firstName: 'Sarra'});
    expect(queryFn).toHaveBeenCalledTimes(1);
  });

  it('invalidates all affected parameter variants, leaving unrelated data fresh', async () => {
    const first = [...queryKeys.discovery, 1, {latitude: 36}];
    const second = [...queryKeys.discovery, 1, {latitude: 37}];
    for (const key of [first, second, queryKeys.favorites, queryKeys.profile]) {
      client.setQueryData(key, []);
    }
    await client
      .getMutationCache()
      .build(client, {
        mutationFn: async () => 'saved',
        meta: {invalidates: [queryKeys.discovery, queryKeys.favorites]},
      })
      .execute(undefined);
    expect(client.getQueryState(first)?.isInvalidated).toBe(true);
    expect(client.getQueryState(second)?.isInvalidated).toBe(true);
    expect(client.getQueryState(queryKeys.favorites)?.isInvalidated).toBe(true);
    expect(client.getQueryState(queryKeys.profile)?.isInvalidated).toBe(false);
  });

  it('does not invalidate or retry a rejected mutation', async () => {
    client.setQueryData(queryKeys.favorites, []);
    const mutationFn = jest.fn(async () => {
      throw new Error('Rejected');
    });
    const mutation = client.getMutationCache().build(client, {
      mutationFn,
      meta: {invalidates: [queryKeys.favorites]},
    });
    await expect(mutation.execute(undefined)).rejects.toThrow('Rejected');
    expect(mutationFn).toHaveBeenCalledTimes(1);
    expect(client.getQueryState(queryKeys.favorites)?.isInvalidated).toBe(
      false,
    );
  });

  it('does not restore previous account data when an old request finishes', async () => {
    let finish!: (value: string) => void;
    const pending = client
      .fetchQuery({
        queryKey: queryKeys.profile,
        queryFn: () =>
          new Promise<string>(resolve => {
            finish = resolve;
          }),
      })
      .catch(() => undefined);
    client.clear();
    client.setQueryData(queryKeys.profile, 'new account');
    finish('previous account');
    await pending;
    expect(client.getQueryData(queryKeys.profile)).toBe('new account');
  });

  it('starts the video feed without a cursor and stops after the final page', async () => {
    const queryFn = jest.fn(
      async ({pageParam}: {pageParam: string | null}) => ({
        items: [pageParam ?? 'first'],
        nextCursor: pageParam ? null : 'next',
      }),
    );
    const observer = new InfiniteQueryObserver(client, {
      queryKey: queryKeys['video-feed-v1'],
      queryFn,
      initialPageParam: null as string | null,
      getNextPageParam: page => page.nextCursor ?? undefined,
    });
    await observer.refetch();
    await observer.fetchNextPage();
    expect(
      observer.getCurrentResult().data?.pages.flatMap(page => page.items),
    ).toEqual(['first', 'next']);
    expect(observer.getCurrentResult().hasNextPage).toBe(false);
    await observer.fetchNextPage();
    expect(queryFn).toHaveBeenCalledTimes(2);
    observer.destroy();
  });

  it('ignores invalidation from a mutation belonging to a cleared session', async () => {
    let finish!: (value: string) => void;
    const mutation = client.getMutationCache().build(client, {
      mutationFn: () =>
        new Promise<string>(resolve => {
          finish = resolve;
        }),
      meta: {invalidates: [queryKeys.profile]},
    });
    const pending = mutation.execute(undefined);
    // Allow the mutation to start before changing accounts.
    await Promise.resolve();
    await Promise.resolve();
    client.clear();
    client.setQueryData(queryKeys.profile, 'new account');
    finish('saved');
    await pending;
    expect(client.getQueryState(queryKeys.profile)?.isInvalidated).toBe(false);
  });
});
