# Shop (web)

A small online shop. This is the frontend. People can browse items, fill a cart, place orders and manage their profile. Admins can manage users and items.

It talks to a separate Rails API (`shop-api`).

## Live URLs

- App (Vercel): `https://shop-web-weld.vercel.app/` (placeholder, replace after deploy)
- API (Render): `https://shop-api-bqg2.onrender.com`

## Stack

- Vite 8, React 19, TypeScript
- Tailwind CSS 4 and shadcn/ui
- React Router 7
- TanStack Query 5 for server data
- axios for HTTP
- oxlint for linting

## Scripts

Install first with `npm install`.

- `npm run dev` starts the dev server at http://localhost:5173.
- `npm run build` checks types and builds the app into `dist/`.
- `npm run lint` runs oxlint.
- `npm test` runs the unit tests once with Vitest.
- `npm run test:watch` re-runs the unit tests on every change.

## Tests

The unit tests cover the small functions the app relies on:

- money and price formatting
- quantity limits (1 to 99)
- the cart reducer
- reading the saved cart from the browser
- API error messages shown to the user
- parsing unavailable items at checkout

The tests run in Node. No browser is needed.

Each test file sits next to the code it tests, as `*.test.ts`. For example, `src/lib/format.test.ts` tests `src/lib/format.ts`.

## Environment

One variable is needed: `VITE_API_URL`. It is the base URL of the API, without a trailing slash.

The build fails if it is missing.

**Local API.** Copy `.env.example` to `.env`. It points to `http://localhost:3000`:

```
VITE_API_URL=http://localhost:3000
```

Start `shop-api` on port 3000, then run `npm run dev`.

**Deployed API.** Set the variable to the Render URL:

```
VITE_API_URL=https://shop-api-bqg2.onrender.com
```

On Vercel, add it in the project settings. On the API side, `CORS_ORIGINS` must contain the URL of this app.

The API origin must also be listed in `connect-src` of the Content-Security-Policy in `vercel.json` (that file cannot read env vars). The build fails with a clear message if it is missing. Local builds against `localhost` skip this check.

## How it talks to the API

- Requests are JSON.
- `POST /signup` and `POST /login` return the token in the `Authorization` response header. The app sends it back as `Authorization: Bearer <token>`.
- A `401` answer logs the user out and opens the login page.
- Money values arrive as strings. They are converted only for display and calculations.

## Features

- Sign up, log in, log out
- Catalog with debounced search
- Cart saved in the browser
- Checkout and order history with expandable lines
- Profile: personal data and password
- Admin area: users and items (admins only)
- Offline notice, error screen and page titles

## Project folders

- `src/api` request functions
- `src/hooks` query and mutation hooks
- `src/lib` axios instance, query client, helpers
- `src/context` auth and cart contexts
- `src/pages` route pages
- `src/components` shared components
- `src/components/ui` shadcn/ui components (generated)

## Demo accounts

| Role  | Email             | Password      |
| ----- | ----------------- | ------------- |
| Admin | admin@example.com | The password is provided to reviewers separately   |
| User  | user@example.com  | password123 (also, anyone can sign up)   |

## Security notes

The login token (a JWT) is stored in `localStorage`. The main risk is XSS: a script injected into the page could read the token.

What reduces this risk:

- React escapes output by default.
- The code never uses `dangerouslySetInnerHTML`.
- The token lives for one day.
- The server revokes the token on logout.
- Security headers set in `vercel.json`: a Content-Security-Policy (scripts only from the app itself, API calls only to the app and the API origin), `X-Content-Type-Options`, `Referrer-Policy` and `X-Frame-Options`.

The alternative is an HttpOnly cookie. It was not chosen. The API (Render) and the frontend (Vercel) are on different sites. So the cookie would be third-party, and some browsers block it. It would need a proxy or a shared domain.

An HttpOnly cookie also does not remove XSS. It only stops the token from being read.
