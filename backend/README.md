# NARMIRA API — Phase 2: Product Catalog

Separate NestJS REST API for the existing Vite frontend. The backend preserves the Phase 1 infrastructure (PostgreSQL/Prisma integration, safe configuration, health/readiness checks, validation, CORS, request limits, security headers, rate limiting, structured request/error logging and Swagger) and now includes public, read-only product, category and collection catalog endpoints. Authentication, admin write tools, checkout, orders and payment endpoints are out of scope.

## Requirements

- Node.js 20.19+ (Node 22.12+ recommended for this Nest 11 / Prisma 7 setup)
- npm
- PostgreSQL 14+ locally, or Docker Desktop with its Linux engine running

## Configure and run (PowerShell)

From `C:\Users\hp\Downloads\NARMIRA\backend`:

```powershell
if (!(Test-Path .env)) { Copy-Item .env.example .env }
```

Edit `.env` and set `DATABASE_URL`, for example:

```env
DATABASE_URL="postgresql://narmira:<URL_ENCODED_PASSWORD>@127.0.0.1:55432/narmira?schema=public"
```

For local PostgreSQL installed directly on Windows, create a database named `narmira` and replace the username/password in that URL with your local PostgreSQL credentials (URL-encode special characters). The backend does not create users or modify an existing database during startup.

The recommended local development database is the native PostgreSQL cluster stored in the ignored `.local-postgres/data` directory. It persists across backend restarts and listens only on loopback. Start and stop it from this directory:

```powershell
$pgBin = 'C:\Program Files\PostgreSQL\17\bin'
& "$pgBin\pg_ctl.exe" start -D "$PWD\.local-postgres\data" -l "$PWD\.local-postgres\postgres.log" -o '-h 127.0.0.1 -p 55432 -c listen_addresses=127.0.0.1' -w
& "$pgBin\pg_isready.exe" -h 127.0.0.1 -p 55432 -d narmira -U narmira
```

Use `pg_ctl stop -D "$PWD\.local-postgres\data" -m fast -w` for a clean shutdown. Do not delete this directory to stop PostgreSQL; it contains the persistent development database. The local `.env` contains its generated password and is git-ignored.

If using Docker Desktop instead, first stop the native instance to free port 55432, configure `POSTGRES_PASSWORD` and `DATABASE_URL` in `.env`, then run `docker compose up -d postgres`. Compose publishes PostgreSQL only on `127.0.0.1:55432` and stores its data in the named Docker volume. Use one database runtime at a time.

Install dependencies, generate Prisma Client, apply the committed migration, and start the API:

```powershell
npm install
npm run prisma:generate
npx prisma migrate deploy
npm run start:dev
```

`HOST` defaults to `127.0.0.1` in development. Set it to an intentional interface address when remote development access is needed; production defaults to `0.0.0.0` for container deployments. The catalog migration at `prisma/migrations/20261125000000_product_catalog` is additive and does not reset or delete existing data.

Generate Prisma Client and apply the migration only after PostgreSQL is configured and reachable:

```powershell
npm run prisma:generate
npx prisma migrate deploy
npx prisma migrate status
```

## Endpoints

- `GET http://localhost:5000/api/v1/health` — process liveness, no database call
- `GET http://localhost:5000/api/v1/health/ready` — database readiness; returns 503 if PostgreSQL cannot be reached
- `GET http://localhost:5000/api/v1/products` — active product listing, filtering, sorting and pagination
- `GET http://localhost:5000/api/v1/products/:slug` — active product detail, images, variants, sizes and availability
- `GET http://localhost:5000/api/v1/products/featured` — active featured products
- `GET http://localhost:5000/api/v1/products/new-arrivals` — active new arrivals
- `GET http://localhost:5000/api/v1/products/bestsellers` — active bestsellers
- `GET http://localhost:5000/api/v1/categories` and `/api/v1/categories/:slug` — active categories and paginated products
- `GET http://localhost:5000/api/v1/collections` and `/api/v1/collections/:slug` — active collections and paginated products
- `http://localhost:5000/api/docs` — Swagger UI in development; in production it is disabled unless `ENABLE_SWAGGER=true`

Product filters: `page` (default 1), `pageSize` (default 24, max 100), `search` (name or SKU), `category` and `collection` (slugs), `color`, `size`, `fabric`, `minPrice`, `maxPrice`, `featured`, `bestseller`, `newArrival`, and `sort` (`newest`, `price-asc`, `price-desc`, `name`). Deep offsets above 100,000, invalid filters, reversed price ranges, and unknown query parameters are rejected. All catalog responses expose only active products/resources.

## Frontend Product Mapping

The existing frontend `Product` type remains unchanged in Phase 2. A future integration adapter can map the backend record as follows:

| Frontend `Product` field | Backend API source |
| --- | --- |
| `id`, `name`, `slug`, `description`, `shortDescription` | Same named fields |
| `price`, `originalPrice` | `price = salePrice ?? basePrice`; set `originalPrice = basePrice` only when a sale price exists, otherwise omit it |
| `images` | `images[].url`, ordered by `sortOrder`; map URL to `src`, `alt` to `alt` |
| `colors`, `variants` | `variants[].colorName`, `colorCode`, stable `id`, and variant `images[]` |
| `sizes`, `unavailableSizes` | `sizes[].size`, with unavailable sizes derived from `isAvailable` |
| `category`, `categorySlug` | First entry in `categories[]`; frontend can keep category labels from its content mapping |
| `fabric` | `material` |
| `weaveOrigin`, `details`, `tags` | Same named fields |
| `careInstructions` | Same named field |
| `inStock` | Backend computed `inStock` |
| `isNewArrival`, `isBestseller`, product badges | `newArrival`, `bestseller`, `featured` and `tags` |

Prices are serialized as decimal strings (two fractional digits) so the API does not lose monetary precision. The future adapter may convert to the frontend's current numeric display fields at the UI boundary; financial calculations should continue to use decimal-safe values. Category and collection descriptions/images are sourced from their respective resource endpoints. The API returns verified image URLs only and does not create placeholder photographs.

## Configuration

See `.env.example`. `FRONTEND_URL` accepts comma-separated exact origins (scheme, host and optional port; no path). Requests without an `Origin` header are allowed for server-to-server health probes. Production CORS never permits wildcard origins.

Do not commit `.env`. Never put credentials in frontend-prefixed environment variables. Startup and error logs intentionally omit exception details that may contain database URLs.

## Validation and tests

```powershell
npm run build
npm test -- --runInBand
npm run test:e2e -- --runInBand
```

Tests mock database calls and do not require PostgreSQL. To check readiness against the real local database, start the API and request `/api/v1/health/ready`.

The separate PostgreSQL integration suite writes only uniquely prefixed QA fixtures to the loopback database on port 55432 and removes them in `afterAll`. It refuses to run unless explicitly enabled and verifies the connected database, address and port before inserting records:

```powershell
$env:NARMIRA_POSTGRES_TESTS = '1'
npm run test:postgres
Remove-Item Env:NARMIRA_POSTGRES_TESTS
```

## Phase 3 Admin API

The admin API is a separate backend surface at `/api/v1/admin`; no storefront or admin dashboard code is included. Public catalog endpoints remain active-only. Product creation always starts in `DRAFT`, and publish revalidates its price, active category, image references, active variants/available sizes and the inventory record for each sellable combination. Archive hides a product publicly; restore returns it to draft and requires publishing again.

### First administrator bootstrap

Apply database migrations first, then run this command from an interactive terminal. It prompts for name/email and reads the password twice without displaying it. Passwords need 15–128 characters. The bootstrap creates only the first `SUPER_ADMIN`, refuses to elevate an existing account or create a duplicate initial super administrator, and has no public registration endpoint.

```powershell
npm run admin:bootstrap
```

If the initial super administrator is lost, use a reviewed, access-controlled database recovery process: verify the operator and target environment, set a new password hash using the same scrypt encoding, and revoke that administrator's sessions. Do not enable an HTTP password-reset or public admin-registration endpoint. Keep the database backup and recovery access restricted.

### Authentication, sessions and permissions

`POST /api/v1/admin/auth/login` issues an eight-hour opaque session cookie scoped to `/api/v1/admin`. The cookie is HttpOnly, SameSite=Strict, and Secure in production. PostgreSQL stores only SHA-256 digests of the session and CSRF tokens. The login response returns the CSRF token for in-memory use; after a page reload, call `POST /api/v1/admin/auth/csrf` to rotate it. Send that token in `x-csrf-token` plus the exact configured `Origin` (or matching `Referer`) on every state-changing admin request. `GET /auth/me` reports the current admin, `POST /auth/logout` revokes the session, and `POST /auth/change-password` revokes all of that admin's sessions. Login is limited to five attempts per minute per client address; global API throttling also applies.

| Permission | SUPER_ADMIN | CATALOG_ADMIN |
| --- | --- | --- |
| Products, variants, sizes, images and inventory | Yes | Yes |
| Publish, unpublish, archive and restore | Yes | No |
| Categories and collections | Yes | Yes |
| Create/update administrators | Yes | No |
| View audit log | Yes | No |

### Catalog routes

- `GET/POST /api/v1/admin/products`; `GET/PATCH /api/v1/admin/products/:idOrSlug` for products (updates use `:id`).
- `POST /api/v1/admin/products/:id/{publish,unpublish,archive,restore}` for lifecycle transitions.
- `POST/PATCH/DELETE /api/v1/admin/products/:productId/variants/:id` for variants (DELETE deactivates); matching `/sizes/:id` routes manage size availability/order.
- `POST/PATCH/DELETE /api/v1/admin/products/:productId/images/:id` validates URLs/references, preserves product ownership and controls gallery ordering/primary image. HTTPS URLs and `/images/...` or `/assets/...` references are accepted; the backend never fetches them. Global gallery maximum is 24; each variant gallery maximum is 12.
- `POST /api/v1/admin/products/:productId/inventory` sets stock using the current `version`, quantity, and required reason (both admin roles). Every successful change stores before/after/delta, administrator and timestamp; stale versions return 409, negative/reserved-quantity violations are rejected. Catalog admins can edit drafts and inventory; publication and archive transitions are super-admin-only.
- `GET/POST /api/v1/admin/categories` and `/api/v1/admin/collections`; `GET/PATCH/DELETE /:id` reads, updates or deactivates resources. Deactivation retains product relations.
- `GET/POST /api/v1/admin/administrators`, `PATCH /api/v1/admin/administrators/:id` and `GET /api/v1/admin/audit-logs` are SUPER_ADMIN-only. Admin updates cannot disable/demote the final active super administrator.

All state-changing admin actions write audit records; authentication secrets and passwords are excluded. Request IDs are returned in `x-request-id` and associated audit rows. Audit data has no update/delete API.

### Migration and rollback

Phase 3 adds tables and columns only; the prior catalog migration is unchanged. Apply migrations with `npx prisma migrate deploy`, regenerate the client with `npx prisma generate`, and inspect status using `npx prisma migrate status`. There is no automatic down migration: before rollback, stop admin writes, take a verified database backup, and use a reviewed restore/forward-fix procedure. Do not drop the new tables or columns after administrators, audit history, or inventory adjustments have been created.

### Phase 3 verification

```powershell
npx tsc --noEmit
npm run build
npm test -- --runInBand
npm run test:e2e -- --runInBand
$env:NARMIRA_POSTGRES_TESTS = '1'
npm run test:postgres
Remove-Item Env:NARMIRA_POSTGRES_TESTS
```

The opt-in live test verifies it is connected to the isolated local `narmira` database at `127.0.0.1:55432`; fixtures are uniquely named and removed afterward. Do not point this test flag at production or another database.
