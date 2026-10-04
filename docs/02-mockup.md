# Cardbound — Wireframes and Component Breakdown

## Step A — Screen map

**Routes:** `/auth` (three states) · `/` (Home) · `/partners/new` ·
`/partners/:id` · `/history`

The arrows within `/auth` represent state switches, not real navigations.

```text
AUTH (/auth - one route, three rendered states)
-------------------------------------------------------------------------------
 "Log In"
 +---------------------------------------------+
 | v
 [Welcome] --"Create Account"--> [Create Account form] --"submit"--> [Home]
 ^ ^ |
 | | |
 | +----"Log In" (switch link)------+
 |
 | +----"Back <-" (from either form)
 | |
 v |
 [Log In form] --"submit"--> [Home]
-------------------------------------------------------------------------------
MAIN NAVIGATION
-------------------------------------------------------------------------------
 [Home] (/)
 |
 |--"click a partner nameplate"-------> [Trade Window] (/partners/:id)
 |
 |--"click + Add Partner"-------------> [Add Partner] (/partners/new)
 |
 |--"click History"-------------------> [Trade History] (/history)
 |
 +--"click sign-out"------------------> [Welcome] (/auth)
 [Add Partner] (/partners/new)
 |
 |--"click Save"----------------------> [Home] (new partner added)
 |
 +--"click Back <-"-------------------> [Home]
 [Trade Window] (/partners/:id)
 |
 |--"search card + select result"-----> (adds entry to I Want / They Want;
 |                                       stays on screen)
 |
 |--"click confirm-trade checkmark"---> (entry marked traded; stays)
 |
 |--"click delete control"------------> (entry removed; stays)
 |
 |--"click back link"-----------------> [Home]
 [Trade History] (/history)
 |
 |--"search partner / card filter"----> (list re-filters; stays on screen)
 |
 +--"click Back <-"-------------------> [Home]
```

## Step B — Box sketches per screen

### Screen 1: Welcome

```text
PHONE (375px)                  DESKTOP (1280px)
┌─────────────────────┐        ┌────────────────────────────────────────┐
│ [Background: misty  │        │ [Background: misty forest, ember ptcls]│
│ forest, embers]     │        │                                        │
│                     │        │       ┌──────────────────────┐         │
│ ┌───────────────┐   │        │       │ Logo / Wordmark      │         │
│ │ Logo/Wordmark │   │        │       │ Tagline              │         │
│ │ Tagline       │   │        │       │                      │         │
│ └───────────────┘   │        │       │ [Log In] [Create]    │         │
│ ┌────────────────┐  │        │       └──────────────────────┘         │
│ │ [Log In]       │  │        │                                        │
│ │ [Create Acct]  │  │        └────────────────────────────────────────┘
│ └────────────────┘  │
└─────────────────────┘
```

- **Phone:** Buttons stack vertically and are centered.
- **Desktop:** Card narrows to approximately 480px and stays centered.
- **Shared chrome:** No header or footer (splash only).

### Screen 2: Log In / Create Account

```text
PHONE                         DESKTOP
┌─────────────────────┐       ┌────────────────────────────────────────┐
│ [Plains BG, tint]   │       │ [Plains BG, tint]                       │
│ ┌───────────────┐   │       │       ┌──────────────────────┐          │
│ │ Back ←        │   │       │       │ Back ←               │          │
│ │ Title         │   │       │       │ Title                │          │
│ │ GoldDivider   │   │       │       │ GoldDivider          │          │
│ │ [Username]    │   │       │       │ [Username field]     │          │
│ │ [Password]    │   │       │       │ [Password field]     │          │
│ │ [Submit btn]  │   │       │       │ [Submit button]      │          │
│ │ Switch link   │   │       │       │ Switch link          │          │
│ └───────────────┘   │       │       └──────────────────────┘          │
└─────────────────────┘       └────────────────────────────────────────┘
```

- **Phone:** Form card is full-width with padding.
- **Desktop:** Fixed-width card of approximately 420px, centered.
- **Shared chrome:** No header or footer.

### Screen 3: Home (Partner List)

```text
PHONE                         DESKTOP
┌─────────────────────┐       ┌────────────────────────────────────────┐
│ ┌─────────────────┐ │       │ ┌──────────────────────────────────────┐│
│ │ TopBar          │ │       │ │ TopBar (logo | sign-out btn)         ││
│ │ logo | sign-out │ │       │ └──────────────────────────────────────┘│
│ └─────────────────┘ │       │                                        │
│ ┌─────────────────┐ │       │ ┌────────────────────────────────────┐ │
│ │ SearchBar       │ │       │ │ SearchBar [Add btn]                │ │
│ └─────────────────┘ │       │ └────────────────────────────────────┘ │
│ ┌─────────────────┐ │       │                                        │
│ │ PartnerNameplate│ │       │ ┌──────────┐ ┌──────────┐ ┌────────┐  │
│ └─────────────────┘ │       │ │Nameplate │ │Nameplate │ │Nameplt │  │
│ ┌─────────────────┐ │       │ └──────────┘ └──────────┘ └────────┘  │
│ │ PartnerNameplate│ │       │ ┌──────────┐ ┌──────────┐ …            │
│ └─────────────────┘ │       │ │Nameplate │ │Nameplate │              │
│ …                   │       │ └──────────┘ └──────────┘              │
│ ┌─────────────────┐ │       │ ┌──────────────────────────────────────┐│
│ │ [+ Add Partner] │ │       │ │ AppFooter                            ││
│ └─────────────────┘ │       │ └──────────────────────────────────────┘│
│ ┌─────────────────┐ │       └────────────────────────────────────────┘
│ │ AppFooter       │ │
│ └─────────────────┘ │
└─────────────────────┘
```

- **Phone:** One-column stack of nameplates; Add button below the list.
- **Desktop:** Two- or three-column grid of nameplates; Add button inline with
  search.
- **Breakpoints:** `grid-cols-1` → `md:grid-cols-2` → `lg:grid-cols-3`.

### Screen 4: Add Partner

```text
PHONE                         DESKTOP
┌─────────────────────┐       ┌────────────────────────────────────────┐
│ TopBar              │       │ TopBar                                 │
│ ┌─────────────────┐ │       │ ┌──────────────────────────────────┐   │
│ │ Back ← + Title  │ │       │ │ Back ← / Title                   │   │
│ │ GoldDivider     │ │       │ │ GoldDivider                      │   │
│ │ [Name input]    │ │       │ │ [Name] [Notes textarea]          │   │
│ │ [Notes textarea]│ │       │ │                                  │   │
│ │ [Save button]   │ │       │ │ [Save]                           │   │
│ └─────────────────┘ │       │ └──────────────────────────────────┘   │
│ AppFooter           │       │ AppFooter                              │
└─────────────────────┘       └────────────────────────────────────────┘
```

- **Phone:** Single-column form.
- **Desktop:** Form card approximately 600px wide and centered; name and notes
  side by side (optional).

### Screen 5: Trade Window (Partner Detail)

```text
PHONE                         DESKTOP
┌─────────────────────┐       ┌────────────────────────────────────────┐
│ TopBar              │       │ TopBar                                 │
│ ┌─────────────────┐ │       │ ┌──────────────────────────────────────┐│
│ │ PartnerNameplate│ │       │ │ PartnerNameplate (full width)        ││
│ └─────────────────┘ │       │ └──────────────────────────────────────┘│
│ [Tab: Want | Give]  │       │ ┌────────────────┬───────────────────┐ │
│ ┌─────────────────┐ │       │ │ WANT column    │ GIVE column       │ │
│ │ CardGrid (1 col)│ │       │ │ ┌──┐ ┌──┐     │ ┌──┐ ┌──┐        │ │
│ │ ┌──┐ ┌──┐       │ │       │ │ │  │ │  │     │ │  │ │  │        │ │
│ │ ┌──┐ ┌──┐       │ │       │ │ card grid     │ card grid         │ │
│ └─────────────────┘ │       │ │ [+ Add card]  │ [+ Add card]      │ │
│ [+ Add Card btn]    │       │ └────────────────┴───────────────────┘ │
│ [History tab/link]  │       │ [View History →]                       │
└─────────────────────┘       └────────────────────────────────────────┘
```

- **Phone:** Tabs switch Want/Give; two-column card grid within the active tab.
- **Desktop:** Want and Give side-by-side split columns; three- to four-column
  card grid in each.
- **Breakpoints:** Tabs → `md:` two-column split.

### Screen 6: Trade History

```text
PHONE                         DESKTOP
┌─────────────────────┐       ┌────────────────────────────────────────┐
│ TopBar              │       │ TopBar                                 │
│ ┌─────────────────┐ │       │ ┌───────────────────────────────────┐  │
│ │ Back ← + Title  │ │       │ │ Filter bar: [partner] [date range]│  │
│ │ Filter row      │ │       │ └───────────────────────────────────┘  │
│ └─────────────────┘ │       │ ┌───────────────────────────────────┐  │
│ ┌─────────────────┐ │       │ │ TradeGroup (partner + date)       │  │
│ │ TradeGroup      │ │       │ │ CardRow CardRow …                 │  │
│ │ CardRow         │ │       │ └───────────────────────────────────┘  │
│ │ CardRow …       │ │       │ ┌───────────────────────────────────┐  │
│ └─────────────────┘ │       │ │ TradeGroup …                     │  │
│ AppFooter           │       │ └───────────────────────────────────┘  │
└─────────────────────┘       │ AppFooter                              │
                              └────────────────────────────────────────┘
```

- **Phone:** Stacked trade groups; compact card rows.
- **Desktop:** Wider, table-like rows with more columns visible (set,
  condition).

## Step C — Component tree

**Busiest screen:** Trade Window

```text
Page
└── TradeWindow
    ├── TopBar [organism]
    │   ├── Logo / WordMark [atom]
    │   └── SignOutButton [atom]
    │
    ├── PartnerNameplate [organism]
    │   ├── PortraitBadge [molecule]
    │   │   └── InitialsAvatar [atom]
    │   ├── NameplateInfo [molecule]
    │   │   ├── PartnerName [atom]
    │   │   ├── ClassTitle [atom]
    │   │   └── GoldDivider [atom]
    │   └── StatPanel [molecule]
    │       ├── StatRow [atom] (last traded, card count)
    │       ├── ProgressBar [atom]
    │       └── ManaColorSwatches [atom]
    │
    ├── WantGivePanel [organism] (phone: tabbed / desktop: split)
    │   ├── SectionHeader [atom] (Want / Give label)
    │   ├── CardGrid [organism]
    │   │   ├── TradeCard [molecule] (repeated, keyed by id)
    │   │   │   ├── CardImage [atom]
    │   │   │   ├── CardLabel [atom]
    │   │   │   ├── ManaColorBadge [atom]
    │   │   │   └── ConditionTag [atom]
    │   │   └── AddCardTile [molecule] (+ button stub)
    │   └── CardInspectPopup [molecule] (hover overlay)
    │       ├── CardImage (lg) [atom]
    │       └── CardMetaTable [molecule]
    │
    └── AppFooter [organism] (shared: Home / AddPartner / History)
        ├── NavLink × n [atom]
        └── GoldDivider [atom]
```

### Atomic design folder map

| Level | Components |
| --- | --- |
| Atoms | GoldButton, GoldDivider, InitialsAvatar, CardImage, CardLabel, ManaColorBadge, ConditionTag, ProgressBar, ClassTitle, SectionHeader, NavLink, SignOutButton, StatRow, WordMark |
| Molecules | PortraitBadge, NameplateInfo, StatPanel, TradeCard, AddCardTile, CardInspectPopup, CardMetaTable, SearchBar, FormField |
| Organisms | TopBar, PartnerNameplate, WantGivePanel, CardGrid, AppFooter, PartnerList, TradeGroup |
| Pages | WelcomeScreen, AuthScreen, HomeScreen, AddPartnerScreen, TradeWindow, TradeHistoryScreen |

## Step D — Sanity check

**Primary user task:** "Record a new trade with a partner"

```text
Welcome ──[Log In]──────> Home ──[tap partner nameplate]──> Trade Window
 └────[Create Acct]───> Home                         │
                                                     ├──[+ add card tile]──> Add Card form
                                                     ├──[mark as traded]───> card changes state
                                                     └──[View History]─────> Trade History
```
