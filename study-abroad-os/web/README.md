This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

From this directory, install dependencies with `npm install`. For a new database, set `DATABASE_URL` and `BETTER_AUTH_SECRET`, run `npm run db:migrate`, then `npm run db:seed`. Repeat seeding inserts only missing catalog rows; it never overwrites reviewed rows. `npm run build` and `npm run vercel-build` do not migrate or seed the database. For production, arrange a database backup and run additive migrations before deploying; keep the previous deployment available for rollback without deleting data.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Public web experience

The first visit offers a short, skippable profile. Guests can search/filter, read details and evidence, and save/edit/delete their profile on this device. Account-backed shortlists and application plans use the existing database API. City/language preferences remain on the device until a later persistence extension; no database migration is required for this UI.

The bundled catalog is existing source-linked data, not newly verified admissions research. Unconfirmed fees, requirements and dates remain visibly pending; historical cycles are not promoted to a new year. The browser receives the same validated `Program`/`Workspace` format from the bundled catalog or database API.

## Verify changes in the real browser

Run `npm run verify` for lint, domain/service tests, a production build and Playwright tests. It disables DATABASE_URL for the verification process and launches its own server on port 3107. Tests exercise desktop and mobile, including empty results, API failures, local profile persistence and official-link navigation.

On Windows the config uses installed Google Chrome when available; otherwise install bundled Chromium with `npx playwright install chromium`. Set `PLAYWRIGHT_CHANNEL=chrome` to explicitly use installed Chrome on another supported platform. After building, `npm run test:e2e:headed` shows the test browser and `npm run test:e2e:report` opens the report. Screenshots/traces live in ignored `test-results/` and `playwright-report/`.

See [the feature map and verification guide](../docs/17-agent-verification.md). University-site availability is not certified by this public suite.

## Local PostgreSQL and integration tests

`npm run db:local -- start|stop|status` runs PostgreSQL 17 from the `embedded-postgres` dev dependency (no Windows service). Binaries are copied to `%LOCALAPPDATA%\study-abroad-os` because they cannot run from a non-ASCII path, and data lives there too, outside OneDrive. It creates `studyabroad_dev` and `studyabroad_test`; set `LOCAL_PG_PASSWORD` in `.env` and point `.env.test` at the `_test` database.

`npm run test:integration:local` starts that server, migrates and seeds the test database, then runs `test/integration/` against the real route handlers (sign-up/in/out, shortlist, application plans, ownership). It refuses any database not named `*_test` because the tests truncate account tables.

`npm run test:e2e:account` does the same preparation, then a production build and the Playwright suite in `test/e2e-account/` (`playwright.account.config.ts`, port 3108): sign-up, shortlist, plan, sign-out/sign-in, wrong password and a stale-tab conflict on desktop and mobile. `npm run verify` stays database-free.

Before deploying, set `AUTH_IP_HEADERS` (and `AUTH_TRUSTED_PROXIES` behind a proxy chain) to a client-IP header the host overwrites. With plain `next start`, a client can send its own `x-forwarded-for` and bypass the sign-in rate limit.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
