// All TanStack Query keys live here, so invalidation always targets the same keys.
// List keys sit under their `all` prefix, so invalidating the prefix resets every page.
export const queryKeys = {
  profile: ['profile'] as const,
  items: {
    all: ['items'] as const,
    list: (q: string, page: number) => ['items', { q, page }] as const,
  },
  orders: {
    all: ['orders'] as const,
    list: (page: number) => ['orders', 'list', { page }] as const,
  },
  admin: {
    all: ['admin'] as const,
    users: {
      all: ['admin', 'users'] as const,
      list: (page: number) => ['admin', 'users', { page }] as const,
    },
    items: {
      all: ['admin', 'items'] as const,
      list: (q: string, page: number) => ['admin', 'items', { q, page }] as const,
    },
  },
}
