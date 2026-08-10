# PTCGL Tracker

Import Pokémon TCG Live battle logs, manage decks, track win rate, and review turn-by-turn timelines.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. Register and set your PTCGL display name (exact match, e.g. `Fairy_VN`).
2. Create a deck by pasting a PTCGL/Limitless list.
3. After a match in PTCGL, export the battle log (clipboard), paste it under **Import**, and select the deck.
4. Review overall / by-deck win rate on the dashboard and open a match for the turn timeline.

## Scripts

- `npm run dev` — development server
- `npm test` — parser unit tests
- `npm run build` — production build

## Notes

- Battle logs and deck lists are expected in **English**.
- In PTCGL, disable **Hide card IDs from export** for richer logs (parser still works with card names).
