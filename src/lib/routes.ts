// Pages only a regular user can open; an admin is sent to the admin area instead.
export const USER_ONLY_PATHS = ['/', '/cart', '/orders']

// Where the shop name and a login without a remembered page lead.
export function homePath(isAdmin: boolean) {
  return isAdmin ? '/admin' : '/'
}
