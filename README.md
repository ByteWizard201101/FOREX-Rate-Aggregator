# FOREX Rates Aggregator

A serverless, automated system to fetch, parse, and display Bangladeshi banks' EUR→BDT student file forex rates.

## Stack
- **Frontend:** React + Vite + Tailwind CSS (admin + public UI)
- **API/Automation:** Netlify Functions (TypeScript)
- **Scraper:** Python (Selenium, pdfplumber)
- **Database/Auth:** Supabase (PostgreSQL, RLS, Auth)
- **Hosting:** Netlify

## Monorepo Structure
```
scraper/         # Python: Selenium, pdfplumber, requirements.txt, Dockerfile
netlify/         # Netlify functions (API, scheduled jobs)
frontend/        # React + Vite + Tailwind (admin + public UI)
infra/           # Netlify config, env templates, docs
supabase/        # SQL, RLS policies, seed scripts
```

## Quick Start
1. Clone the repo
2. Copy `.env.example` to `.env` and fill in secrets
3. Install dependencies in each subfolder
4. Deploy to Netlify (connect repo, set env vars)

## Environment Variables
See `.env.example` for required secrets (Supabase, Netlify, etc.)

## Database Schema
See `supabase/schema.sql` for table definitions.

## License
MIT 