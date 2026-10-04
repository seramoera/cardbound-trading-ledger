# AI usage

This project was built with AI assistance. This file records how I used it and what I reviewed or changed.

## 1. How I used AI

### 2026-09-24 - Week 1 foundation
- **Tool:** GitHub Copilot Chat.
- **What I asked for:** Help shaping the first Cardbound screens and turning the starter project into an onboarding, authentication, and trading-partner flow.
- **What it gave back:** React screen structure, interaction ideas, and initial UI implementation suggestions.
- **What I kept, what I changed, and why:** I used the suggestions as a starting point, then adapted the screens and copy to Cardbound's trading-ledger purpose.
- **Commit:** [Week 1](https://github.com/seramoera/cardbound-trading-ledger/commit/0fce74eb87258edb9ecad25c5099627212bd59ea)

### 2026-09-26 - Home and add-partner experience
- **Tool:** GitHub Copilot Chat.
- **What I asked for:** Help refining the home partner list and the add-partner form's desktop UI/UX.
- **What it gave back:** Component and CSS layout suggestions for partner cards, navigation, and the form.
- **What I kept, what I changed, and why:** I kept the dark fantasy visual direction and adjusted spacing, hierarchy, and controls to fit the app's workflow.
- **Commit:** [Home and add-partner UI/UX](https://github.com/seramoera/cardbound-trading-ledger/commit/37c5f0e73f1151fe262ed023dc8f88e79fea5582)

### 2026-09-29 - Trading-partner data
- **Tool:** GitHub Copilot Chat.
- **What I asked for:** Help connecting trading partners to persistent account data.
- **What it gave back:** Suggestions for loading, inserting, and presenting partner records through the app's data layer.
- **What I kept, what I changed, and why:** I kept the account-owned partner flow and adapted the fields and display counts to Cardbound.
- **Commit:** [Trading-partner database work](https://github.com/seramoera/cardbound-trading-ledger/commit/093032384a853eff516e315125729ecabcb9bf1f)

### 2026-09-29 - Scryfall card search
- **Tool:** GitHub Copilot Chat.
- **What I asked for:** Help integrating Scryfall search into the trade inventory.
- **What it gave back:** API request, result parsing, and card-search UI suggestions.
- **What I kept, what I changed, and why:** I used the Scryfall card data and image fields, then tailored the results and add-card behavior to the two trade lists.
- **Commit:** [Scryfall API integration](https://github.com/seramoera/cardbound-trading-ledger/commit/29609cd123e7d8f3a93cd5e6a860fd2b562f1c32)

### 2026-10-01 - Desktop trade experience
- **Tool:** GitHub Copilot Chat.
- **What I asked for:** Help completing the desktop trade screen and its inventory interactions.
- **What it gave back:** Layout and styling suggestions for the partner summary, inventory panels, card rows, and trade states.
- **What I kept, what I changed, and why:** I kept the two-sided trade workflow and refined the visual hierarchy and controls so both inventories remained usable.
- **Commit:** [Desktop UI/UX](https://github.com/seramoera/cardbound-trading-ledger/commit/3c434342296640994710da4d346843a2a8ef1541)

### 2026-10-01 - Mobile trade layout
- **Tool:** GitHub Copilot Chat.
- **What I asked for:** Help adapting the partner list and trade inventory to narrow mobile screens.
- **What it gave back:** Responsive CSS and mobile navigation/control layout ideas.
- **What I kept, what I changed, and why:** I kept the compact mobile inventory and iterated on card sizing, alignment, and action placement after checking the rendered behavior.
- **Commits:** [mobile view](https://github.com/seramoera/cardbound-trading-ledger/commit/e654e02c844c79233967a22956ee30c628386237)


## 2. Where the AI got it wrong

### Case 1 - Add icon overflow on mobile
- **What it gave me:** Sizing the Add SVG at its native canvas size to make its visible mark match the History icon.
- **What was wrong with it:** The SVG canvas extended past its 36px button and overlapped the divider.
- **What I did instead:** I required a clipped 36px wrapper and positioned the artwork inside it, then checked the client build.
- **Related commit:** [Mobile-view implementation](https://github.com/seramoera/cardbound-trading-ledger/commit/e654e02c844c79233967a22956ee30c628386237)

### Case 2 - Inventory panel height
- **What it gave me:** An initial height adjustment on the mobile grid wrapper.
- **What was wrong with it:** The visible panel kept its own sizing, so changing the wrapper did not make the inventory box visibly taller.
- **What I did instead:** I applied the viewport-based height to the active trade panel itself and verified the production build.
- **Related commit:** [Mobile-view implementation](https://github.com/seramoera/cardbound-trading-ledger/commit/e654e02c844c79233967a22956ee30c628386237)

### Case 3 - Mobile trade tab placement
- **What it gave me:** A first attempt to add the mobile inventory tabs in the trade screen JSX.
- **What was wrong with it:** The tabs landed outside the trade screen's return block, causing a JSX parse/build error.
- **What I did instead:** I moved the tabs inside the trade screen and reran the build, which passed.
- **Related commit:** [Mobile-view implementation](https://github.com/seramoera/cardbound-trading-ledger/commit/e654e02c844c79233967a22956ee30c628386237)

## 3. Who wrote what

### Written by me - desktop stylesheet and screen layout
- **File:** `client/src/styles.css`
- **Commit:** [Desktop UI/UX stylesheet changes](https://github.com/seramoera/cardbound-trading-ledger/commit/3c434342296640994710da4d346843a2a8ef1541#diff-0e45e2badfea83a42cb89739df91080ba70c458e4f03bfec70055dcae7ea594a)
- **What it does and why it is built this way:** I wrote most of the stylesheet that controls Cardbound's visual layout. In this commit, that includes the shared welcome and authentication presentation, responsive logos, the desktop trade screen header and partner summary, the two inventory panels, card rows and mana-color indicators, search controls, traded-state buttons, and the mana legend. I also styled the card image preview dialog and the history list. Keeping these rules in `styles.css` lets me adjust spacing, color, typography, and responsive layout separately from the React data and interaction logic. I consider this a substantial authored part of the project; the commit records the file changes, while this statement records my authorship.

### The AI-assisted part I understand best
- **File:** `client/src/App.jsx` (trade-history conversion and persistence flow).
- **Commit:** [Current app build](https://github.com/seramoera/cardbound-trading-ledger/commit/c9a5a4002646fe05c6e3ec186046c9125bd80ba7)
- **What it does and why we kept it:** It converts Supabase trade-history rows into lists grouped by partner, and serializes changes back with the owner, partner, list, card, quantity, and traded status. The UI then uses the same data model on desktop and mobile.
