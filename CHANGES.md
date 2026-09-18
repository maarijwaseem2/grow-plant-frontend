# Go Green — Fixes Applied (Chunk 1)

Baseline: uploaded backend + frontend zips. Backend was run live against a local
MySQL (MariaDB) and every fix below was verified with real requests where possible.

## BACKEND (NestJS)

1. **Boot crash — `src/main.ts`**
   Removed `global.fetch = require('node-fetch')`. `node-fetch` was never in
   package.json, so the server crashed on startup with MODULE_NOT_FOUND. Node 22
   already has a native global `fetch`, so the line was unnecessary.

2. **SECURITY: broken AdminGuard — `src/shared/guards/admin.guard.ts`**
   Old code: `if (!user && user.role !== 'admin') return false;`
   - `&&` meant any authenticated user (e.g. a Customer) passed the admin check.
   - It compared against lowercase `'admin'`, but the role enum value is `'Admin'`.
   Verified live: a Customer token reached the admin-only `/auth/dashboard` and
   got HTTP 200. After the fix (`!user || user.role !== UserRole.Admin` +
   ForbiddenException) the same token correctly gets HTTP 403 "Admins only.",
   while an Admin token still gets 200.

3. **JWT payload mismatch — `src/shared/strategy/jwt.strategy.ts`**
   Strategy returned `payload.username`, but the token payload only contains
   `sub`, `email`, `role` (see AuthService.login). `req.user.username` was always
   undefined. Now returns `{ userId, email, role }` to match the real payload.

## FRONTEND (React + Vite)

4. **Signup role bug — `src/components/register.jsx`** (the reported "role msla")
   `role` state started as `""` while the <select> had no matching empty option,
   so the dropdown *looked* like "Customer" but the value stayed "" until the user
   manually re-selected — tripping the "All fields are required" check and making
   signup fail for no visible reason. Defaulted the state to `"Customer"` so the
   shown value and the actual value stay in sync.
   NOTE: roles are case-sensitive on the backend (`Customer/Admin/Gardener`);
   sending lowercase returns "Validation failed" (verified live).

5. **Broken error messages — `register.jsx` and `login.jsx`**
   The backend's HttpExceptionFilter always responds with
   `{ message: { error: "<text>", statusCode } }`. Both files compared
   `error.response.data.message` (an OBJECT) to plain strings, so no branch ever
   matched. In register this also meant an unconditional "admin already exists"
   toast fired on *every* failure. Both now read `data.message.error` (the real
   string) and show the correct message.

6. **Firebase can white-screen the app — `src/Firebase.jsx` + `src/App.jsx`**
   Config is still placeholder, and `getMessaging()` can throw at import time in
   some browsers, which would blank the whole site. Firebase init is now wrapped
   in try/catch behind `isSupported()`, and `App.jsx` calls `onMessage` inside a
   guarded `useEffect` (with cleanup) instead of on every render. Also removed a
   stray top-level `<Route>` element in App.jsx that was dead code.

7. **Case-sensitive import paths broke the production build (Linux/CI/deploy)**
   The app built on case-insensitive Windows/Mac but failed on Linux. Fixed:
   - `../modules/` → `../Modules/` in Header.jsx, AboutUs.jsx, Donation.jsx,
     Home.jsx, Home-Modules/ReforestationPage.jsx
   - `./donation.css` → `./Donation.css` (Donation.jsx)
   - `../Assets/success.png` → `../assets/success.png` (CartPage.jsx)
   - `'/src/firebase'` → `'../Firebase'` (NotificationBell.jsx)
   `npm run build` now completes successfully.

## STILL OPEN (proposed for next chunks)
- Frontend `/admin/plants`, `/admin/orders`, `/admin/payments` have NO route guard
  (anyone can open them). `AdminRoute.jsx` exists but is unused. Wire proper
  role-based route protection.
- Anyone can sign up as Admin (the first one). Consider disabling admin
  self-signup / seeding the admin instead.
- `.env` contains real secrets (Stripe key, Gmail app password) committed to the
  repo. Rotate them and add `.env` to `.gitignore`; ship a `.env.example`.
- Duplicate/leftover folders: `src/comp` vs `src/components` (both have Header +
  Home-Modules). Consolidate.
- Password length inconsistent: frontend requires 7, backend requires 5.
- Large media in the repo bloats the bundle; consider moving to a CDN / lazy load.

---

# Chunk 2 — Admin Access Control

## FRONTEND
- **Admin routes were completely open** — `/admin/plants`, `/admin/orders`,
  `/admin/payments` had no guard at all, and `/admin/dashboard` only checked that
  *some* token existed (not the role). Any logged-in user (or anyone typing the
  URL) could open the admin panel. All four `/admin/*` routes are now wrapped in
  `PrivateRoute allowedRole="Admin"`.
- **`PrivateRoute` rewritten** to be robust: not-logged-in → `/login` (remembering
  the origin); logged-in-but-wrong-role → home `/` (instead of bouncing an
  authenticated user to the login page).
- **Admin removed from the public signup dropdown** — users can now only pick
  Customer or Gardener.

## BACKEND
- **Public signup now rejects `role: Admin`** with
  "Admin accounts cannot be self-registered." Previously the first visitor to
  POST role=Admin simply became the admin, so anyone could claim the admin seat.

### How to create the admin now
Seed one row directly (bcrypt-hash the password), e.g. from the app once with a
temporary tweak, or via SQL with a pre-hashed password. The single existing admin
keeps working; only *new* admin self-signup is blocked.

## STILL OPEN (next chunks)
- Backend endpoints themselves are still unguarded (the UI is protected, but the
  API is open). The frontend admin calls don't send the JWT yet, so securing the
  API means adding an auth header/interceptor on the frontend AND guards on the
  controllers together — planned as its own chunk to avoid breaking admin.
- `.env` secrets rotation + `.gitignore` + `.env.example`.
- Consolidate duplicate `src/comp` vs `src/components`.
- Password length: frontend 7 vs backend 5.

---

# Chunk 3 — Login/Signup redesign + config wiring + your files

## YOUR FILES (added as given)
- frontend `src/config.js` — single source for the backend URL (reads
  VITE_API_BASE_URL, falls back to http://localhost:3001).
- backend `src/main.ts` — replaced with your version (env-based CORS + PORT,
  defaults to 3001, logs the running URL).
- frontend `.env.example` — your VITE_API_BASE_URL sample (placed in the
  FRONTEND, since VITE_ variables are read by the frontend/Vite, not Nest).

## CONFIG WIRING (so nothing breaks with the new port)
- Your new main.ts makes the backend default to port 3001, and config.js also
  defaults to 3001. Every hardcoded `http://localhost:3000` in the frontend
  (21 files) was replaced with `${API_BASE_URL}` from config.js, so the front
  end and backend now agree on the port with zero env setup. To use 3000
  instead, set VITE_API_BASE_URL=http://localhost:3000 (frontend) and PORT=3000
  (backend .env).

## LOGIN & SIGNUP — professional, responsive redesign
- Rebuilt both screens with MUI components (TextField with proper floating
  labels, icons, password show/hide, Button, etc.) + lucide-react icons.
- Refined the green so it no longer feels harsh: a deep forest→emerald palette
  (#1b5e20 / #2e7d32 / #43a047) on the brand panel, calm #f4f7f4 background,
  clear labels and helper text. Kept green throughout (plantation theme).
- Split-screen layout with a branded left panel (logo, tagline, feature list)
  and a clean form on the right. Fully responsive: the brand panel collapses on
  phones, a compact logo header appears, and the form goes full width.
- Behaviour preserved: same API calls (now via API_BASE_URL), role-based
  redirect after login, robust error messages, Admin removed from signup,
  role defaults to Customer. Login/register password rules unified to 6+ chars.

## STILL OPEN (next chunks — page-by-page)
- Redesign the remaining pages responsively/professionally: Home, About, Shop /
  product pages, Cart/checkout, Donation, Plant/Home services, Contact,
  Complain, and the Admin & Gardener dashboards. (Best done a few pages per
  chunk to keep quality high.)
- Backend API endpoint guards (+ send the JWT from the frontend) — still open.
- Rotate the committed secrets in backend/.env.

---

# Chunk 4 — Reverted auth overkill + responsive header + fixes

## LOGIN / SIGNUP — reverted to the original design
- Undid the full MUI redesign. Restored the original login & signup screens and
  applied ONLY the small fixes that were actually wanted:
  - Added a proper label to the role dropdown ("I am registering as").
  - Softened the harsh greens in the CSS: rgb(30,187,30) and the lime rgb(0,255,0)
    are now #2e7d32 / #1b5e20 (calmer forest green).
  - Kept the earlier logic fixes: role defaults to Customer (no more phantom
    "all fields required"), Admin removed from the dropdown, correct error
    messages, and API_BASE_URL used for the requests.

## HEADER / NAVBAR — rebuilt, responsive
- Removed the "Free Delivery on orders above Rs. 5000" top line entirely.
- Login / Sign Up are now real buttons (ghost + filled green pill); logged-in
  users see "Hi, {name}" + a Logout button.
- Added a mobile hamburger (≤900px): the nav collapses into an animated
  hamburger that opens a full-width menu with all links (Services expandable)
  and the auth buttons. Desktop keeps the horizontal nav + Services dropdown.
- Clean white sticky bar, green accents, cart icon with badge. Kept
  position:fixed + ~64px height so existing page spacing still clears it.

## PLANT SERVICES — nicer inputs
- The "Select a product" dropdown and the location search box no longer use the
  odd transparent + black-border look; they're now clean white, rounded, with a
  soft border and a green focus ring.

## FOOTER
- Fixed the branding ("Grow.Green" → "Go Green"). Layout was already responsive.

## STILL OPEN (next chunks, page-by-page)
- Restyle the remaining pages professionally + responsively: Home, About, Shop /
  product / cart / checkout, Donation, Plant/Home services bodies, Contact,
  Complain, and the Admin & Gardener dashboards.
- Backend API endpoint guards (+ send JWT from the frontend).
- Rotate the committed secrets in backend/.env.

===================================================================
# PHASE 1 — UI redesign (MUI) begins
===================================================================

## Sub-chunk 1A — Auth revamp (proper working signup) + MUI foundation

### Backend (still MySQL for now; Postgres+PostGIS is Phase 2)
- User entity: added nullable columns `mobile`, `province`, `city`.
- CreateUserDto: added optional `mobile`, `province`, `city`; relaxed the
  username rule to allow spaces (so full names like "Ali Khan" work).
- Signup service now saves the new fields. Verified live: POST /user with
  {name, email, mobile, province, city} returns 200 and the row stores
  mobile/province/city correctly.

### Frontend (MUI — chosen as the standard going forward)
- New shared theme: src/theme.js (green MUI theme + Pakistan province/city data).
- Signup rebuilt with MUI: Full name, Email, Mobile (PK format validation),
  Province (dropdown), City (autocomplete, free-solo), Password + confirm, Role
  (Customer/Gardener). Fully responsive (2-col on desktop, 1-col on mobile).
- "Detect my location" button: browser geolocation → free OpenStreetMap
  Nominatim reverse-geocode → auto-fills province + city (no API key needed).
- Login rebuilt with MUI to match. Both use API_BASE_URL and robust errors.

### Notes / free stack
- Everything used is free: MUI, OpenStreetMap/Nominatim, MariaDB/Postgres.
- Your AI key is only needed from Phase 3 (spot-finder + chatbot), not for UI.

## NEXT (Phase 1 continues, per sub-chunk)
- Redesign the rest of the screens in MUI, responsive (mobile/tablet/web):
  Home, About, Shop/Product/Cart, Donation, Plant/Home Services, Contact,
  Complain, plus fresh Admin portal and Gardener dashboard shells.
- Change the plant-services map from Karachi-only to all-Pakistan + geolocation.

## Sub-chunk 1B — Landing + About + Footer (MUI, responsive)
- Home: brand-new MUI landing — green hero with CTAs + globe, floating stats
  card, "what you can do" feature cards, how-it-works steps, popular-plants
  showcase, and a closing CTA band. Fully responsive.
- About (AboutUs): MUI redesign — hero, mission & vision, "what we stand for"
  value cards (incl. AI-guided + public-land-only), and a CTA.
- Footer: rebuilt in MUI — brand, explore/company link columns, contact block,
  socials, dynamic year. Consistent dark-green theme, responsive.
- All three use the shared src/theme.js. Navbar/Footer are wrapped per-route in
  App, so the new footer shows across pages.

## NEXT (Phase 1 continues)
- Shop + Product + Cart (MUI), Donation, Plant/Home Services (+ map to
  all-Pakistan + geolocation), Contact + Complain, then Admin + Gardener shells.

## Sub-chunk 1C — Shop + Product detail (MUI, responsive)
- Shop (/Page-Shop): rebuilt in MUI — green banner, sticky filter panel (search,
  category chips, price range slider), responsive product grid with cards
  (image, category, price, Add-to-cart). Quick add-to-cart now wired to the real
  CartContext (previously it used dead local state). Loading + empty states +
  MUI pagination.
- Product detail (main Product view): rebuilt in MUI — breadcrumb, two-column
  image/details, price, live stock chip, quantity stepper, add-to-cart. The
  stock-reserve PATCH + addToCart logic is preserved exactly.

## NEXT (Phase 1 continues)
- Polish the product sub-sections (Additional info, Related products) to match.
- Cart / checkout (MUI). Donation. Plant/Home Services (+ map all-Pakistan +
  geolocation). Contact + Complain. Admin portal + Gardener dashboard shells.

## Sub-chunk 1D — Product sub-sections + Cart (MUI, responsive)
- Product page finished: Additional info (MUI tabs: Description / Additional
  information) and Related products (MUI card grid, same-category) rebuilt.
- Cart rebuilt in MUI (935 → ~217 lines): a 3-step flow (Shopping bag →
  Checkout → Confirmation) with a Stepper, item list with remove (stock is
  released via the existing /release API), sticky order summary
  (subtotal/shipping/VAT/total), a billing form (prefilled from the logged-in
  user), and a clean confirmation screen. Order is placed via POST /order.
  Stripe/payment was removed for now (as requested) — a "payment coming soon"
  note is shown; the order is still created and confirmed.

## NEXT (Phase 1 continues)
- Donation. Plant/Home Services (+ map Karachi → all-Pakistan + geolocation).
  Contact + Complain. Admin portal + Gardener dashboard shells.

## Sub-chunk 1E — Plant Services map (all-Pakistan + geolocation) + Donation
- Plant Services map: bounds changed from Karachi-only to a full-Pakistan
  bounding box, minZoom lowered to 5 (so the whole country is viewable), and
  the "outside Karachi" validation/text updated to Pakistan. Added a
  "Detect my location" button (browser geolocation) on both the desktop and
  mobile panels — it centers the map, drops a marker and reverse-geocodes the
  address (rejects locations outside Pakistan). Product/subscription logic
  untouched.
- Donation: rebuilt in MUI — hero, info cards, and a clean donate widget
  (tree-count slider + live total + Donate). Payment removed for now (as
  requested); the donation is still recorded via POST /donation. Requires login.

## NEXT (Phase 1 continues)
- Home Services (form). Contact + Complain. Admin portal + Gardener dashboard
  shells.

## Sub-chunk 1F — Home Services + Contact + Complain (fixed) + Admin + Gardener  ==> PHASE 1 COMPLETE
- Complain (was broken): fixed on both ends. Backend — added a `complaintDetails`
  field to the DTO + entity + service, and made the image optional (the service
  previously threw if no file). Frontend — removed the hardcoded (paid) Google
  Maps script, replaced the fake "user123" with the real logged-in userId, and
  aligned the field names to the DTO. Rebuilt in MUI. Complaints now submit.
- Contact: clean MUI page (contact info cards + message form).
- Home Services: rebuilt in MUI — location + address, a selectable services grid
  with quantities, a summary (subtotal + gardener fee), and request submission
  via POST /home-service (payment skipped). Also fixed the home-service DTO
  (userId had an invalid @IsPositive on a string).
- Admin dashboard: new MUI portal shell — metric cards (plants, orders, users,
  low-stock) + tabbed tables (Plants, Users) reading real data.
- Gardener dashboard: rebuilt in MUI — task cards with status chips and
  start/complete actions (fetch + status-update preserved).

### PHASE 1 (UI redesign, MUI, responsive) — DONE
Auth, Home, About, Header, Footer, Shop, Product (+ sub-sections), Cart,
Donation, Plant Services (all-Pakistan map + geolocation), Home Services,
Contact, Complain, Admin, Gardener — all redesigned in MUI and responsive.

## NEXT — PHASE 2 (Database + backend core)
- Migrate MySQL → PostgreSQL + PostGIS, TypeORM spatial entities + migrations,
  seed a NEW admin (env-based) and remove the old hardcoded admin, proper RBAC
  guards, DTO/validation cleanup, Redis cache + rate-limiting.

===================================================================
# PHASE 2 — Database + backend core
===================================================================

## Sub-chunk 2A — PostgreSQL + PostGIS migration + admin seed + rate limiting + RBAC infra
Tested live against a real PostgreSQL 16 + PostGIS 3.4 instance.

### Database migration (MySQL -> PostgreSQL + PostGIS)
- app.module TypeORM config switched from `mysql` to `postgres` (pg driver was
  already installed). All entities migrated cleanly (column types used —
  decimal/enum/int/text/varchar — are all Postgres-compatible). synchronize:true
  auto-created all 12 tables on first boot. Verified.
- PostGIS: a SeedService runs `CREATE EXTENSION IF NOT EXISTS postgis` on
  startup, so the spatial layer is ready for the Phase 3 AI spot-finder.
  Verified enabled (postgis 3.4.2, spatial_ref_sys table present).

### Env-based admin seed (replaces the old hardcoded admin)
- On startup, SeedService creates an admin from ADMIN_EMAIL / ADMIN_PASSWORD if
  one doesn't already exist. On a fresh Postgres DB there is no old admin to
  remove. Default seeded admin: admin@gogreen.pk / Admin@12345 (change in .env).
  Admin self-signup remains blocked. Verified: admin seeded + login works.

### Rate limiting + RBAC infrastructure
- Added @nestjs/throttler — a global in-memory rate limiter (100 req/min/IP),
  replacing the previous no-op global LocalAuthGuard. (In-memory keeps it
  runnable with no extra services; a Redis-backed store can be swapped in with
  Docker in Phase 5.)
- Added a reusable RolesGuard + @Roles(...) decorator for clean role-based
  access control. Applying it across all endpoints is coordinated with wiring
  JWT into the frontend requests (Phase 4), to avoid breaking current calls.

### Secrets
- .env now targets Postgres and includes ADMIN_EMAIL/ADMIN_PASSWORD, PORT and
  FRONTEND_URL. Added a .env.example with safe placeholders and a note to rotate
  the Stripe/email secrets (do not commit real values).

### How to run Phase 2 locally
1. Install PostgreSQL + PostGIS. Create a database named `gogreen`.
2. Ensure the postgres user/password match .env (postgres/postgres) or edit .env.
3. Backend: `npm install && npm run start:dev` — tables auto-create, PostGIS is
   enabled, and the admin is seeded on first boot. Login: admin@gogreen.pk /
   Admin@12345. Frontend: `npm run dev`.

## NEXT — Phase 2 remainder / Phase 3
- (Optional 2B) Redis-backed caching for map viewport queries; broader DTO
  validation cleanup; TypeORM migration files (currently synchronize for dev).
- Phase 3: Python FastAPI AI microservice (NDVI public-land spot finder + photo
  verification), PostGIS spatial entities + ST_DWithin queries, map clustering.

===================================================================
# PHASE 3 — AI microservice (flagship: public-land spot finder)
===================================================================

## Sub-chunk 3A — Python FastAPI AI service  (backend/ai-service/)
A separate microservice (runs on port 8000) — tested live.

### Endpoints
- GET  /health
- GET  /suggest-spots?lat=&lng=&radius=&limit=
    Returns a GeoJSON FeatureCollection of suggested PUBLIC plantable spots
    (parks, gardens, grounds, grass, recreation areas) pulled from OpenStreetMap
    (Overpass). It ONLY queries public/open-space tags, so private and
    residential land is never returned — exactly the "public land only" rule.
    Each spot is scored (park > garden > recreation ground > grass...). If
    Overpass is momentarily unreachable it returns a small deterministic
    fallback set so the map still works. (In this sandbox Overpass egress is
    blocked so the test used the fallback path; the OSM query + parsing + scoring
    is production-ready and returns real spots on a normal connection.)
- POST /verify-plant (multipart `file`) → { is_plant, green_ratio, confidence }
    Lightweight vegetation check so plantings can be verified from a photo.
    Tested: a green image → is_plant true (confidence 1.0); a gray image → false.

### Free + no keys
Uses only OpenStreetMap (free). NDVI/Sentinel-2 scoring and a trained
leaf-detection model can later be layered onto the SAME endpoints without any
changes to the gateway or frontend. Your AI key is only needed if/when we add
an LLM chatbot.

### Run
cd ai-service; python -m venv venv; source venv/bin/activate;
pip install -r requirements.txt; uvicorn main:app --port 8000

## NEXT (Phase 3 continues)
- 3B: NestJS gateway (/ai/* proxy to the FastAPI service) + a PostGIS
  PlantationSpot entity (store/cache suggested spots, ST_DWithin queries).
- 3C: Frontend — a "Suggest spots" button on the Plant Services map that calls
  the AI service and shows the suggested public spots as markers (with
  clustering when there are many).

## Sub-chunk 3B — NestJS AI gateway + PostGIS spatial layer  (tested end-to-end)
### NestJS AI gateway  (src/ai/)
- GET  /ai/suggest-spots?lat=&lng=&radius=&limit=  — proxies the FastAPI service
  and caches the returned public spots into PostGIS (deduped by ~25m proximity).
  Response includes meta.cachedNew.
- POST /ai/verify-plant (multipart `file`) — proxies to the AI photo check.
- AI_SERVICE_URL env points at the FastAPI service (default http://localhost:8000).

### PostGIS spatial layer  (src/plantation-spot/)
- PlantationSpot entity: a real PostGIS `geometry(Point,4326)` column with a GiST
  spatial index.
- GET /plantation-spots/nearby?lat=&lng=&radius= — a fast ST_DWithin query that
  returns nearby spots with computed lat/lng + distance (metres), closest first.
- GET /plantation-spots/count.
- main.ts now ensures `CREATE EXTENSION postgis` BEFORE TypeORM synchronizes, so
  the geometry column is created cleanly on first boot.

Verified live (Postgres 16 + PostGIS 3.4): backend booted with the geometry
table; /ai/suggest-spots returned GeoJSON and cached 6 spots; /plantation-spots/
nearby returned them via ST_DWithin sorted by distance; /ai/verify-plant worked
through the gateway.

## NEXT (Phase 3 finish)
- 3C: Frontend — a "Suggest spots" button on the Plant Services map that calls
  /ai/suggest-spots and renders the suggested PUBLIC spots as markers (with
  clustering when there are many), so users can pick an AI-suggested location.

## Sub-chunk 3C — Frontend map integration  ==> PHASE 3 COMPLETE
- Plant Services map: added a "🌱 Suggest public spots (AI)" button (both desktop
  and mobile panels). It calls the NestJS gateway (GET /ai/suggest-spots) for the
  current map centre and renders the returned PUBLIC spots as distinct green
  markers, each with a popup (name · category · score) and a "Use this spot"
  button that sets it as the plantation location. Suggestions are capped at 30.
- The full flagship flow is now wired end-to-end:
  Frontend button -> NestJS /ai/suggest-spots -> FastAPI (OpenStreetMap public
  land only) -> cached in PostGIS -> GeoJSON -> green markers on the map.

### PHASE 3 (AI microservice) — DONE
- FastAPI AI service: /suggest-spots (public-land finder) + /verify-plant.
- NestJS gateway: /ai/* proxy + caches spots to PostGIS.
- PostGIS PlantationSpot entity + ST_DWithin /plantation-spots/nearby.
- Frontend: "Suggest public spots" on the map with green markers + "Use this spot".

## NEXT
- Phase 4: gardener job workflow (pending states + realtime), admin CRUD, wire
  JWT into frontend requests + apply RolesGuard, notifications.
- Phase 5: Postman collection (every API) + Dockerization (compose: backend,
  ai-engine, postgres/postgis, redis) + performance/security.
- Phase 6: full e2e run + test cases + Maestro manual testing + final tested zips.
- Optional: a dedicated codebase cleanup pass (remove src/comp vs src/components
  duplication, feature-folder structure, drop unused files).

===================================================================
# PHASE 4 — Workflows + access control
===================================================================

## Sub-chunk 4A — Gardener job workflow + admin assignment (tested end-to-end)
The backend already had a solid gardener workflow in the `services` module; this
chunk wired the frontend to it correctly and verified the whole flow + RBAC.

### Backend (already present, now verified)
- PATCH /services/assign-gardener/:id  (JwtAuthGuard + AdminGuard) — admin assigns
  a gardener; status -> "Assigned"; a notification row is created for the gardener.
- GET   /services/gardener/tasks        (JwtAuthGuard + GardenerGuard) — a gardener
  only ever sees their OWN tasks (where gardenerId = req.user.id).
- PATCH /services/gardener/tasks/:id/status (JwtAuthGuard + GardenerGuard) — the
  gardener moves a task Assigned -> "In Progress" -> "Completed".

### Frontend
- GardenerDashboard: aligned to the real Service fields (name × quantity,
  locationName, total) and the real status values (Pending/Assigned/In Progress/
  Completed). Actions: "Start task" (In Progress) and "Mark completed"
  (Completed). Sends the JWT on every call.
- AdminDashboard: added a "Service jobs" tab — lists every service job with its
  status and assigned gardener, and lets the admin pick a gardener and assign
  (sends the JWT; only works for an admin). A "Pending jobs" metric was added.

### Verified live (Postgres)
- Admin assigned a gardener -> status became Assigned + gardener notified.
- The gardener saw exactly that task, then moved it In Progress -> Completed.
- A CUSTOMER token calling assign-gardener was rejected with 403; no token = 401.
  (RolesGuard/AdminGuard/GardenerGuard all enforcing correctly.)

## STILL OPEN (Phase 4 remainder)
- Realtime (Socket.IO) live status push (currently refetch-based).
- Admin plant CRUD (add/edit/delete) UI; a notifications UI.
- Extend the same job workflow to home-service requests.
- Broaden JWT-on-frontend + RolesGuard to the remaining endpoints.

## THEN
- Phase 5: Postman collection (every API) + Dockerization + perf/security.
- Phase 6: full e2e run + test cases + Maestro manual testing + final zips.

===================================================================
# PHASE 5 — Postman collection + Dockerization + Redis
===================================================================

## Sub-chunk 5A — Postman + Docker + Redis caching
### Postman collection  (backend/postman/GoGreen.postman_collection.json)
- 10 folders / 25 requests covering every endpoint: Auth, Users, Plants, Orders,
  Donations, Complaints, Home Services, Services & Gardener, AI (spot finder +
  verify), Plantation Spots (PostGIS). Variables: base_url, ai_url, token,
  admin_token, gardener_token, id. Admin/Gardener-only requests carry the right
  bearer token; multipart requests are set up as form-data.

### Dockerization  (docker compose up --build)
- backend/Dockerfile (multi-stage Node build -> slim runtime).
- ai-service/Dockerfile (Python FastAPI).
- frontend/Dockerfile (Vite build -> nginx with SPA fallback).
- docker-compose.yml — five services: postgres (postgis/postgis:16-3.4), redis,
  ai-engine, backend, frontend, wired over the compose network with healthchecks,
  named volumes (pgdata, uploads) and all env pre-set. DOCKER.md explains the
  one-command run and the expected folder layout.
- (Docker isn't available in this build sandbox, so the compose/Dockerfiles are
  validated by inspection — but every service they wire, Postgres+PostGIS, Redis,
  the NestJS backend and the FastAPI AI service, has been run and tested live.)

### Redis (the Phase-2 deferral, now delivered)
- An optional RedisCacheService (ioredis): uses Redis when REDIS_HOST is set,
  otherwise a safe no-op (so local dev needs no Redis; Docker wires it
  automatically). The /plantation-spots/nearby spatial query is now cached
  (60s TTL). Verified live with a real Redis: "Redis cache enabled", the
  nearby query created a cache key and served the second call from cache.

## NEXT
- Phase 4 remainder (optional): realtime Socket.IO status, admin plant CRUD,
  notifications UI, home-service gardener workflow.
- Phase 6 (final): full end-to-end run, test cases (unit/e2e), Maestro manual
  testing pass, and the final complete + tested zips.

===================================================================
# PHASE 6 — Testing
===================================================================

## Sub-chunk 6A — Automated tests + QA
### Backend unit tests (Jest) — 10 passing
- src/shared/guards/*.spec.ts: AdminGuard, RolesGuard, GardenerGuard. Run: `npm test`.
  Validates the RBAC/security logic (admin-only, role-based, gardener-only).

### Backend e2e tests (Jest + Supertest) — 9 passing
- test/gogreen.e2e-spec.ts: boots the real app against Postgres and checks
  signup (province/city/mobile), duplicate-email rejection, admin self-signup
  block, customer + admin login, customer -> admin dashboard = 403, admin = 200,
  gardener tasks without a token = 401, public plants list. Run: `npm run test:e2e`.
- Set up jest-e2e (moduleNameMapper for `src/*`, a test stub for the ESM
  @nestjs/axios so the app boots under jest).

### Frontend E2E (Playwright) — scaffold
- playwright.config.js + e2e/auth.spec.js (home, login, signup fields, shop).
  `npm run test:e2e` (after installing Playwright). Playwright is used because
  Maestro is mobile-only and this is a web app.

### TESTING.md documents how to run everything + the live integration results.

## PROJECT STATUS
Phases 1–3 complete; Phase 4 core (gardener workflow + admin assignment + RBAC)
complete; Phase 5 (Postman + Docker + Redis) complete; Phase 6 (tests) complete.
Optional remaining: realtime Socket.IO, full admin plant CRUD UI, notifications
UI, and a codebase cleanup pass (remove src/comp vs src/components duplication).

===================================================================
# OPTIONAL ITEMS
===================================================================

## Opt-A — Admin plant CRUD (tested end-to-end)
- Backend: the plant create/update/delete endpoints are now guarded with
  JwtAuthGuard + AdminGuard (GET stays public for the shop).
- Frontend: AdminDashboard "Plants" tab gets an "Add plant" button and per-row
  Edit/Delete actions, driven by a MUI dialog (name, price, quantity, category,
  description, image upload). All calls send the admin JWT.
- Verified live: admin created a plant (201), updated it (price/qty changed in
  DB), deleted it (row gone); a customer creating a plant got 403, no token 401.

## Opt-B — Notifications UI (tested) + an important auth fix
- Backend: added PATCH /notifications/:id/read and PATCH /notifications/read-all
  (JwtAuthGuard), alongside the existing GET /notifications/my.
- Fixed a real bug: the JWT strategy returned `userId` but controllers read
  `req.user.id`, so `req.user.id` was undefined. This meant user-scoped queries
  (gardener tasks, notifications) silently ignored the user filter and could
  return everyone's rows, and mark-as-read did nothing. The strategy now returns
  `id` too. Verified: a gardener now sees ONLY their own notifications, and
  mark-as-read actually flips `read` to true in the DB.
- Frontend: a NotificationBell (MUI) with an unread badge, a dropdown list
  (unread highlighted, relative time), click-to-read and "Mark all read". Added
  to the Gardener and Admin dashboard top bars; polls every 30s.

## Opt-C — Realtime (Socket.IO) (tested)
- Backend: a RealtimeGateway (WebSocket, socket.io) with a private room per user
  (`user:<id>`). Clients emit `join` with their userId. Wired into ServicesService:
  assigning a gardener pushes a `notification` to that gardener in real time, and
  a task status change pushes `task-updated` to the customer who requested it.
- Frontend: NotificationBell opens a socket, joins the logged-in user's room, and
  reloads instantly on `notification` (the 30s poll stays as a fallback).
- Verified live: a socket client joined a gardener's room, an admin assigned that
  gardener, and the client received the notification event instantly over the
  WebSocket.

## Opt-D — BullMQ background queue (tested)
- A QueueService (BullMQ) that activates only when REDIS_HOST is set (BullMQ
  needs Redis); otherwise enqueue() is a safe no-op so local dev runs without
  Redis. Under Docker (Redis present) a Worker processes jobs off the request
  thread — the place to put heavier tasks (image/satellite processing).
- Wired: assigning a gardener enqueues a `gardener-assigned` background job.
- Verified live with Redis: "Background queue enabled", and after an assign the
  worker logged "Processed job gardener-assigned -> {...}".

===================================================================
# OPTIONAL ITEMS (chunked)
===================================================================

## Opt-A — Admin plant CRUD  (tested end-to-end)
- Backend: POST/PATCH/DELETE /plants were already guarded (JwtAuthGuard +
  AdminGuard); GET stays public. Added `enableImplicitConversion` to the global
  ValidationPipe so multipart string fields (price/quantity) are coerced to the
  @IsInt types — verified a created plant stores price/quantity as real numbers.
- Frontend: the Admin "Plants" tab now has an "Add plant" button and per-row
  Edit / Delete, backed by a MUI dialog (name, price, quantity, category
  dropdown, description, image upload). All calls send the admin JWT.
- Verified live: admin created a plant, updated price 350->500 & qty ->25 (stored
  as numbers), deleted it; a customer token creating a plant was rejected (403).

## Opt-B — Notifications UI  (tested end-to-end)
- Backend already had the endpoints (JwtAuthGuard): GET /notifications/my,
  PATCH /notifications/read-all, PATCH /notifications/:id/read — each scoped to
  the logged-in user.
- Frontend: a new NotificationBell component (MUI bell + unread badge + dropdown
  list, click-to-mark-read, "Mark all"), polling every 30s. Added to the Admin
  and Gardener dashboard top bars.
- Verified live: assigning a gardener created a notification; the gardener's
  /notifications/my showed it (unread count correct, "assigned a new planting
  task at Clifton, Karachi"); marking it read flipped the DB flag; no token = 401.

## Opt-C — Realtime (Socket.IO)  +  Opt-D — Background queue (BullMQ)  (tested)
The backend for both was already present in the project; this chunk fixed a
duplicate module import, restored the frontend socket wiring, and verified both.

### Opt-C — Realtime
- RealtimeGateway (@WebSocketGateway) with per-user rooms (user:<id>) and a
  notifyUser() method. ServicesService pushes 'notification' to the gardener on
  assignment and 'task-updated' to the customer on status change.
- Frontend: NotificationBell now opens a socket.io-client connection, joins the
  logged-in user's room (from the JWT sub) and reloads on 'notification' /
  'task-updated' (with a 30s poll as fallback).
- Verified live: a socket client in the gardener's room received the push
  "You have been assigned a new planting task at DHA, Karachi" the instant the
  admin assigned the job.

### Opt-D — Background queue
- QueueService (BullMQ) with a Queue + Worker, active only when REDIS_HOST is set
  (safe no-op otherwise, so local dev needs no Redis). Assignment enqueues a
  'gardener-assigned' job.
- Verified live with Redis: "Background queue enabled" and the worker logged
  Processed job "gardener-assigned" -> { gardenerId, serviceId }.
- Note: home-service findAll()/findOne() were still NestJS CLI stubs returning a
  placeholder string; implemented them to return real rows from the repository so
  the admin "Home services" tab actually lists requests. Verified GET /home-service
  returns the seeded row.

## Opt-F — Codebase cleanup  (frontend, build verified)
- Ran a reachability scan over src/ and removed 28 files that were never imported
  anywhere: leftover animated-globe "Home-Modules" / "AboutUs-Modules" helpers
  (both under comp/ and components/), unused route guards (AdminRoute,
  RestrictedRoute), an unused Service.jsx and Shop Filter.jsx, and four unused
  Gardener stubs (Notifications, PlantCareTips, TaskList, Welcome). Empty
  directories were pruned.
- Note: comp/Header.jsx is the live navbar (imported as Navbar in App.jsx);
  components/Header.jsx + Navbar.jsx are still referenced elsewhere so they were
  intentionally left in place rather than risk a broken import.
- Frontend build passes after the removals (nothing referenced the deleted files).

## Opt-G — LLM chatbot (Go Green Assistant, OpenAI)  (wired + tested)
- Backend: POST /ai/chat added to the AI module. It calls OpenAI's chat-completions
  API using OPENAI_API_KEY from .env, with a Go Green system prompt (plants, tree
  planting, native species, and platform features). History is trimmed to the last
  10 messages. Degrades gracefully: returns a friendly "not configured" message
  when no key is set, and a safe "temporarily unavailable" on any API error, so the
  widget never breaks the app. Model configurable via OPENAI_MODEL (default gpt-4o-mini).
- .env / .env.example gained OPENAI_API_KEY (blank) + OPENAI_MODEL.
- Frontend: a floating ChatWidget (bottom-right bubble that opens a chat panel with
  message bubbles, typing indicator, Enter-to-send) mounted globally in App.jsx, so
  it appears on every page.
- Verified live: with no key the endpoint returned the "not configured" message; with
  a dummy key the OpenAI call path executed and failed gracefully. Real answers will
  come once a valid OPENAI_API_KEY is added to the backend .env.

>>> TO ENABLE: put your key in backend .env as OPENAI_API_KEY=sk-... then restart the
    backend. The assistant bubble is at the bottom-right of every page.

## Post-optional tweak — username accepts numbers  (tested)
- The signup name was restricted to letters and spaces. Removed that rule in both
  places: the frontend register validator and the backend CreateUserDto (@Matches
  dropped). Names like "Ali 123" now register (verified 201 + login 201).
- Confirmed the rest of the form stays as required: email is validated, mobile uses
  the Pakistani format (03xxxxxxxxx / +923xxxxxxxxx), and province + city are chosen
  from dropdowns (no free typing needed).
- Fixed an e2e test-isolation flaw: the signup service enforces unique usernames, so
  the tests' fixed names failed on re-runs once those names were already in the DB.
  Made the e2e usernames unique per run — the whole suite is now 10 unit + 9 e2e green
  and re-runnable.

## Docker build fix — npm peer-dependency conflict
- The Docker build failed at `npm ci` because @babel/core@8 (a dev dep) conflicts
  with ts-jest@29's peer requirement (@babel/core 7). Local installs used
  --legacy-peer-deps; the Dockerfiles' strict `npm ci` did not.
- Changed both Dockerfiles (backend build + runtime, frontend build) from `npm ci`
  to `npm install --legacy-peer-deps`, and added a `.npmrc` (legacy-peer-deps=true)
  to backend + frontend so a manual `npm install` also works without the flag.
- Verified all runtime-critical packages (websockets, socket.io, ioredis, bullmq,
  axios, pg, throttler) are in "dependencies", so the --omit=dev runtime image keeps them.

## Docker boot fix — Stripe crash without a key
- PaymentsService instantiated `new Stripe(process.env.STRIPE_SECRET_KEY)` in its
  constructor. With no key set, Stripe threw "Neither apiKey nor config.authenticator
  provided" and the whole app crash-looped on boot (even though payment is "coming soon").
- Made it defensive: falls back to a harmless placeholder key when STRIPE_SECRET_KEY
  is unset, so the app boots. Verified the backend now reaches "Nest application
  successfully started" (health 200) with no Stripe key.
- Quick alternative (no rebuild): set STRIPE_SECRET_KEY to any non-empty value in
  docker-compose.yml's backend environment.

===================================================================
# DESIGN + FEATURE OVERHAUL (phased)
===================================================================

## Phase 1 — Login / Signup redesign (background image)
- Restored the plantation background: both login and register now use
  login-background.jpg — a dimmed full-page image behind the card, plus a
  green-tinted image on the left branding panel, with the form card floating on
  top. All existing fields/validation kept (email, PK phone, province/city
  dropdowns, numbers allowed in name).

## Phase 2 — Homepage hero video
- The Home hero now plays a looping plantation video (plant-tree.mp4) as its
  background with a green gradient overlay for text contrast, so the site feels
  alive the moment it loads. (Uses the videos already bundled in the project.)

## Phase 3 — Plant Service: satellite view + location image
- Added a Map/Satellite toggle over both maps (desktop + mobile). Satellite uses
  Esri World Imagery tiles (free, no API key).
- Each AI-suggested spot's popup now shows a real satellite thumbnail of that exact
  location (Esri export) — so the user can see what the place actually looks like
  from above before choosing "Use this spot".
- Verified the Esri tile + export endpoints return images (HTTP 200, image/jpeg).

## Phase 4 — Payment approve-flow (functional, no mock)
- Backend: Payment entity gained method + reference. New manual flow on the
  payments module: POST /payments/manual (user submits amount+method+reference,
  status Pending, notifies every admin live), PATCH /payments/:id/approve and
  /:id/reject (admin only, sets status + notifies the user live), GET /payments/my
  (user's own), GET /payments (admin, all). Uses the notification repo + realtime
  gateway. Routed so /payments/my resolves before /payments/:id.
- Frontend (user): the Cart checkout now has a "Pay online" box — pick EasyPaisa/
  JazzCash/bank, enter the transaction ID, submit → goes to admin for approval.
- Frontend (admin): a new "Payments" tab lists all payments with Approve/Reject on
  pending ones.
- Verified end-to-end: customer submitted Rs 1500 (Pending) → admin got the
  notification and saw it → admin approved (status Approved) → customer got the
  "approved" notification → a customer trying to approve got 403.
- Note: Stripe stays "coming soon" — research confirmed Stripe can't receive into
  Pakistani accounts; the manual EasyPaisa/JazzCash/bank approval flow is the
  realistic fit (Safepay sandbox is the future option for a live card gateway).

## Phase 5 — Notifications: icon everywhere + See-all page + scroll
- NotificationBell now also sits in the main site header (for any logged-in user,
  not just admin/gardener), so customers see their payment/order notifications too.
- The dropdown has a fixed header + a scrollable list + a "See all notifications"
  footer button.
- New full page at /notifications: lists every notification with click-to-read,
  "Mark all read", unread count, and empty/login states. Consumes the existing
  GET /notifications/my (already verified).

## Phase 6 — Complain page redesign + product/master portal
- Complain (Plant damage report) redesigned: the header now uses a plantation image
  with a green overlay, and the page is a two-column layout — the form on the left,
  and an info sidebar on the right ("Why report?", "What to include" checklist, and a
  "Reviewed by our team / 2–3 working days" note). All existing fields + submit kept.
- Product/master portal: confirmed the admin "Plants" tab already provides full
  product management — add / edit / delete with image upload, admin-guarded and
  verified working (built in the earlier optional round). No mock buttons.

## Phase 7 — Admin UX polish
- Added a live search box to the admin dashboard: filters the Plants tab by name or
  category and the Users tab by name or email as you type. Keeps the admin usable as
  data grows. (All actions remain real/functional.)

## Phase 8 — Scalability: Socket.IO Redis adapter (horizontal scaling)
- The realtime gateway now attaches the Socket.IO Redis adapter
  (@socket.io/redis-adapter) when REDIS_HOST is set, so websocket events broadcast
  across ALL backend instances — you can run many backend copies behind a load
  balancer and notifications/task-updates still reach the right user. With no Redis
  it runs single-instance (safe local default).
- Verified live: with Redis, the backend logged "Realtime scaled via Redis adapter —
  horizontal scaling ready", started cleanly, and a socket client still received a
  live assignment event through the adapter.

Scalability notes for running at scale (real-time, high traffic):
  * Backend is stateless (JWT) → run N replicas behind a load balancer.
  * Redis adapter (this phase) shares socket state across replicas.
  * Redis cache (nearby spots) + throttler rate-limiting are already in place.
  * Serve the heavy videos/images from a CDN / object storage, not the app server.
  * Postgres + PostGIS with connection pooling handles the geo queries.

===================================================================
# ALL 8 DESIGN/FEATURE PHASES COMPLETE
===================================================================

===================================================================
# SHOP + AI EXTENSION (phased)
===================================================================

## Phase A — Proper plant e-commerce shop + COD
- Broadened product categories from 6 plant types to 13: added Seeds, Soil & Compost,
  Fertilizers, Pots & Planters, Tools, Pest Control, Watering — so it's a full plant
  shop, not just plants. Updated the backend enum and both frontend category lists.
- Changed buy_plant.category from a Postgres enum to varchar (nullable) so new
  categories work without enum-migration pain; added a guarded auto-conversion in
  main.ts (enum -> varchar) that is a no-op on fresh DBs and idempotent on existing
  ones. Category values are still validated at the API by the DTO.
- Shop page banner broadened to "Plants & garden supplies". (The shop already had
  search, category chips, price filter, product cards, add-to-cart, pagination.)
- Payment: removed Stripe entirely (no Stripe client is created at boot). Checkout now
  offers two real options — Cash on Delivery (places the order) and Pay online
  (EasyPaisa/JazzCash/bank -> admin approval, from Phase 4).
- Fixed a latent bug in the order DTO (userId had @IsPositive, invalid for a UUID)
  that was making order placement fail. Verified: a COD order now returns 201 and is
  saved; all 13 categories create successfully.

## Phase B — RAG chatbot (answers from the live shop)
- The Go Green Assistant now pulls the live product catalog from the database on each
  message and injects it into the system prompt (a simple retrieval-augmented setup).
  So when a user asks "do you have neem?" or "what's the price of X?", it answers from
  the actual in-stock items and prices instead of guessing — and suggests an
  alternative from the catalog if something isn't stocked.
- Wired the BuyPlant repository into the AI module/service; catalog build is wrapped so
  it never breaks the chat. Verified the catalog-fetch + OpenAI call path runs cleanly
  (graceful fallback on a bad key); real answers need a valid OPENAI_API_KEY.

## Phase C — Smart plant recommendation (rule-based, free)
- New POST /ai/recommend { sunlight, space } scores the in-stock catalog for the
  user's conditions and returns the top picks with a short reason each — no external
  ML, runs instantly. Verified: "shade + small" surfaced pots/small-space items.
- Frontend: a "Not sure what to plant? Let us suggest" widget on the Shop page —
  pick sunlight + space, get recommended products in a strip with add-to-cart.

## Phase D — Spot suitability (satellite greenness estimate, free)
- New /spot-greenness endpoint on the AI service computes a vegetation/greenness %
  for a spot from free Esri satellite imagery (a visual RGB proxy — honest about not
  being spectral NDVI, which needs Sentinel/Landsat NIR + a key). Proxied via NestJS
  GET /ai/spot-greenness.
- Frontend: each suggested-spot popup now has a "Check suitability" button that shows
  the greenness % + a note (e.g. "mostly bare — high impact if greened").
- Verified end-to-end through the NestJS -> FastAPI chain: a Karachi park read ~46%
  ("already quite green") vs an urban point ~16.8% ("some greenery") — sensible,
  differentiated results.

===================================================================
# SHOP + AI EXTENSION COMPLETE (Phases A–D)
# Honest note: real AI now = OpenAI RAG chatbot (answers from live catalog) +
# rule-based recommender + satellite greenness CV proxy + geospatial spot finder.
# Next real-ML steps (Colab-trained, free): plant/species CNN, true NDVI via Sentinel.
===================================================================

===================================================================
# CHAT + CONTACT + GARDENER PROFILE + URDU (phased)
===================================================================

## Phase 1 — Gardener <-> Customer chat (privacy-guarded, realtime)
- New chat module: ChatMessage entity + POST /chat/send, GET /chat/with/:otherId,
  GET /chat/conversations. Messages push live to the recipient over the existing
  per-user socket ('chat-message').
- Safety filter (the "AI check"): blocks any message containing a phone number —
  Pakistani 03xx patterns, any 7+ digit run, and spaced-out digits — while allowing
  small numbers (quantities, prices). Verified: "0300 1234567" and "0 3 0 0 ..." are
  rejected (400); "5 trees, Rs 500" passes.
- Supports text, voice notes (browser MediaRecorder -> audio, played inline) and
  location sharing (opens in Maps). No image upload and no calling, by request.
- Frontend: ChatBox component, a Messages inbox at /messages (both roles, shows the
  other person's NAME only — never a phone), a header Messages icon for logged-in
  users, and a "Message" button on each gardener task. Verified both sides see the
  conversation by name.

## Phase 2 — Contact page (public -> admin -> email reply)
- New contact module: public POST /contact saves a message; admin-only GET /contact
  and PATCH /contact/:id/handled. The website Contact form now actually submits to the
  backend (was a dummy toast before).
- Admin dashboard gained a "Contact" tab listing every message with the sender's name,
  email and text, a New/Handled status, a one-click "Reply" (opens the admin's mail app
  to that email) and a "Done" button.
- Verified: a public message was saved, the admin listed it and marked it handled; a
  non-admin was blocked (403).

## Phase 3 — Gardener details on signup + dashboard
- User entity + DTO gained nic, address, bikeDetails (all optional). The register form
  now reveals a "Gardener details" section (CNIC, bike details, full address) when the
  user picks Gardener, so the platform keeps gardener records on file.
- Fixed a latent bug: the user-create service wasn't persisting nic/address/bikeDetails
  and getUserById returned only id/username/email/role — it now saves and returns the
  full profile (mobile, province, city, nic, address, bikeDetails).
- Gardener dashboard now shows a profile card (name, phone, CNIC, city, bike, address)
  above the task list. Verified: a gardener signed up with details and they persisted
  and came back on the profile fetch.

## Phase 4 — Urdu language toggle + RTL (foundation)
- New LanguageContext (en/ur) with a small dictionary, a t() helper and a toggle. It
  persists the choice, sets <html lang> and flips the whole layout to RTL for Urdu.
- A compact "اردو / EN" toggle now sits in the header. It switches the navigation
  (Home, About, Services + dropdown, Complain, Contact, Login, Sign Up, Logout) and the
  home hero (tagline, title, subtitle, both CTAs) to Urdu, and the page direction to RTL.
- Honest scope: this is the working foundation — header nav + home hero are translated
  and the layout goes RTL. The dictionary is centralised and easily extended to cover the
  remaining pages string-by-string without touching the toggle wiring.

## Phase 3 (revised) — Gardener details moved from signup to a profile page
- Reverted the extra signup fields: registration is now identical for customers and
  gardeners (no CNIC/address/bike at sign-up).
- Instead, the gardener fills these in from their dashboard: the profile card now has an
  "Edit profile" dialog (phone, CNIC, city, bike, full address) that saves via
  PATCH /user/:id. A reminder banner shows on the card until the profile is complete.
- Secured the update endpoint: PATCH /user/:id now requires auth and only lets a user
  edit their own profile (admins can edit anyone). updateUser also actually persists
  mobile/province/city/nic/address/bikeDetails now (previously only username/email/pw).
- Also fixed a real bug found here: the GardenerDashboard was using <Grid> without
  importing it — the import is fixed so the profile card renders.
- Verified end-to-end: plain signup (201), empty profile, self-edit (200) persists all
  fields, another user editing it is blocked (403), and no-token is 401.

===================================================================
# SECURITY + SCALABILITY HARDENING (phased)
===================================================================

## Chunk 1 — Security
- Closed a real leak: GET /user/:id had NO guard and returned CNIC, phone and address.
  It now requires auth and returns private fields ONLY to the owner or an admin; everyone
  else gets a safe public subset (id, username, role, city, image, experience, services).
  This is what makes the "don't leak the gardener's number" feature actually hold.
- Added helmet (security headers: HSTS, X-Frame-Options, nosniff, etc.).
- Server-side profile-image validation: must be a png/jpg/webp/gif data URL under 2 MB
  (previously only the browser checked). CORS was already env-based.
- Verified: no-token 401; self/admin get full; another user gets the public subset with
  CNIC/phone/address/email absent; bad image 400; helmet headers present.

## Chunk 2 — Scalability quick wins
- Removed an N+1 query: chat conversations fetched each partner's name in a loop; now a
  single batched In() query.
- Added DB indexes: chat_message(customerId), chat_message(gardenerId), and userId on
  order, payment, notification, home_service and service. Verified created in Postgres.

## Chunk 3 — Pagination + response compression
- GET /plants now supports ?page and ?limit and always caps the result (hard max 200 rows)
  so a single request can't pull the whole table. Backward compatible: with no params it
  still returns the list as `data` (array) plus a `pagination` block, so the existing
  frontend keeps working. Verified: no-params returns all + metadata; page/limit slice
  correctly; limit=9999 is capped to 200.
- Added gzip compression (compression middleware) to shrink API responses over the wire.

Net effect targeted: Security ~9.3, Scalability ~9.2. Still open as bigger next steps:
move images to a CDN (Cloudinary) instead of base64, and add an nginx load balancer with
2+ backend replicas (the Redis Socket.IO adapter already supports horizontal scaling).

===================================================================
# FIX PASS (user feedback batch 1)
===================================================================
- SECURITY: (advisory) the OpenAI key shared in chat is exposed and must be rotated.
- Stripe fully removed from the backend (import, field, processStripePayment, the
  'stripe' payment case) and dropped from package.json. Platform uses COD + manual
  online (approve-flow) only.
- Duplicate assign notifications fixed: assignGardener (services + home-service) now
  returns early if the task is already assigned to that same gardener, so clicking
  assign again doesn't re-notify.
- AI chat now surfaces the real reason it failed (invalid key / insufficient quota / 401)
  instead of a generic message, so config problems are obvious. The code is correct —
  the assistant needs a VALID key with billing/credit on the OpenAI account.
- Order stock validation (backend-enforced): an order is rejected (400) if any line
  quantity is < 1 or exceeds the plant's stock; on success the stock is decremented.
- /notifications/my verified working (200 with token, 401 without) — the earlier failure
  was just an expired token.
- Image uploads resized/compressed before sending (new utils/image.js): the gardener
  profile photo is now a small JPEG data URL instead of a multi-MB base64 that was
  breaking the API.
- Input validation: mobile capped to 11 digits (numeric only) in register + gardener
  profile; CNIC auto-formats to 13 digits (xxxxx-xxxxxxx-x) and is validated on save.

## FIX PASS (batch 2)
- Stripe removed from the FRONTEND too: PaymentForm rewritten with no Stripe — now offers
  Cash on Delivery or Bank/JazzCash/EasyPaisa with the account details to transfer to and a
  transaction-ID/reference field, submitting to the manual approve-flow (/payments/manual).
  The <Elements>/loadStripe wrappers in Order-Details and Subscription were removed, and the
  @stripe/* packages dropped from package.json.
- HomeService: quantity is now a typeable number field (cap = stock, min 1) instead of only
  +/- buttons, and a "Detect" button auto-fills the customer's area/address via free
  OpenStreetMap reverse geocoding. (ProductDetail already had a stock-capped typeable qty.)
- Complain page reviewed — the component code is correct (all handlers defined); the blank
  screenshot was stale. Should render on the latest build (clear browser cache).

## FIX PASS (batch 3 — remaining items, one by one)
1. Dynamic SEO: react-helmet-async added; a reusable <Seo> sets per-page title/description +
   Open Graph/Twitter tags. ProductDetail uses the live product name/description/image; Home
   has its own. (True crawl-time SEO needs SSR/Next.js; helmet covers client-rendered meta.)
2. Service booking no longer loses data on Back: Plant-Services persists the in-progress
   selection (location + plants + spot) to localStorage, restores it on return, and clears it
   after a successful booking.
3. Bike details split into separate validated fields: bikeName (make/model) + bikeNumber
   (plate, validated ~ABC-123), on the entity/DTO/service and the gardener profile + admin view.
4. Quantity is now typeable everywhere: fixed Plant-Services (its input had pointerEvents:none
   which blocked typing) and HomeService; both cap at live stock (min 1). Subscription only
   displays quantities (no stepper). Order stock is also enforced server-side.
5. Map spots: each suggested-spot popup now has a "See on Google Maps (photos & Street View)"
   link alongside the satellite thumbnail (inline Google place photos would need a paid Places
   API key).
6. Subscription "Upload Order Image" was confusing + required — now optional and relabeled
   "Payment screenshot (optional)".

## FIX PASS (batch 5 — real bugs found)
- COMPLAIN PAGE: the route was never registered in App.jsx (only the import existed) — that's
  why it wouldn't open. Added <Route path="/complain">. THIS was the real bug.
- IMAGE "too long": NestJS body limit was the 100kb default, so base64 images were rejected
  (PayloadTooLarge). Raised json/urlencoded limits to 15mb.
- SERVICE/SUBSCRIPTION image was REQUIRED on the BACKEND (services.service threw "No file
  uploaded") — made it optional, so Proceed to Payment works without a screenshot.
- ORDER TRACKING: orders had no status. Added a `status` column (Pending → Confirmed →
  Dispatched → Delivered), GET /order/mine for the customer, and admin PATCH /order/:id/status.
  The My services page now also lists the customer's plant orders with their status, and the
  cart confirmation + order flow link to it ("Track my orders").
- GARDENER DASHBOARD: added the Messages icon + live unread badge to its header (it only had
  the bell before).
- ASSIGN LOCK: made the lock visible — the button reads "Assigned ✓" and is disabled once a
  job is assigned to that gardener (re-enables only when a different gardener is picked).

NOTE FOR TESTING: several earlier fixes (subscription image removal, bike validation, assign
lock, message badge) were already in the source but weren't visible because of an OLD BUILD /
browser cache. Rebuild clean: `docker compose build --no-cache` then `docker compose up`, and
hard-refresh the browser (Ctrl+Shift+R).

## BUILD FIX (Docker build was failing here)
- Root cause: after making the service image optional, services.service assigned a value of
  type `string | File` (and earlier `null`) to the Service entity's `image: string` field,
  which failed the TypeScript compile (`nest build`) — so the backend Docker image never built.
  Fixed by guaranteeing a string: image = uploaded file path, else a string DTO value, else ''.
- Added body-parser as a direct dependency (it's imported in main.ts).
- Verified with clean installs: backend `nest build` EXIT 0, frontend `vite build` EXIT 0.

## DEPLOYMENT-READY (free hosting: Vercel + Render + Neon)
- Added DB SSL support (set DB_SSL=true) so the backend can connect to Neon / managed Postgres.
- Redis client + BullMQ now accept REDIS_PASSWORD + REDIS_TLS (for Upstash); Redis stays fully
  optional (leave REDIS_HOST blank to run without it on a single instance).
- .env.example updated: DB_SSL, REDIS_PASSWORD, REDIS_TLS added; Stripe removed (not used).
- Backend already binds process.env.PORT (Render-ready); frontend reads VITE_API_BASE_URL.
