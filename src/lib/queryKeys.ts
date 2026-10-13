// All TanStack Query keys live here, so invalidation always targets the same keys.
export const queryKeys = {
  profile: ['profile'] as const,
  items: {
    all: ['items'] as const,
    list: (q: string) => ['items', { q }] as const,
  },
  orders: {
    all: ['orders'] as const,
    list: ['orders', 'list'] as const,
  },
  admin: {
    all: ['admin'] as const,
    users: ['admin', 'users'] as const,
    items: {
      all: ['admin', 'items'] as const,
      list: (q: string) => ['admin', 'items', { q }] as const,
    },
  },
}
