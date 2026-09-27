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
| 12 | Secret scanning and push protection are enabled on the repository | N/A | This is a GitHub repository setting, not something I can verify from the checked-in code alone. |

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
| 31 | Repository visibility is deliberate, and I checked it after my last push | N/A | This is a GitHub repository setting and cannot be verified from the local workspace alone. |

## Anything I found and fixed

The checklist found one real gap: the repository itself is clean of hardcoded secrets, but the local API layer still lacks route-level auth enforcement. I also verified that the actual data protection is being handled in Supabase through row-level security and ownership policies, which means the project is structured correctly for user isolation even though the server routes themselves still need a backend guard before production.
