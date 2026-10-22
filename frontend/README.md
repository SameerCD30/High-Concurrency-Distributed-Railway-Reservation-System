# Safar Rail — web client

The React frontend for the railway reservation API. It covers the full journey: find a train, compare classes, reserve a berth, and keep the ticket.

- React 19 + TypeScript + Vite 8
- React Router 7
- lucide-react icons
- Hand-written CSS, split by feature (no UI framework)

## Pages

| Route | Purpose |
| ----- | ------- |
| `/` | Hero search, featured service, popular routes |
| `/search?from=&to=&date=&class=` | Train results with class availability, filters, sorting and expandable routes |
| `/book?train=&from=&to=&date=&class=` | Passenger details, journey summary, fare-style review |
| `/ticket/:pnr` | Boarding-pass ticket, PNR copy, print, live refresh |
| `/ticket` | PNR lookup |
| `/trips` | Tickets saved in this browser |
| `*` | Not-found page with search recovery |

### UI details

- Station combobox with keyboard navigation and a from/to swap.
- Departure-board styling, cream/navy/saffron palette, Fraunces + Manrope + IBM Plex Mono.
- Results support departure-window and train-type filters, sorting, and a stop-by-stop route timeline.
- Mobile layouts collapse filters, hide the decorative hero board, and keep the search action above the fold.
- The ticket is styled as a boarding pass and handles confirmed and waitlisted bookings. Waitlisted tickets show the chosen class but no coach/seat.

## Commands

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production bundle in dist/
npm run preview   # serve the production build
npm run lint      # oxlint
```

`vite.config.ts` proxies `/api` to `http://localhost:8080` in development.

## API base URL

The client calls `/api` by default. To target another host, set `VITE_API_BASE_URL` before building:

```bash
VITE_API_BASE_URL=https://api.example.com/api npm run build
```

If the frontend is served from a different origin, add that origin to the API's `app.cors.allowed-origins` property.

## Demo mode

When the API is unavailable (network failure, timeout, `5xx`) or does not expose the station catalogue (`404`), the app falls back to a bundled sample timetable instead of dead-ending:

- `src/lib/demo.ts` — stations, five sample services, routes and demo booking generation.
- `src/lib/api.ts` — fetch wrapper, 10-second timeout, fallback detection and demo ticket lookup.
- `src/lib/storage.ts` — saved trips under `localStorage` key `safar.trips.v1`.
- `src/components/DemoBanner.tsx` — visible notice with a **Try live API** retry.

A local ticket created during demo mode can be reopened from **My trips** or by PNR. Unknown PNRs explain that only browser-created demo tickets are available. Live tickets fetched successfully are also added to **My trips**.

## Layout

```
src/
├─ components/   Header, Footer, Logo, SearchForm, StationSelect, TrainCard,
│                RouteTimeline, PnrLookup, StatusChip, DemoBanner
├─ hooks/        useDemoMode, useStations
├─ lib/          api, demo, format, storage
├─ pages/        HomePage, ResultsPage, BookingPage, TicketPage,
│                MyTripsPage, NotFoundPage
├─ styles/       base, header-footer, home, results, booking, ticket, pages, responsive
├─ App.tsx       routes and layout
└─ main.tsx      entry point
```

## Notes

- Dates are handled as local `YYYY-MM-DD` values to avoid timezone drift; display formatting is `en-IN`.
- No state library: page state plus a small subscription for demo mode is enough for this flow.
- The Vite build emits a single JS/CSS bundle; routes are client-side and need a SPA fallback when hosted.
