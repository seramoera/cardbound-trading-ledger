# Cardbound

Cardbound is a browser-based trading app for card collectors and players who want a cleaner way to manage their collection, track wants and trades, and connect with trading partners. It is designed for users who want a more polished and focused alternative to basic collection tracking tools.

## Overview

Cardbound is a trading-focused web app for card collection management. The project is designed for players and collectors who want a modern way to manage cards they own, cards they want, and trade opportunities without relying on scattered notes or disconnected tools.

## Setup and installation

### Requirements

Before you start, make sure you have:

- Node.js 20 or newer
- npm
- PostgreSQL running locally or available through a hosted service
- A Supabase project for authentication
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

Create a `.env` file in the `client` folder and a `.env` file in the `server` folder. Do not commit real secrets or credentials.

#### Client environment variables

Create `client/.env`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

These values come from your Supabase project dashboard. The project URL is the base project URL, not the REST endpoint.

#### Server environment variables

Create `server/.env`:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/cardbound
CORS_ORIGINS=http://localhost:5173
NODE_ENV=development
```

Optional local runtime variable:

```env
PORT=3000
```

> The server can also run without setting `PORT` manually; if it is omitted, it normally defaults to `3000`.

### Database setup

From the `server` folder:

```bash
npm run db:reset
```

This runs the schema and seed files to create the database tables and sample data.

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

This version of Cardbound includes the first part of the app experience:

- onboarding screen
- login flow
- create account flow
- premium styling and branding across the auth experience

The rest of the application screens are still placeholder-level and are not yet fully implemented.

### Main user flow

1. Open the app and land on the onboarding screen.
2. Choose to log in or create an account.
3. Create a username and password, or sign in with existing credentials.
4. After auth, the app moves into the main app shell and continues into the trading experience.

### API endpoints

The backend currently includes the core server health and starter API routes:

- `GET /healthz` — confirms the server is running
- `GET /readyz` — checks whether the database is reachable
- `GET /api/sightings` — returns sightings records
- `GET /api/sightings/:id` — returns a single record
- `POST /api/sightings` — creates a new record
- `PUT /api/sightings/:id` — updates an existing record
- `DELETE /api/sightings/:id` — deletes a record

These routes are part of the existing backend foundation and may be extended as the app grows.

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
```

## Known issues and next steps

- The onboarding, login, and create-account flow are complete enough for the current iteration, but the remaining app screens are still placeholders.
- The project is not yet a fully finished trading app end-to-end; the core product screens and trading logic still need to be implemented.
- The Supabase auth flow is currently aligned to a practical development approach, and some auth details may need refinement as the app moves toward production.
- The backend foundation exists, but the full feature set still needs to be built out and connected to the frontend.

Next steps are to finish the core app screens, connect the real trading and collection logic, and move from the sign-up flow into the finished product experience.
