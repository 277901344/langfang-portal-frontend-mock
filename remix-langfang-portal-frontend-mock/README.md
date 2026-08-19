# Langfang Portal Frontend Mock

This is an isolated pure-frontend extraction of `langfang-portal/frontend`.

- No backend service is required.
- Auth, captcha, registration, current user, SSO URL, product list, product filters, and product detail are served from local mock functions.
- The original `langfang-portal/frontend` directory is not modified.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Mock API adapters live in:

- `src/lib/auth.ts`
- `src/lib/products.ts`
