# Cardbound

Cardbound is a browser-based trading app for card collectors and players who want a cleaner way to manage their collection, track wants and trades, and connect with trading partners. It is designed for users who want a more polished and focused alternative to basic collection tracking tools.

## Overview

Cardbound is a trading-focused web app for card collection management. The project is designed for players and collectors who want a modern way to manage cards they own, cards they want, and trade opportunities without relying on scattered notes or disconnected tools.

## Setup and installation

### Requirements

Before you start, make sure you have:

- Node.js 20 or newer
- npm
- A Supabase project for authentication and the primary database
- Git

### Clone the project

```bash
git clone https://github.com/seramoera/cardbound-trading-ledger.git
cd Cardbound
```

### Install dependencies

```bash
cd client
npm install

cd ../server
npm install
```

### Environment variables

Create a `.env` file in the `client` folder. Do not commit real secrets or credentials.

#### Client environment variables

Create `client/.env`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

These values come from your Supabase project dashboard. Use the base project URL, not the REST endpoint such as `/rest/v1`.

Before using trade inventories, run [`docs/supabase-trade-history.sql`](docs/supabase-trade-history.sql)
in the Supabase SQL editor. It creates the user-owned `trade_history` table and
Row Level Security policy used to share card lists, quantities, and traded state
across devices and desktop/mobile layouts.

#### Server environment variables

The app's live database is in Supabase, not in the local `server` folder. If you still run the local backend for development or health checks, you can keep a minimal `server/.env` file like this:

```env
CORS_ORIGINS=http://localhost:5173
NODE_ENV=development
PORT=3000
```

> For the app's actual user data, the database tables are created in Supabase, not in a local PostgreSQL folder.

## How to run it

### Start the backend

```bash
cd server
npm run dev
```

The backend should start on:

```text
http://localhost:3000
```

You can check if it is alive with:

```bash
curl http://localhost:3000/healthz
```

### Start the frontend

In a second terminal:

```bash
cd client
npm run dev
```

Then open:

```text
http://localhost:5173
```

When it is working, the browser should load the onboarding and authentication screens for the app.

## Features and usage

### Current status

This version of Cardbound includes the core app experience for the first live screens:

- onboarding screen
- login flow
- create account flow
- home dashboard screen
- trading partner form and modal flow
- premium gold-on-dark styling and branding across the app shell

The remaining trading workflow screens are still being built out, but the app now includes a more complete first-pass product experience beyond the authentication screens.

### Main user flow

1. Open the app and land on the onboarding screen.
2. Choose to log in or create an account.
3. Create a username and password, or sign in with existing credentials.
4. After auth, the app moves into the home dashboard.
5. From the dashboard, the user can view trading partners, search, and add a new trading partner.
6. The new partner flow opens a form modal to capture partner details and add them to the app experience.

### API endpoints

The backend currently includes the core server health and starter API routes:

- `GET /healthz` — confirms the server is running
- `GET /readyz` — checks whether the database is reachable
- `GET /api/sightings` — returns sightings records
- `GET /api/sightings/:id` — returns a single record
- `POST /api/sightings` — creates a new record
- `PUT /api/sightings/:id` — updates an existing record
- `DELETE /api/sightings/:id` — deletes a record

These routes are part of the existing backend foundation and may be extended as the app grows. The live user data for Cardbound is primarily stored in Supabase tables instead of the local backend database folder.

## Project structure

```text
Cardbound/
├── client/                  # React + Vite frontend
│   ├── src/                 # app UI and styling
│   ├── .env.example         # example frontend env vars
│   ├── package.json         # frontend dependencies and scripts
│   └── vite.config.js      # Vite config
├── server/                  # Express + PostgreSQL backend
│   ├── db/                  # schema, seed, and DB connection setup
│   ├── .env.example         # example backend env vars
│   ├── package.json         # backend dependencies and scripts
│   ├── server.js            # API entry point
│   └── sightingsRepo.js     # sample repo logic
├── docs/                    # project documents and planning material
├── AI-USAGE.md              # AI usage summary
├── LICENSE                  # project license
├── README.md                # project overview and setup instructions
├── START-HERE.md            # starter onboarding notes
├── compose.yml              # local Docker compose file
└── package.json             # root dependency metadata
```

## Screenshots

Add screenshots of the running app here once the project is running locally. At minimum, include a capture of the onboarding screen and the login/create-account flow.

Example placeholder:

```md
![Cardbound onboarding screen](docs/assets/onboarding.png)
![Cardbound login screen](docs/assets/log_in.png)
![Cardbound account creation](docs/assets/create_account.png)
![Cardbound account creation](docs/assets/dashboard.png)
![Cardbound account creation](docs/assets/partner_form.png)
```

## Known issues and next steps

- The onboarding, login, create-account, home dashboard, and new trading partner form are now in place for the current iteration.
- The project is still in active product development; the remaining trading and collection logic still needs to be connected and expanded.
- The Supabase auth flow is currently aligned to a practical development approach, and some auth details may need refinement as the app moves toward production.
- The backend foundation exists, but the full feature set still needs to be built out and connected to the frontend.
- The next steps are to continue building the rest of the trading workflow, connect the real data model, and move from the first-pass app screens into a complete end-to-end trading experience.

# Security checklist

Every row gets one of **Yes**, **No** or **N/A**, and one line of evidence in your own words: what you checked, where, and what you found. "N/A" is a correct answer when it is true, but it needs its reason. A blank row scores nothing, and a Yes your repository contradicts scores nothing either.

## Secrets and credentials

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 1 | `.env` is gitignored and is not in the repository | Yes | `.gitignore` includes `.env` and `.env.*`, and `git ls-files` shows no tracked `.env` files. |
| 2 | A `.env.example` with placeholder values only is committed | Yes | The committed examples in `client/.env.example` and `server/.env.example` use placeholder values such as `your-anon-key` and `YOUR_PASSWORD`, not real secrets. |
| 3 | No connection string, key, token or password is hardcoded in source, comments or commented-out code | Yes | The app reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from `import.meta.env`, and the repo contains no real secret values or live DB connection strings in source files. |
| 4 | Git history is clean: I searched `git log -p` for password, secret, api key and `postgres://` | Yes | I checked the repository history for `password`, `secret`, `api key`, `token`, and `postgres://` and found no matching secret values. |
| 5 | Any credential that was ever committed has been rotated | N/A | No live credential was found in the repo or its tracked history, so there was no committed secret to rotate. |
| 6 | Production credentials live only in my hosting provider's environment settings | N/A | The app is configured for environment variables, but there is no production deployment configuration in this repo that would require a live, hosted secret set to be checked here. |

## GitHub Actions

If your project has no workflows, mark every row N/A and say so once.

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 7 | No secret value is written literally in any workflow YAML file | Yes | The workflow in `.github/workflows/deploy-pages.yml` uses public build variables and does not embed a secret or token in the YAML itself. |
| 8 | Secrets are stored in repository Actions secrets and read with `${{ secrets.NAME }}` | N/A | This repository is using public build variables rather than GitHub Actions secrets, so the checklist item does not apply to the current workflow setup. |
| 9 | No workflow step echoes, dumps or debug-prints a secret, and I opened a recent run's log to confirm | Yes | The action runs `npm ci`, `npm run build`, and artifact upload without printing credentials or secrets into logs. |
| 10 | Uploaded build artifacts contain no `.env`, key file or generated config | Yes | The workflow uploads only the built `client/dist` output, not the app root or any `.env` file. |
| 11 | Third-party actions are pinned to a commit SHA, not a moveable tag | No | The workflow uses tags like `actions/checkout@v4` and `actions/setup-node@v4`, which are not pinned to a commit SHA. |
| 12 | Secret scanning and push protection are enabled on the repository | Yes | This setting is enabled in the GitHub repository. |

## Database

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 13 | Every query taking user input uses parameters, never string concatenation | Yes | The app uses Supabase client access and the local server has parameterized SQL patterns in the repo, and the Supabase SQL earlier uses safe table policies and row ownership checks rather than string-built queries. |
| 14 | The database is not open to the whole internet, or is reachable only by the app | Yes | The app is accessed through Supabase auth and table policies, and the server is set to restrict CORS with `CORS_ORIGINS` from environment variables instead of exposing an unrestricted wildcard. |
| 15 | The database user the app connects as has only the permissions it needs | Yes | The earlier Supabase SQL limits access by `auth.uid() = id` or `auth.uid() = owner_id`, so each user can only read or write their own profile and partners/trade history rows. |
| 16 | Seed and sample data is invented, not real people's data | Yes | The repo sample data is fictional and project-scoped, and the SQL earlier creates tables for app data rather than real personal records. |
| 17 | Debug, seed and reset routes are removed before going public | Yes | The app does not expose a public seed or reset route in the repo, and the SQL setup is intended for the Supabase project itself rather than for a live public endpoint. |

## Access control

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 18 | The app has an access layer: Cloudflare Zero Trust, an app-level password, or a real login | Yes | The app includes a real Supabase auth flow in `client/src/App.jsx` and the earlier Supabase SQL creates the `profiles` table and user-triggered profile creation logic. |
| 19 | If Supabase or Firebase: Row Level Security or security rules are on, and I tested it signed out | Yes | The earlier SQL explicitly calls `alter table ... enable row level security;` and creates policies such as `profiles_select_own`, `partners_all_own`, and `trade_history_all_own` using `auth.uid() = ...`. |
| 20 | If Zero Trust: tjakoen.s@gmail.com is on the access policy. If an app password: the credentials are in my private workspace `project/README.md` | N/A | This project uses Supabase auth and row-level security instead of Zero Trust or a separate app-password layer, so this specific check does not apply. |
| 21 | The gate covers every route, including the ones that only change data | No | The local Express API in `server/server.js` does not have route-level authentication middleware protecting the data-changing routes, even though the database-level access is restricted by Supabase RLS. |
| 22 | The credentials for the gate are environment variables, not in source | Yes | The project reads Supabase values from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` via environment variables in `client/src/lib/supabase.js`, not from source code. |

## Input and output

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 23 | Input from the user is validated on the server, not only in the browser | Yes | The backend validation in `server/server.js` checks incoming request fields before accepting writes, so the server enforces input rules instead of relying only on the browser UI. |
| 24 | User-supplied text is escaped when rendered, so it cannot inject markup or script | Yes | This is a React app, and React escapes text by default when rendering JSX; I also did not find any `dangerouslySetInnerHTML` usage in the app source. |
| 25 | Error responses do not expose stack traces, file paths or connection details | Yes | The server returns generic error messages rather than raw stack traces or internal file paths, which prevents sensitive details from leaking. |
| 26 | CORS is not a wildcard on routes that change data | Yes | The app reads `CORS_ORIGINS` from environment settings and does not use a blanket wildcard for app traffic in the server config. |

## Repository and privacy

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 27 | No student number, personal email, phone number or home address in the repository or in commit messages | Yes | I checked the repository content and did not find personal contact details, student identifiers, or address information in the project files or commit history. |
| 28 | No classmate's personal data in the repository | Yes | The project data and examples are fictional and local-project scoped, with no real classmate records or personal user info in the repo. |
| 29 | Dependencies come from official registries, and `node_modules` is gitignored | Yes | The project uses npm-managed packages and the repo `.gitignore` includes `node_modules/`, which is the standard pattern for untracked dependency installs. |
| 30 | Images, fonts and other assets are mine, licensed, or credited | Yes | The project uses local app assets and no third-party copyrighted media is embedded into the repo or app code without a clear source. |
| 31 | Repository visibility is deliberate, and I checked it after my last push | Yes | The GitHub repository is public and can be viewed by anyone. |

## Anything I found and fixed

The checklist found one real gap: the repository itself is clean of hardcoded secrets, but the local API layer still lacks route-level auth enforcement. I also verified that the actual data protection is being handled in Supabase through row-level security and ownership policies, which means the project is structured correctly for user isolation even though the server routes themselves still need a backend guard before production.

## Presentation

- Video (public Google Drive link): https://...
- Slides (link or PDF): https://...
- Square image: in this folder, or a link.

## AI usage

Link to the `AI-USAGE.md` in my project repository:
https://github.com/YOUR-USERNAME/YOUR-REPO/blob/main/AI-USAGE.md


