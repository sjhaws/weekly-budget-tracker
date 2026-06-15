# Weekly Budget Tracker

A personal weekly budget web app built with vanilla HTML, CSS, and JavaScript. Track spending against a weekly limit, exclude certain expenses from the limit, and review past weeks.

## Features

- Set a weekly spending limit and choose which day the week starts on
- Add expenses with amount, description, and date
- Mark expenses as excluded from the weekly limit (rent, reimbursements, etc.)
- Visual progress bar showing how close you are to the limit
- Navigate between weeks to review history
- Data persists in your browser via localStorage

## Local development

No build step required. Serve the project folder with any static file server:

```bash
npx serve .
```

Or open `index.html` directly in a browser (ES modules require a local server in most browsers).

## Deploy to Netlify

### Option A: Drag and drop

1. Zip the project folder (or upload the folder contents).
2. Go to [app.netlify.com](https://app.netlify.com) and drag the folder onto the deploy area.

### Option B: Git connect

1. Push this repo to GitHub, GitLab, or Bitbucket.
2. In Netlify, click **Add new site** → **Import an existing project**.
3. Connect your repo and use these settings:
   - **Build command:** (leave empty)
   - **Publish directory:** `.` (project root)

The included `netlify.toml` configures the publish directory automatically.

## Data storage

All data is stored locally in your browser under the key `weekly-budget-tracker`. Clearing site data will reset the app. To back up, export localStorage from browser dev tools or add an export feature later.

## Project structure

```
weekly-budget-tracker/
├── index.html          # App shell
├── css/styles.css      # Styles
├── js/
│   ├── app.js          # Main application logic
│   └── utils/
│       ├── week.js     # Week boundary calculations
│       ├── totals.js   # Spending totals
│       └── storage.js  # localStorage persistence
└── netlify.toml        # Netlify configuration
```
