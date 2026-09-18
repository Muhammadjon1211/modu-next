# Development Standards — Nestar Next (Reusable Project Blueprint)

> This document describes the architecture, conventions, naming rules, folder structure and coding
> logic used in this project. It is written so it can be handed to an AI agent or a developer as a
> **prompt / specification** to scaffold a **new project** with exactly the same standards.
>
> Wherever you read `Property` / `property`, that is the **primary domain entity** of this project.
> In a new project, replace it with your own entity (e.g. `Product`, `Course`, `Car`) and keep the
> exact same structure, prefixing and file layout.

---

## 1. Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | **Next.js 14 — Pages Router** | Not App Router. `pages/` directory, `_app.tsx`, `_document.tsx`. |
| Language | **TypeScript 4.6**, `strict: true` | `target: es5`, `moduleResolution: node`, `jsx: preserve`, `noEmit`. |
| UI kit | **MUI v5** (`@mui/material`, `@mui/icons-material`, `@mui/lab`, `@mui/x-date-pickers-pro`) | Layout is built from `Stack` / `Box` / `Typography`, not raw divs. |
| Styling | **SCSS (global, non-modular)** + MUI theme override | No CSS Modules, no Tailwind, no styled-components for layout. |
| Data layer | **Apollo Client 3 + GraphQL** | Single GraphQL backend (NestJS). REST only for static file paths. |
| Global state | **Apollo Reactive Variables** (`makeVar`) | No Redux, no Zustand, no Context providers for app state. |
| Auth | **JWT in `localStorage`**, decoded with `jwt-decode` | Token attached via an Apollo `ApolloLink` header middleware. |
| Realtime | **WebSocketLink** (`subscriptions-transport-ws`) | Chat + notifications. |
| i18n | **next-i18next** (`en`, `kr`, `ru`) | JSON dictionaries in `public/locales/<lang>/common.json`. |
| Alerts | **SweetAlert2** wrapped in a single helper module | Never call `Swal.fire` directly from a component. |
| Uploads | `apollo-upload-client` + `browser-image-compression` | GraphQL multipart upload. |
| Rich text | `@toast-ui/react-editor` | Community article write/view. |
| Carousel | `swiper` (+ `react-slick` legacy) | |
| 3D | `@react-three/fiber` + `drei` + `three` | Optional decorative section. |
| Package manager | **yarn** (`yarn.lock` committed) | |
| Versioning | **standard-version** → `CHANGELOG.md` | `yarn changelog` (`--skip.tag`). |

### Scripts

```json
"dev": "next dev",
"build": "next build",
"start": "next start",
"lint": "next lint",
"changelog": "standard-version --skip.tag"
```

---

## 2. Formatting & Code Style (non-negotiable)

`.prettierrc`:

```json
{
  "extends": "eslint:recommended",
  "tabWidth": 2,
  "useTabs": true,
  "singleQuote": true,
  "trailingComma": "all",
  "semi": true,
  "printWidth": 120,
  "endOfLine": "auto"
}
```

Rules that follow from it and from the existing code:

- **Tabs**, width 2. Never spaces for indentation.
- **Single quotes**, always semicolons, trailing commas everywhere.
- **120 char** line width.
- JSX string props are frequently written as expressions with single quotes:
  `className={'container'}`, `component={'div'}`, `color={'default'}`.
  Both `className="top"` and `className={'top'}` appear; prefer the `{'...'}` form for new code.
- No barrel `index.ts` re-exports except `libs/auth/index.ts` and `scss/MaterialTheme/index.ts`.
- **Relative imports only** — no `@/` path aliases are configured. Example from a page:
  `import useDeviceDetect from '../../libs/hooks/useDeviceDetect';`
- `// @ts-ignore` is used pragmatically at known-bad third-party boundaries (upload link, theme
  creation, loosely typed props). Acceptable, but keep it to one line and localized.

---

## 3. Folder Structure

```
/
├── apollo/                     # GraphQL layer (client + documents + global store)
│   ├── client.ts               # Apollo Client factory, links, SSR-safe singleton
│   ├── store.ts                # Reactive vars (global state)
│   ├── user/
│   │   ├── query.ts            # All user-facing queries
│   │   └── mutation.ts         # All user-facing mutations
│   └── admin/
│       ├── query.ts            # All admin queries
│       └── mutation.ts         # All admin mutations
│
├── libs/                       # Everything non-route
│   ├── auth/index.ts           # logIn / signUp / logOut / token & user hydration
│   ├── config.ts               # Env-derived constants, static option lists, Messages
│   ├── utils.ts                # Pure helpers + shared mutation handlers
│   ├── sweetAlert.ts           # All SweetAlert2 wrappers
│   ├── hooks/                  # Custom hooks (useDeviceDetect.ts)
│   ├── enums/                  # <domain>.enum.ts — mirrors backend enums exactly
│   ├── types/                  # <domain>/<domain>.ts | .input.ts | .update.ts
│   └── components/             # All React components, grouped by feature
│       ├── layout/             # withLayoutX HOCs
│       ├── common/             # Cross-feature cards & shared widgets
│       ├── homepage/
│       ├── property/           # (the domain entity feature folder)
│       ├── agent/
│       ├── member/
│       ├── mypage/
│       ├── community/
│       ├── cs/
│       ├── admin/              # Admin-only components, mirrored by subdomain
│       │   ├── users/  properties/  community/  cs/
│       │   └── AdminMenuList.tsx
│       └── Top.tsx  Footer.tsx  Chat.tsx     # Global chrome, kept at components/ root
│
├── pages/                      # Routes only — thin, no business logic
│   ├── _app.tsx  _document.tsx  index.tsx
│   ├── property/{index,detail}.tsx
│   ├── agent/{index,detail}.tsx
│   ├── community/{index,detail}.tsx
│   ├── member/index.tsx  mypage/index.tsx  cs/index.tsx  about/index.tsx
│   ├── account/join.tsx        # combined login + signup
│   └── _admin/                 # underscore = "not a public route family"
│       ├── index.tsx  users/  properties/  community/  cs/{faq,notice,inquiry}.tsx
│
├── scss/
│   ├── app.scss                # global reset + base tags + #pc-wrap container
│   ├── variables.scss          # font import + $font
│   ├── reset.scss
│   ├── pc/                     # desktop styles, one file per page/feature
│   │   ├── main.scss           # imports every pc partial
│   │   ├── general.scss
│   │   └── homepage/ property/ agent/ mypage/ community/ cs/ member/ account/ admin/ about/
│   ├── mobile/{main,general}.scss
│   └── MaterialTheme/{index,typography,shadow,styled}.ts
│
├── public/
│   ├── img/{logo,icons,banner,profile,property,community,events,flag,fiber}/
│   ├── video/
│   └── locales/{en,kr,ru}/common.json
│
├── next.config.js  next-i18next.config.js  tsconfig.json  .prettierrc
├── .env.development  .env.local            # gitignored
└── CHANGELOG.md  README.md
```

**Principle:** `pages/` holds *routes*, `libs/` holds *everything else*, `apollo/` holds *the data
contract*. A page never defines a reusable component; it composes components from `libs/components`.

---

## 4. Naming Conventions

### Files

| Kind | Convention | Example |
| --- | --- | --- |
| React component | `PascalCase.tsx` | `PropertyCard.tsx`, `TopAgents.tsx`, `MyProfile.tsx` |
| Page route | `lowercase.tsx` / `index.tsx` | `pages/property/detail.tsx` |
| Admin route family | folder prefixed `_` | `pages/_admin/users/index.tsx` |
| Hook | `useCamelCase.ts` | `useDeviceDetect.ts` |
| Enum module | `kebab-domain.enum.ts` | `board-article.enum.ts`, `member.enum.ts` |
| Type module | `<domain>.ts` / `.input.ts` / `.update.ts` | `property.input.ts` |
| SCSS partial | `camelCase.scss` (multiword) / `lowercase.scss` | `addNewProperty.scss`, `detail.scss` |

### Code

- **Components**: `PascalCase`, default-exported at the bottom: `export default PropertyCard;`
- **Layout HOCs**: `withLayoutBasic`, `withLayoutFull`, `withLayoutHome`, `withAdminLayout`
  — `camelCase` starting with `with`, default export.
- **Handlers**: `<action>Handler` — `sortingHandler`, `likePropertyHandler`,
  `handlePaginationChange`, `redirectToMemberPageHandler`. Prefer the `xxxHandler` suffix form.
- **State**: `const [value, setValue]`, explicitly typed when not obvious:
  `useState<Property[]>([])`, `useState<number>(0)`, `useState<null | HTMLElement>(null)`.
- **Enums**: `PascalCase` name, `SCREAMING_SNAKE` members whose value equals the member name:
  ```ts
  export enum PropertyStatus { ACTIVE = 'ACTIVE', SOLD = 'SOLD', DELETE = 'DELETE' }
  ```
- **GraphQL documents**: `SCREAMING_SNAKE_CASE` consts — `GET_AGENTS`, `LOGIN`, `SIGN_UP`,
  `LIKE_TARGET_PROPERTY`.
- **Entity field prefixing (important)**: every field of an entity is prefixed with the entity name.
  `memberNick`, `memberPhone`, `memberType`, `propertyTitle`, `propertyPrice`, `propertyLocation`,
  `commentContent`, `articleTitle`. Ids are `_id` (Mongo); foreign keys are `memberId`,
  `propertyId`, `commentRefId`, `likeRefId`.
- **Inquiry / pagination objects**: `<Entity>Inquiry` — always `{ page, limit, sort?, direction?, search }`.
- **CSS class names**: kebab/lowercase, semantic and nested — `card-config`, `name-address`,
  `list-config`, `pagination-config`, `main-config`, `filter-config`, `no-data`, `top-badge`.
  Page roots use an `id`: `id="property-list-page"`, `id="my-page"`, `id="pc-wrap"`, `id="mobile-wrap"`.

---

## 5. Type System Contract

Each domain gets a folder under `libs/types/<domain>/` with up to three files.

**`<domain>.ts` — the entity as returned by the API**

```ts
export interface Property {
	_id: string;
	propertyType: PropertyType;          // enums, never raw strings
	propertyStatus: PropertyStatus;
	propertyTitle: string;
	propertyPrice: number;
	propertyImages: string[];
	propertyDesc?: string;               // optional == nullable in backend
	memberId: string;
	soldAt?: Date;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation **/             // mark aggregation-only fields with this comment
	meLiked?: MeLiked[];
	memberData?: Member;
}

export interface Properties {          // plural = paginated list envelope
	list: Property[];
	metaCounter: TotalCounter[];
}
```

**`<domain>.input.ts` — create + query inputs**

```ts
export interface PropertyInput { /* fields required to create */ }

interface PISearch {                   // private, not exported; short acronym name
	memberId?: string;
	typeList?: PropertyType[];
	pricesRange?: Range;
	text?: string;
}

export interface PropertiesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: PISearch;
}
```

**`<domain>.update.ts` — partial update**

```ts
export interface PropertyUpdate {
	_id: string;                         // required
	propertyTitle?: string;              // everything else optional
}
```

Shared helpers live in `libs/types/common.ts`:

```ts
export interface T { [key: string]: any; }   // escape hatch for loose props / onCompleted payloads
```

`TotalCounter { total: number }` lives beside the main entity and is reused by every list envelope.
`CustomJwtPayload` (in `libs/types/customJwtPayload.ts`) `extends JwtPayload` and holds the flattened
member claims.

**Enums mirror the backend one-to-one** and live in `libs/enums/`. `common.enum.ts` holds
`Direction { ASC, DESC }` and the `Message` enum of canonical error strings.

---

## 6. Apollo / Data Layer

### 6.1 Client (`apollo/client.ts`)

- Module-level singleton `apolloClient` + `initializeApollo(initialState)` + `useApollo(initialState)`
  (memoized hook, used once in `_app.tsx`).
- `createIsomorphicLink()` only builds links **in the browser** (`typeof window !== 'undefined'`),
  which keeps SSR safe.
- Link chain, in order: `from([errorLink, tokenRefreshLink, splitLink])`, where `splitLink` routes
  `subscription` operations to `WebSocketLink` and everything else to `authLink.concat(uploadLink)`.
- `authLink` injects `Authorization: Bearer <token>` from `getJwtToken()` per operation.
- `errorLink` (`onError`) logs GraphQL + network errors and reserves a branch for `401`.
- `createUploadLink` (not `createHttpLink`) so file uploads work over the same endpoint.
- Cache: plain `new InMemoryCache()`, `ssrMode: typeof window === 'undefined'`.

### 6.2 Global state (`apollo/store.ts`)

```ts
export const userVar = makeVar<CustomJwtPayload>({ _id: '', memberType: '', /* …zeroed numbers */ });
export const themeVar = makeVar({});
```

Read anywhere with `const user = useReactiveVar(userVar);`.
**Never** introduce Redux/Context for app state — add a new `makeVar` instead.

### 6.3 GraphQL documents

- Split by audience: `apollo/user/*` vs `apollo/admin/*`; each split into `query.ts` / `mutation.ts`.
- Grouped with banner comments:
  ```ts
  /**************************
   *         MEMBER         *
   *************************/
  ```
- Written with `gql` template literals, operation named in PascalCase, single `$input` variable:
  ```ts
  export const GET_AGENTS = gql`
  	query GetAgents($input: AgentsInquiry!) {
  		getAgents(input: $input) { list { ...fields } metaCounter { total } }
  	}
  `;
  ```
- Field selections are written out explicitly (no fragments in this codebase).
- **One `$input` argument per operation** is the house style, matching the NestJS DTO inputs.

### 6.4 Using data in components

```tsx
/** APOLLO REQUESTS **/
const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

const { loading, data, error, refetch } = useQuery(GET_PROPERTIES, {
	fetchPolicy: 'cache-and-network',
	variables: { input: searchFilter },
	notifyOnNetworkStatusChange: true,
	onCompleted: (data: T) => {
		setProperties(data?.getProperties?.list);
		setTotal(data?.getProperties?.metaCounter[0]?.total ?? 0);
	},
});
```

- Server results are copied into local `useState` in `onCompleted`, and the component renders from
  that state. After a mutation, call `await refetch({ input: searchFilter })`.
- Auth-critical mutations in `libs/auth` bypass hooks and use
  `apolloClient.mutate({ ..., fetchPolicy: 'network-only' })`.

---

## 7. Authentication Logic (`libs/auth/index.ts`)

The exact flow to reproduce:

1. `logIn(nick, password)` → `requestJwtToken()` runs the `LOGIN` mutation → returns
   `{ jwtToken: accessToken }`.
2. `updateStorage({ jwtToken })` → `localStorage.setItem('accessToken', token)` **and**
   `localStorage.setItem('login', Date.now().toString())` (cross-tab signal).
3. `updateUserInfo(jwtToken)` → `jwt-decode` into `CustomJwtPayload` → populate `userVar(...)`,
   defaulting every field (`claims.x ?? ''`) and substituting `/img/profile/defaultUser.svg`
   for a missing avatar.
4. `signUp(nick, password, phone, type)` mirrors the same three steps via `SIGN_UP`.
5. `logOut()` → `deleteStorage()` (remove token, set `logout` timestamp) + `deleteUserInfo()`
   (reset `userVar` to the zeroed object).
6. Backend error strings are mapped to user-facing alerts in a `switch` on
   `err.graphQLErrors[0].message`, then a generic `throw new Error('token error')` is rethrown.
7. **Rehydration**: every layout HOC runs
   ```ts
   useEffect(() => { const jwt = getJwtToken(); if (jwt) updateUserInfo(jwt); }, []);
   ```
8. **Guarding**: pages guard by redirect inside `useEffect`
   (`if (!user._id) router.push('/')`); the admin layout additionally returns `null` unless
   `user.memberType === MemberType.ADMIN`.

---

## 8. Layout System (HOC pattern)

Four HOCs in `libs/components/layout/`, each shaped as
`const withLayoutX = (Component: any) => (props: any) => …`:

| HOC | Used by | Chrome |
| --- | --- | --- |
| `withLayoutHome` | `/` | `Top` + full-height hero header + `Footer` |
| `withLayoutBasic` | list/detail/mypage/community/cs/account | `Top` + `.header-basic` banner (title/desc/bgImage) + `Footer` + `Chat` |
| `withLayoutFull` | detail pages needing no banner | `Top` + content + `Footer` |
| `withAdminLayout` | everything under `/_admin` | MUI `AppBar` + `Drawer` (`drawerWidth = 280`) + `AdminMenuList` |

Every page ends with `export default withLayoutBasic(PageComponent);`.

The banner title/description/background is resolved by a `useMemo` **switch on `router.pathname`**
inside `withLayoutBasic` — that is the single place page banners are configured:

```ts
const memoizedValues = useMemo(() => {
	let title = '', desc = '', bgImage = '';
	switch (router.pathname) {
		case '/property':
			title = 'Property Search';
			desc = 'We are glad to see you again!';
			bgImage = '/img/banner/properties.png';
			break;
		// …one case per route
	}
	return { title, desc, bgImage };
}, [router.pathname]);
```

Each layout renders `<Head><title>…</title></Head>`, then `#pc-wrap` (or `#mobile-wrap`) containing
`#top`, `#main`, `#footer` stacks. `<Chat />` renders only when `user?._id` exists.

`_document.tsx` carries the static SEO block: `robots`, favicon, and a multilingual
`description`/`keyword` meta pair.

---

## 9. Page & Component Anatomy (copy this skeleton)

### Page

```tsx
import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Stack, Pagination } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';

export const getStaticProps = async ({ locale }: any) => ({
	props: { ...(await serverSideTranslations(locale, ['common'])) },
});

const PropertyList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [searchFilter, setSearchFilter] = useState<PropertiesInquiry>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [properties, setProperties] = useState<Property[]>([]);
	const [total, setTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/

	/** LIFECYCLES **/

	/** HANDLERS **/

	if (device === 'mobile') {
		return <h1>PROPERTIES MOBILE</h1>;
	} else {
		return <div id="property-list-page">{/* desktop JSX */}</div>;
	}
};

PropertyList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			squaresRange: { start: 0, end: 500 },
			pricesRange: { start: 0, end: 2000000 },
		},
	},
};

export default withLayoutBasic(PropertyList);
```

**Mandatory section comments, in this exact order and spelling:**

```
/** APOLLO REQUESTS **/
/** LIFECYCLES **/
/** HANDLERS **/
```

### Component

```tsx
interface PropertyCardType {           // props interface named <Component>Type
	property: Property;
	likePropertyHandler?: any;
	myFavorites?: boolean;
}

const PropertyCard = (props: PropertyCardType) => {
	const { property, likePropertyHandler, myFavorites } = props;   // destructure on line 1
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);

	if (device === 'mobile') return <div>PROPERTY CARD</div>;
	else return <Stack className="card-config">{/* … */}</Stack>;
};

export default PropertyCard;
```

### Rules derived from this

- **Every page and most components branch on `device === 'mobile'`** with an `if/else`, returning
  two separate trees. Mobile trees may be placeholders during development.
- Page-level defaults for query inputs go in `Component.defaultProps.initialInput`, **not** inline.
- Filter/pagination state is serialised into the URL:
  ``router.push(`/property?input=${JSON.stringify(searchFilter)}`, …, { scroll: false })``
  and re-read in a `useEffect([router])`. **The URL is the source of truth for list state.**
- Sub-page tabs use `router.query.category` with a default:
  `const category: any = router.query?.category ?? 'myProfile';` then
  `{category === 'myProperties' && <MyProperties />}`.
- Detail pages read `router.query.id` in `useEffect([router])` and store it in state.
- Images: plain `<img src={...} alt="" />` with a `REACT_APP_API_URL` prefix and a static fallback:
  ```ts
  const imagePath: string = property?.propertyImages[0]
  	? `${REACT_APP_API_URL}/${property?.propertyImages[0]}`
  	: '/img/banner/header1.svg';
  ```
- Optional chaining is used liberally on server data (`property?.propertyLikes`).
- Internal navigation uses `next/link` with an object href:
  `<Link href={{ pathname: '/property/detail', query: { id: property?._id } }}>`.
- Empty-state block is standardised:
  ```tsx
  <div className={'no-data'}>
  	<img src="/img/icons/icoAlert.svg" alt="" />
  	<p>No Properties found!</p>
  </div>
  ```

---

## 10. Error Handling & Alerts

All user feedback goes through `libs/sweetAlert.ts`. Never import `sweetalert2` in a component.

| Helper | Use |
| --- | --- |
| `sweetErrorHandling(err)` | Generic catch-block handler |
| `sweetErrorHandlingForAdmin(err)` | Admin variant, falls back to `Messages.error1` |
| `sweetMixinErrorAlert(msg, duration=3000)` | Timed error toast |
| `sweetMixinSuccessAlert(msg, duration=2000)` | Timed success toast |
| `sweetTopSuccessAlert(msg, duration)` | Strips the `'Definer: '` backend prefix from the message |
| `sweetTopSmallSuccessAlert(msg, duration, enable_forward)` | Corner toast, optional page reload |
| `sweetConfirmAlert(msg)` / `sweetLoginConfirmAlert(msg)` | `Promise<boolean>` confirmations |
| `sweetContactAlert`, `sweetBasicAlert`, `sweetErrorAlert` | Misc |

Canonical handler shape used everywhere:

```ts
const someHandler = async () => {
	try {
		if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
		await doMutation({ variables: { input: id } });
		await sweetTopSmallSuccessAlert('success', 800);
	} catch (err: any) {
		console.log('ERROR, someHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};
```

Note: `console.log('ERROR, <handlerName>:', err.message)` — the handler name is always included.
Fire-and-forget promises are terminated with `.then()` rather than `await` when the result is unused.

Shared cross-entity mutation handlers live in `libs/utils.ts`
(`likeTargetPropertyHandler`, `likeTargetBoardArticleHandler`, `likeTargetMemberHandler`), alongside
pure formatters like `formatterStr` (numeral `0,0`).

---

## 11. Configuration & Environment

`libs/config.ts` is the only place env vars are read into the app:

```ts
export const REACT_APP_API_URL = `${process.env.REACT_APP_API_URL}`;
export const availableOptions = ['propertyBarter', 'propertyRent'];
export const propertyYears: any = [];            // generated 1970 → current year
export const propertySquare = [0, 25, 50, 75, 100, 125, 150, 200, 300, 500];
export const Messages = {
	error1: 'Something went wrong!',
	error2: 'Please login first!',
	error3: 'Please fulfill all inputs!',
	error4: 'Message is empty!',
	error5: 'Only images with jpeg, jpg, png format allowed!',
};
```

Env vars keep the **`REACT_APP_` prefix** (CRA heritage) and are whitelisted in `next.config.js`:

```js
env: {
	REACT_APP_API_URL: process.env.REACT_APP_API_URL,
	REACT_APP_API_GRAPHQL_URL: process.env.REACT_APP_API_GRAPHQL_URL,
	REACT_APP_API_WS: process.env.REACT_APP_API_WS,
}
```

`.env.development` / `.env.local` / `.env` are **gitignored**. The local backend defaults to port
`3007` (`http://localhost:3007/graphql`, `ws://localhost:3007`).

`next.config.js` also sets `reactStrictMode: true` and merges `i18n` from `next-i18next.config.js`.

---

## 12. Internationalisation

`next-i18next.config.js`:

```js
i18n: { defaultLocale: 'en', locales: ['en', 'kr', 'ru'], localeDetection: false },
trailingSlash: true,
```

- `_app.tsx` is wrapped: `export default appWithTranslation(App);`
- **Every page** must export:
  ```ts
  export const getStaticProps = async ({ locale }: any) => ({
  	props: { ...(await serverSideTranslations(locale, ['common'])) },
  });
  ```
- In components: `const { t, i18n } = useTranslation('common');` then `{t('Property Search')}`.
- Keys are the **English sentence itself** (`"We are glad to see you again!"`), stored in
  `public/locales/<lang>/common.json`. Adding UI copy means adding the key to all three files.
- The language switch renders flags from `public/img/flag/`.

---

## 13. Styling Standards

- **Global SCSS, no modules.** `_app.tsx` imports exactly three stylesheets:
  ```ts
  import '../scss/app.scss';
  import '../scss/pc/main.scss';
  import '../scss/mobile/main.scss';
  ```
- `scss/pc/main.scss` is a manifest that `@import`s every desktop partial with absolute-from-root
  paths (`@import '/scss/pc/property/property';`). **Adding a page = adding a partial + one import
  line here.**
- `scss/variables.scss` holds the Google Font import and `$font: 'Poppins', sans-serif;`
- Everything is scoped under the wrapper id: `#pc-wrap { … }` / `#mobile-wrap { … }`, then nested by
  page id and class. Deep nesting that mirrors the JSX tree is the norm.
- Fixed desktop container: `.container { position: relative; width: 1300px; margin: 0 auto; display: flex; }`
- Colors are literal hex in SCSS (`#181a20` dark, `#e92C28` primary red, `#eee` borders,
  `#bdbdbd` muted). Brand gradient: `linear-gradient(90deg, #e8543e 0%, #ec6b57 100%)`.
- Native scrollbars are hidden on `body` and restyled for `#pc-wrap` (9px, `#bdbdbd` thumb).
- MUI is themed centrally in `scss/MaterialTheme/index.ts` — a `light` theme object with
  `palette` (primary `#E92C28`, secondary `#1646C1`, text `#212121`), plus `components`
  `styleOverrides` that flatten MUI defaults (remove shadows, zero padding on `MuiBox`/`MuiList`,
  48px `MuiOutlinedInput`, bordered `MuiChip`, etc.), and `shadow` + `typography` from sibling
  modules. Consumed in `_app.tsx` via `createTheme(light)` + `<ThemeProvider>` + `<CssBaseline />`.
- Per-element one-off styling uses the MUI `sx` prop; anything structural or repeated goes to SCSS.

---

## 14. Admin Area Standards

- Routes live under `pages/_admin/**` (the leading underscore marks the family as non-public).
- `pages/_admin/index.tsx` immediately redirects to `/_admin/users`.
- Components live under `libs/components/admin/<section>/<Section>List.tsx`.
- `withAdminLayout` gates access: it renders `null` unless `user.memberType === MemberType.ADMIN`,
  and redirects to `/` once auth has loaded (`loading` flag prevents a redirect race on first paint).
- Admin lists are MUI `Table` + `TableHead`/`TableBody` with a local `interface Data`, a
  `headCells: readonly HeadCell[]` array, `type Order = 'asc' | 'desc'`, and a
  `descendingComparator<T>` helper — this is the standard admin-table recipe.
- Admin queries/mutations come from `apollo/admin/*`, never from `apollo/user/*`.

---

## 15. Git & Release Conventions

- Branches: `master` (production) ← `develop` (integration).
- Conventional Commits, since `standard-version` generates `CHANGELOG.md`:
  `feat: …`, `fix: …`, `refactor: …`, `chore: …`. Existing history also uses a `BRR:` prefix for
  scaffolding commits.
- Run `yarn changelog` to cut a release entry (tags skipped).
- `yarn.lock` is committed; `.env*` files are not.

---

## 16. Prompt Template — Bootstrapping a New Project With These Standards

Paste the following (together with this file) to reproduce the architecture for a new domain:

> Build a Next.js 14 **Pages Router** + TypeScript app following `DEVELOPMENT_STANDARDS.md`.
> Domain entity: **`<Entity>`** (plural `<Entities>`); secondary entities: `<…>`.
> The backend is a NestJS GraphQL API at `REACT_APP_API_GRAPHQL_URL` with WS at `REACT_APP_API_WS`.
>
> Produce, in this order:
>
> 1. `tsconfig.json`, `.prettierrc` (tabs, single quotes, printWidth 120), `next.config.js`
>    (env whitelist + i18n), `next-i18next.config.js` (`en`, `kr`, `ru`).
> 2. `libs/enums/<entity>.enum.ts`, `member.enum.ts`, `common.enum.ts` (`Direction`, `Message`).
> 3. `libs/types/<entity>/{<entity>.ts,<entity>.input.ts,<entity>.update.ts}` using the
>    entity-prefixed field naming (`<entity>Title`, `<entity>Status`, …), the
>    `{ list, metaCounter }` list envelope, and
>    `<Entities>Inquiry { page, limit, sort, direction, search }`.
> 4. `apollo/client.ts` (upload link + WS split link + auth link + error link + SSR singleton),
>    `apollo/store.ts` (`userVar` via `makeVar`), `apollo/user/{query,mutation}.ts`,
>    `apollo/admin/{query,mutation}.ts` with `SCREAMING_SNAKE` document names and a single `$input`.
> 5. `libs/auth/index.ts` (logIn / signUp / logOut / updateUserInfo, JWT in `localStorage`),
>    `libs/config.ts`, `libs/sweetAlert.ts`, `libs/utils.ts`, `libs/hooks/useDeviceDetect.ts`.
> 6. `libs/components/layout/{LayoutHome,LayoutBasic,LayoutFull,LayoutAdmin}.tsx` as `withLayoutX`
>    HOCs; banner copy resolved by a `useMemo` switch on `router.pathname`.
> 7. `scss/` with `app.scss`, `variables.scss`, `reset.scss`, the `pc/main.scss` manifest,
>    `mobile/main.scss`, and `MaterialTheme/{index,typography,shadow}.ts`.
> 8. Pages: `index`, `<entity>/{index,detail}`, `agent/{index,detail}`, `member`, `mypage`,
>    `community/{index,detail}`, `cs`, `account/join`, `_admin/**`.
>
> Every page: `NextPage`, `getStaticProps` with `serverSideTranslations`, `useDeviceDetect` with an
> `if (device === 'mobile') … else …` split, the three section comments
> `/** APOLLO REQUESTS **/`, `/** LIFECYCLES **/`, `/** HANDLERS **/` in that order,
> `defaultProps.initialInput` for list inputs, list state serialised into `?input=`,
> `xxxHandler` naming, `try/catch` + `sweetMixinErrorAlert`, and
> `export default withLayoutBasic(Page);`.

---

## 17. Known Debt (do not replicate in new projects)

These exist in the current code; treat them as things to improve rather than patterns to copy:

- `any` on page props (`({ initialInput, ...props }: any)`) and on many handler params.
- Scattered `console.log` / `console.warn` — including `console.warn('requesting.. ', operation)` on
  every Apollo operation. Remove or gate behind a debug flag.
- JWT in `localStorage` (XSS-exposed); `tokenRefreshLink` is stubbed
  (`isTokenValidOrUndefined: () => true`, `fetchAccessToken: () => null`) and never actually refreshes.
- `defaultProps` on function components is deprecated in React 18+; prefer default parameters.
- Raw `<img>` instead of `next/image`; no width/height ⇒ layout shift.
- `useDeviceDetect` is user-agent based and runs after mount, so the first paint is always desktop
  (hydration mismatch risk).
- `README.md` is still the `create-next-app` boilerplate.
- Empty `useEffect(() => {}, [searchFilter])` placeholders and empty `/** APOLLO REQUESTS **/`
  sections left from scaffolding — the data layer is wired but not yet consumed on several pages.
