# GitHub Profile Analyzer API

A backend service that analyzes GitHub user profiles using the GitHub public API and stores useful insights in a MySQL database.

## Tech Stack

- **Node.js** + **Express.js**
- **MySQL** (with mysql2 driver)
- **GitHub REST API** (third-party)

## Features

- 🔍 Fetch and analyze any GitHub user's public profile
- 💾 Store profile insights in MySQL (repos, followers, gists, stars, languages, etc.)
- 📋 List all previously analyzed profiles with pagination
- 👤 Get detailed analysis of a single profile
- 🕐 Track last analyzed timestamp
- 📊 Aggregate stats: total stars, total forks, top languages, account age
- 🔄 Re-fetch: calling the analyze endpoint for an existing user updates their data
- 🚦 GitHub API rate-limit aware with graceful error handling

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze/:username` | Analyze & store a GitHub profile |
| `GET` | `/api/profiles` | List all stored analyzed profiles (paginated) |
| `GET` | `/api/profiles/:username` | Get single profile with language breakdown |

## Database Schema

See `schema.sql`.

## Quick Start (Local)

### 1. Clone & install

```bash
git clone <your-repo-url>
cd github-profile-analyzer
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your MySQL credentials
```

### 3. Create database

```bash
mysql -u root -p < schema.sql
```

### 4. Run

```bash
npm start
```

The server starts on `http://localhost:3000`.

---

## 🚀 Deploy to Render (Free Tier)

Render lets you host both the Node.js API and a MySQL database for free.  
**Estimated time: 10–15 minutes.**

### Step 1: Push your code to GitHub

Make sure your project is in a public (or private) GitHub repository:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/github-profile-analyzer.git
git push -u origin main
```

### Step 2: Create a MySQL database on Render

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New** → **MySQL**
2. Fill in:
   - **Name**: `github-analyzer-db`
   - **Database**: `github_analyzer`
   - **User**: `admin` (default)
   - **Region**: pick the one closest to you (e.g., Singapore for India)
   - **Instance Type**: **Free**
3. Click **Create Database**
4. Wait for status to become **Available** (takes ~2 minutes)
5. Scroll down and copy these values — you'll need them next:
   - **Hostname** (e.g., `dpg-xxxxx.oregon-postgres.render.com`)
   - **Port** (e.g., `5432` → MySQL uses `3306` on Render)
   - **Username**
   - **Password**
   - **Database** (`github_analyzer`)

### Step 3: Create the Web Service

1. Go to **New** → **Web Service**
2. Connect your GitHub repo (`github-profile-analyzer`)
3. Configure the service:
   - **Name**: `github-profile-analyzer`
   - **Region**: same as your database
   - **Runtime**: Node
   - **Build Command**: `npm install` (auto-detected)
   - **Start Command**: `npm start` (auto-detected)
   - **Instance Type**: **Free**
4. Scroll down to **Environment Variables** and add these:

   | Key | Value |
   |-----|-------|
   | `DB_HOST` | *paste the MySQL Hostname from Step 2* |
   | `DB_PORT` | *paste the MySQL Port from Step 2* |
   | `DB_USER` | *paste the MySQL Username from Step 2* |
   | `DB_PASS` | *paste the MySQL Password from Step 2* |
   | `DB_NAME` | `github_analyzer` |
   | `PORT` | `10000` (Render's default — or leave unset, it auto-assigns) |

5. Click **Create Web Service**

### Step 4: Wait & Test

- Build + deploy takes ~3–5 minutes on the free tier
- Once done, your API will be live at: `https://github-profile-analyzer.onrender.com`
- Test it:

```bash
# Health check
curl https://github-profile-analyzer.onrender.com/

# Analyze a profile
curl -X POST https://github-profile-analyzer.onrender.com/api/analyzer/torvalds

# List all
curl https://github-profile-analyzer.onrender.com/api/profiles
```

### ⚠️ Important Notes

- **Cold starts**: Free Render services spin down after 15 minutes of inactivity. The first request after a cold start takes ~30–60 seconds. Use a service like [UptimeRobot](https://uptimerobot.com) or [Kaffeine](https://kaffeine.herokuapp.com/) to ping it every 5 minutes.
- **Free MySQL expires after 90 days** — back up your data or upgrade before then.
- **Rate limits**: GitHub API allows 60 unauthenticated requests/hour. For production, add a GitHub personal access token in a `GH_TOKEN` env var.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `root` | MySQL user |
| `DB_PASS` | (empty) | MySQL password |
| `DB_NAME` | `github_analyzer` | Database name |
| `PORT` | `3000` | Server port |

## Example Usage

```bash
# Analyze a profile
curl -X POST http://localhost:3000/api/analyze/torvalds

# Get all profiles (page 1, 20 per page)
curl http://localhost:3000/api/profiles

# Get all profiles (page 2, 10 per page)
curl "http://localhost:3000/api/profiles?page=2&limit=10"

# Get one profile with full details
curl http://localhost:3000/api/profiles/torvalds
```

## Bonus Features Added

- **Repo language analysis** – aggregates language usage across all public repos
- **Total stars & forks** – computed from all public repos
- **Pagination** on list endpoint
- **Upsert logic** – re-analyzing a user updates their data instead of creating duplicates
- **Graceful error handling** for 404 (user not found) and 403 (rate limit)
- **Auto table creation** on startup (no manual SQL needed beyond DB creation)