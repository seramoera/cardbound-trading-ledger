# App Proposal: Cardbound

## App name

Cardbound

## What the app is for

Cardbound is a trading-card tracker that keeps two running lists per trading
partner: cards you have that they want, and cards they have that you want.
Presented as a two-sided trade window, it gives trade night a ready-made
checklist instead of a scramble to remember who was after what.

## Who it is for

Magic: The Gathering collectors who trade regularly with the same small circle
of people: a playgroup, a local game store crew, or a few college friends. They
currently rely on memory, group chats, or scattered notes to track who wants
which card. This includes me: I trade with the same four or five people and
consistently forget what I promised someone two weeks ago.

When they open the app, they are about to meet one of these people, either in
person at the shop or over a call. They want to quickly see what they owe each
other, with the actual card art visible so there is no confusion about the
printing or card, and then tick entries off as the swap happens.

## Sections and routes

| Route | Section | Purpose |
| --- | --- | --- |
| `/auth` | Onboarding, sign up, and log in | A single entry route with three states: a welcome panel explaining what Cardbound does, a create-account form, and a log-in form. Returning users get to their own data, while new users can understand the app before committing. |
| `/` | Home / partner list | Shows all of the user's trading partners at a glance with pending-trade counts, so they can pick who they are trading with. |
| `/partners/new` | Add partner | Creates a new trading partner (name and notes) before cards can be tracked against them. |
| `/partners/:id` | Trade window | The core screen: a two-panel trade window showing the "I Want" and "They Want" lists for one partner, with Scryfall-backed card search to add entries and an action to mark entries traded. |
| `/history` | Trade history | A filterable log of every entry marked traded, across all partners, so the user can look back at past swaps and settle disputes about what was already handed over. |

**Screen-count note:** Onboarding, sign-up, and log-in are one route (`/auth`)
with three rendered states rather than three separate routes. They share a
layout, and the user switches between them without a real navigation change.
Treating them as one screen keeps the app inside the 3–5 screen range without
dropping functionality.

## State and data

For the most important screen, the Trade Window (`/partners/:id`):

| Data | Shape | Owner | Changes when |
| --- | --- | --- | --- |
| `currentPartner` | `{ id, notes }` | `PartnerDetailPage` (fetched from the API using the route parameter) | The page loads or the user edits partner info |
| `wishlistEntries` | Array of `{ id, partnerId, cardName, setCode, condition, direction, traded, dateTraded, scryfallId, imageUrl, colorIdentity }` | `PartnerDetailPage` | The user adds an entry, marks one traded, or deletes one |
| `cardSearchQuery` | String | `AddCardSearch` (child of `WantPanel`) | The user types in the card search box |
| `cardSearchResults` | Array of `{ scryfallId, name, setCode, imageUrl, colorIdentity }` | `AddCardSearch` | A debounced Scryfall request returns |
| `isSearching` / `searchError` | Boolean / string or `null` | `AddCardSearch` | A Scryfall request starts, succeeds, or fails |
| `pendingEntryDraft` | `{ selectedCard, condition, direction }` | `AddCardSearch` | The user picks a card from results and sets its condition before submitting |
| `activePanel` (mobile only) | `"iWant"` or `"theyWant"` | `PartnerDetailPage` | The user switches panels on a narrow screen where the two panels stack |

## What each screen contains

### Auth (`/auth`) — three states

- **Welcome state**
  - **Block 1 — Wordmark and tagline:** The Cardbound logo/wordmark and a
    one-line explanation of what the app does.
  - **Block 2 — Short explainer:** Two or three brief lines or icons summarizing
    the core loop: add a partner, track wants, and check them off.
  - **Block 3 — Entry buttons:** "Log In" and "Create Account," which switch
    this route to either of the other two states.
- **Log-in state**
  - **Block 1 — Back control:** Link back to the welcome state.
  - **Block 2 — Title and divider.**
  - **Block 3 — Form:** Username field, password field, and submit button.
  - **Block 4 — Switch link:** "Don't have an account? Create one," which
    switches to the create-account state.
- **Create-account state:** The same block structure as log-in, with a switch
  link back to the log-in state.

### Home / partner list (`/`)

- **Block 1 — Top bar:** App wordmark/logo and a sign-out button.
- **Block 2 — Search and add row:** Search input to filter partners by name,
  plus an "Add Partner" button.
- **Block 3 — Partner grid (repeating):** One nameplate per partner, each
  showing an initials badge, name, pending-trade count badge, and last-traded
  date. Clicking one navigates to that partner's Trade Window.
- **Block 4 — Footer:** Shared app footer/navigation.

### Add partner (`/partners/new`)

- **Block 1 — Top bar:** Back control and screen title ("Add Partner").
- **Block 2 — Form:** Name field and notes text area.
- **Block 3 — Save button:** Submits the form and returns to Home with the new
  partner added.

### Trade window (`/partners/:id`)

- **Block 1 — Top bar:** App wordmark, partner's initials badge and name,
  edit-partner button, and link back to Home.
- **Block 2 — "I Want" panel:** Panel heading naming the partner, a card-search
  input, and a vertical list of card slots (card art, card name, set code and
  condition, mana-color border).
- **Block 3 — Divider:** A vertical seam between the panels with a
  bidirectional trade arrow at its center.
- **Block 4 — "They Want" panel:** Same structure as Block 2, mirrored, with a
  heading, search input, and list of card slots.
- **Block 5 — Card slot (repeating within both panels):** Thumbnail, name,
  set/condition line, confirm-trade checkmark button, delete control, and a
  "traded" stamp state for completed entries.

### Trade history (`/history`)

- **Block 1 — Top bar:** Back control and screen title ("Trade History").
- **Block 2 — Filter bar:** Filters by partner and date range.
- **Block 3 — Trade groups (repeating):** Entries grouped by partner and date.
  Each group has a heading followed by card rows (card name, direction,
  set/condition, and date traded).
- **Block 4 — Footer:** Shared app footer/navigation.

## Content to gather

- **Scryfall API:** `api.scryfall.com` supplies card data and images at request
  time, including names, set codes, image URLs, and color identity, so a card
  database does not need to be built by hand. Read its usage policy first for
  rate limits, required attribution, and caching expectations; it is a free
  public API run on fair-use terms.
- **Condition labels:** Standard collector abbreviations (NM, LP, MP, HP, DMG)
  and their full names, since condition is entered by the user rather than
  supplied by Scryfall.
- **Seed data:** Two or three invented trading partners with plausible names
  and notes, plus a handful of entries each, so the home screen and trade
  window are not empty while development is underway.
- **Empty-state and error copy:** Messages for when a partner has no entries,
  a card search returns nothing, or Scryfall is unreachable.

## One risk

The part I am least sure about is wiring Scryfall search cleanly into the
add-card flow. Three specific unknowns are debouncing the input so a request
does not fire on every keystroke; handling the loading, empty, and error states
of an async results list without the UI flickering or getting stuck; and
deciding what to persist. Should the app store only `scryfallId` and re-fetch
images on every render, or cache `imageUrl` and `colorIdentity` in Postgres so
the app still renders if Scryfall is slow or down? I have not combined a
third-party search API with local persistence before.
