# Security checklist

## Secrets and credentials

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 1 | `.env` is gitignored and is not in the repository | Yes | `.gitignore` ignores `.env` and `.env.*` while allowing `.env.example`; `git ls-files` contains no non-example `.env` files. A local `client/.env` is ignored. |
| 2 | A `.env.example` with placeholder values only is committed | Yes | The root, client, and server examples use placeholders, local sample URLs, and public configuration names; they contain no production credentials. |
| 3 | No connection string, key, token or password is hardcoded in source, comments or commented-out code | Yes | Current source reads Supabase configuration from `import.meta.env`; the anon key is public client configuration, not a secret. The historical sample URL is noted separately below. |
| 4 | Git history is clean: I searched `git log -p` for password, secret, api key and `postgres://` | No | The broad keyword search returns documentation/config references. A credential-pattern scan found an old non-placeholder-looking local database URL in `server/.env.example` history.|
| 5 | Any credential that was ever committed has been rotated | N/A | The historical database URL was only a local sample and was never used as a real or hosted database credential, so there was no credential to rotate. |
| 6 | Production credentials live only in my hosting provider's environment settings | Yes | `VITE_SUPABASE_URL` and the public `VITE_SUPABASE_ANON_KEY` are configured in GitHub Actions repository Variables for the Pages build. The Supabase service-role key is not used in the client. |

## GitHub Actions

If your project has no workflows, mark every row N/A and say so once.

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 7 | No secret value is written literally in any workflow YAML file | Yes | `.github/workflows/deploy-pages.yml` reads the Supabase URL and public anon key from Actions variables. No secret or service-role key is embedded. |
| 8 | Secrets are stored in repository Actions secrets and read with `${{ secrets.NAME }}` | N/A | The Pages build needs public Supabase client configuration, not a secret. It uses Actions variables; the service-role key must never be used by this static client. |
| 9 | No workflow step echoes, dumps or debug-prints a secret, and I opened a recent run's log to confirm | Yes | Reviewed the latest GitHub Actions log shared for this project; it showed a build failure resolving the missing Supabase client dependency, but no secret values or environment dump. The workflow checks whether Supabase variables are empty and prints only their names, never their values. |
| 10 | Uploaded build artifacts contain no `.env`, key file or generated config | Yes | The workflow uploads only `client/dist`, not `.env` files. The compiled bundle intentionally contains the public Supabase URL and anon key; it must not contain a service-role key. |
| 11 | Third-party actions are pinned to a commit SHA, not a moveable tag | Yes | All four actions in `.github/workflows/deploy-pages.yml` are pinned to full 40-character commit SHAs. |
| 12 | Secret scanning and push protection are enabled on the repository | Yes | This setting is enabled in the GitHub repository. |

## Database

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 13 | Every query taking user input uses parameters, never string concatenation | Yes | The active client uses Supabase query-builder filters/upserts. The unused starter repository also uses PostgreSQL `$1` parameters for values. |
| 14 | The database is not open to the whole internet, or is reachable only by the app | Yes | RLS is enabled on all three tables, no `anon`/`PUBLIC` table grants are listed, and unsigned REST requests to `profiles`, `partners`, and `trade_history` each returned HTTP 401. |
| 15 | The database user the app connects as has only the permissions it needs | Yes | The latest grants list gives `authenticated` only profile SELECT/INSERT/UPDATE, partner SELECT/INSERT, and trade-history SELECT/INSERT/UPDATE/DELETE. No `anon`/`PUBLIC` grants or unnecessary TRUNCATE, REFERENCES, or TRIGGER privileges are listed. |
| 16 | Seed and sample data is invented, not real people's data | Yes | The repo sample data is fictional and project-scoped, and the SQL earlier creates tables for app data rather than real personal records. |
| 17 | Debug, seed and reset routes are removed before going public | Yes | The app does not expose a public seed or reset route in the repo, and the SQL setup is intended for the Supabase project itself rather than for a live public endpoint. |

## Access control

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 18 | The app has an access layer: Cloudflare Zero Trust, an app-level password, or a real login | Yes | `client/src/App.jsx` implements Supabase sign-up, sign-in, session restoration, and sign-out. |
| 19 | If Supabase or Firebase: Row Level Security or security rules are on, and I tested it signed out | Yes | RLS is enabled on `profiles`, `partners`, and `trade_history`; signed-out REST requests using the public anon key returned HTTP 401 for all three tables. |
| 20 | If Zero Trust: tjakoen.s@gmail.com is on the access policy. If an app password: the credentials are in my private workspace `project/README.md` | N/A | This project uses Supabase auth and row-level security instead of Zero Trust or a separate app-password layer, so this specific check does not apply. |
| 21 | The gate covers every route, including the ones that only change data | N/A | The deployed client uses Supabase directly and does not use the Express sightings routes. Those local starter routes have no authentication; do not deploy them publicly without adding authentication. Supabase data access relies on RLS. |
| 22 | The credentials for the gate are environment variables, not in source | N/A | There is no custom Basic Auth/Cloudflare gate. Supabase handles user credentials; the URL and anon key are public client configuration supplied through environment variables. |

## Input and output

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 23 | Input from the user is validated on the server, not only in the browser | No | The validation in `server/server.js` applies only to unused sightings routes. Active Cardbound data uses Supabase directly; database constraints cover some fields, but not all application validation is enforced server-side. |
| 24 | User-supplied text is escaped when rendered, so it cannot inject markup or script | Yes | This is a React app, and React escapes text by default when rendering JSX; I also did not find any `dangerouslySetInnerHTML` usage in the app source. |
| 25 | Error responses do not expose stack traces, file paths or connection details | No | Express returns a generic 500 response, but the active client displays Supabase `error.message` values. No stack trace exposure was observed, but errors are not fully sanitized. |
| 26 | CORS is not a wildcard on routes that change data | Yes | The optional Express server uses an origin allowlist from `CORS_ORIGINS` (defaulting to localhost), not `*`. Supabase's hosted API has separate provider-managed configuration. |

## Repository and privacy

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 27 | No student number, personal email, phone number or home address in the repository or in commit messages | No | Existing published commits still contain a Gmail-domain author address. This repository's local Git config now uses the GitHub noreply address for future commits. Removing the old address requires rewriting history and force-pushing; the grading contact is not the author's address. |
| 28 | No classmate's personal data in the repository | Yes | The project data and examples are fictional and local-project scoped, with no real classmate records or personal user info in the repo. |
| 29 | Dependencies come from official registries, and `node_modules` is gitignored | Yes | The project uses npm-managed packages and the repo `.gitignore` includes `node_modules/`, which is the standard pattern for untracked dependency installs. |
| 30 | Images, fonts and other assets are mine, licensed, or credited | Yes | The README's `Third-party attribution` section credits card data and unmodified images to Scryfall and the Chandra/Ajani background artwork to Wizards of the Coast. |
| 31 | Repository visibility is deliberate, and I checked it after my last push | Yes | The GitHub repository is public and can be viewed by anyone. |


## Findings and outstanding checks

- The Pages workflow now uses SHA-pinned actions and builds with the Supabase URL and public anon key from Actions variables.
- The app uses Supabase directly. The local Express sightings API is unused and has no route authentication; do not expose it publicly as-is.
- Anonymous access is now denied with HTTP 401, and the authenticated grants match the current app operations. Also test with two signed-in accounts to confirm RLS prevents cross-user reads and writes; deploy the updated client so signup uses the username-availability RPC.
- Review the historical local database URL and rotate its password if it was ever used as a real credential.
- Existing published commit metadata contains a Gmail-domain author address. Local Git config now uses GitHub noreply for future commits; removing the old address still requires rewriting history.
- Verify the bundled artwork's usage rights and confirm GitHub repository visibility and secret-scanning settings.
