# modu-next

Frontend for the Modu clothing marketplace. Next.js 14 (Pages Router) + MUI + Apollo, built to `DEVELOPMENT_STANDARDS.md`.

## Run

```bash
yarn            # install
yarn dev        # http://localhost:3000
yarn build      # production build
```

The backend (`../modu-nest`) must be running: `npm run start:dev` there serves GraphQL on `:3011`.

## Env

Copy `.env.example` to `.env.development`:

```
REACT_APP_API_URL=http://localhost:3011
REACT_APP_API_GRAPHQL_URL=http://localhost:3011/graphql
REACT_APP_API_WS=ws://localhost:3011
```

## Routes

| Route | |
| --- | --- |
| `/` | Home |
| `/product`, `/product/detail?id=` | Catalog with filters, product page |
| `/seller`, `/member?memberId=` | Shop directory, member / shop profile |
| `/community`, `/community/detail?id=` | Lookbook, style tips, news, Q&A |
| `/cart` | Cart and checkout |
| `/mypage?category=` | Orders, returns, favorites, profile; seller tools for sellers |
| `/account/join` | Login / sign up |
| `/_admin/*` | Users, products, orders, returns, community (ADMIN only) |

Locales: `en` (default), `kr`, `ru` — dictionaries in `public/locales/<lang>/common.json`.
