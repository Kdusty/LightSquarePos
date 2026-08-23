# LightSquare POS

A full-featured Point of Sale web application for small Philippine cafés and food businesses.

## Tech Stack
- **Frontend**: Vite + React 18
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env
# Edit .env and add your Supabase URL and anon key
```

### 3. Run development server
```bash
npm run dev
```

The app runs in **offline/demo mode** if Supabase env vars are not set. All data resets on refresh in this mode.

## Project Structure

```
src/
├── components/
│   └── POSApp.jsx          # Full POS application (monolith → will be split)
├── lib/
│   ├── supabase.js         # Supabase client
│   ├── permissions.js      # Role-based access control
│   └── formatters.js       # Currency & date helpers
├── data/
│   └── initialData.js      # Seed data (products, staff, categories)
└── main.jsx                # App entry point
```

## Default Login PINs (Demo Mode)
| Staff | PIN | Role |
|-------|-----|------|
| Admin Owner | 1234 | Owner |
| Maria Santos | 5678 | Manager |
| Juan Reyes | 9012 | Cashier |

## Roadmap
- [x] Core POS with variants, discounts, payment flows
- [x] Staff roles & PIN authentication
- [x] Kitchen Display System
- [x] Analytics dashboard
- [x] Void & Refund
- [x] BIR-compliant receipts
- [x] CSV export
- [ ] Supabase data persistence (Step 4)
- [ ] Vercel deployment (Step 5)
- [ ] Subscription tiers / billing (Step 6)

## Features
See `LIGHTSQUARE_HANDOFF.md` for full feature documentation.
