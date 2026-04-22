# NWXT Gen Web

This directory contains the Next.js 14 frontend for the NWXT roadmap application.

## Available scripts

- `npm install` — install dependencies
- `npm run dev` — run the app locally on `http://localhost:3000`
- `npm run build` — build for production
- `npm run start` — start the production server

## Environment

- Copy `.env.example` to `.env.local` to configure local secrets.
- Add `NEXT_PUBLIC_GEOAPIFY_API_KEY` for property maps and geocoding.
- Add `NEXT_PUBLIC_API_BASE_URL` to point the frontend at the auth backend, e.g. `http://localhost:4001`.
- The dashboard fetches protected user profile data from the auth backend once signed in.
