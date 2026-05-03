# Decision Process App

A web port of the [BrightsizeLife/decision-process](https://github.com/BrightsizeLife/decision-process) R Shiny app — a two-choice, five-aspect Monte Carlo decision simulator — rebuilt as a React + TypeScript app and styled with the **Cheap Sensationalism** design system.

## What it does

For two competing choices and up to 5 decision aspects, you set sliders for:

- **Importance** of each aspect, with **uncertainty**
- **Presence** of the aspect in each choice, with **uncertainty**
- Toggle aspects on/off, or mark them **negative** (cost-like)

Under the hood it runs **5,000 Monte Carlo draws** from Beta-distributed beliefs and reports:

- Per-aspect density curves and summary stats
- Mean scores, mean difference, and 90% interval widths
- P(A > B), P(B > A), P(within 5%)
- Advantage thresholds (5%, 10%, 20%, 50%)
- Per-aspect contribution distributions and table
- A plain-language Decision Recommendation with the biggest drivers

## Stack

- React 19 + TypeScript + Vite
- Tailwind (via CDN) for utility classes
- d3 for path generation; KDE / Beta sampler implemented in pure TypeScript
- Inter / Playfair Display / Space Mono webfonts

## Local dev

```bash
npm install
npm run dev
```

## Deploy on Vercel

The repo includes `vercel.json`. From the project root:

```bash
vercel        # preview
vercel --prod # production
```

…or import the GitHub repo into Vercel and accept the defaults — it auto-detects Vite (`npm run build` → `dist`).

## Credits

- Original decision-modeling R Shiny app: [BrightsizeLife/decision-process](https://github.com/BrightsizeLife/decision-process)
- Visual language ported from the **Cheap Sensationalism** site
