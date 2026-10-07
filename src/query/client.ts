import {MutationCache, QueryClient, QueryKey} from '@tanstack/react-query';

interface AppMutationMeta extends Record<string, unknown> {
  invalidates?: readonly QueryKey[];
}

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: AppMutationMeta;
  }
}

export function createQueryClient() {
  const client = new QueryClient({
    defaultOptions: {
      queries: {retry: false, staleTime: 5000, gcTime: 5 * 60 * 1000},
      mutations: {retry: false},
    },
    mutationCache: new MutationCache({
      onSuccess: async (_data, _variables, _context, mutation) => {
        // A response from a cleared session must not refresh the new account.
        if (
          !client
            .getMutationCache()
            .getAll()
            .some(item => item === mutation)
        )
          return;
        await Promise.all(
          (mutation.meta?.invalidates ?? []).map(queryKey =>
            client.invalidateQueries({queryKey}),
          ),
        );
      },
    }),
  });
  return client;
}
