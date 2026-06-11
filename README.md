<div align="center">

# 🔍 GitHub Profile Analyzer API

*A backend service that fetches public GitHub profiles, computes insights, and stores them in MySQL.*

**[🌐 Live API](https://github-profile-analyzer-lxxy.onrender.com)** &nbsp;·&nbsp; **[📦 Repository](#)** &nbsp;·&nbsp; **[📄 Postman Collection](#)**

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js)
![Express](https://img.shields.io/badge/Express.js-5.x-000000?logo=express)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql)
![License](https://img.shields.io/badge/License-ISC-blue.svg)
![Deploy](https://img.shields.io/badge/Deploy-Render-46E3B7?logo=render)

</div>

---

## 📋 Assignment Checklist

| Requirement | Status |
|---|---|
| 1. Fetch public profile data from GitHub using username | ✅ |
| 2. Store useful insights in MySQL | ✅ |
| 3. Store analysis results in MySQL | ✅ |
| 4. API to fetch all stored analyzed profile list | ✅ |
| 5. API to fetch data of a single profile | ✅ |

---

## 🚀 Live Demo

**Base URL:** [`https://github-profile-analyzer-lxxy.onrender.com`](https://github-profile-analyzer-lxxy.onrender.com)

```bash
# Health check
curl https://github-profile-analyzer-lxxy.onrender.com/

# Analyze any GitHub user
curl -X POST https://github-profile-analyzer-lxxy.onrender.com/api/analyze/octocat

# Browse all analyzed profiles
curl https://github-profile-analyzer-lxxy.onrender.com/api/profiles

# View one profile in detail
curl https://github-profile-analyzer-lxxy.onrender.com/api/profiles/octocat
```

> ⚠️ First request may take 30–60s due to Render free tier cold start. Subsequent requests are fast.

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | **Node.js** (ES Modules) |
| Framework | **Express.js 5** |
| Database | **MySQL** (via `mysql2/promise`) |
| External API | **GitHub REST API v3** (via `axios`) |

---

## 📡 API Documentation

### 1. Analyze & Store Profile

`POST /api/analyze/:username`

Fetches the user from GitHub, computes aggregate stats across all public repos, and upserts into MySQL.

**Request:**
```bash
curl -X POST https://github-profile-analyzer-lxxy.onrender.com/api/analyze/octocat
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "username": "octocat",
    "name": "The Octocat",
    "bio": null,
    "avatar_url": "https://avatars.githubusercontent.com/u/583231?v=4",
    "html_url": "https://github.com/octocat",
    "blog": "https://github.blog",
    "company": "@github",
    "location": "San Francisco",
    "public_repos": 8,
    "public_gists": 8,
    "followers": 22913,
    "following": 9,
    "total_stars": 21534,
    "total_forks": 164708,
    "account_created_at": "2011-01-25 18:44:36",
    "hireable": false,
    "last_analyzed_at": "2026-06-11T04:49:31.000Z",
    "top_languages": [
      { "language": "HTML", "repo_count": 1 },
      { "language": "Ruby", "repo_count": 1 },
      { "language": "CSS", "repo_count": 1 }
    ]
  }
}
```

**Error cases:**
| Status | Message |
|---|---|
| `404` | GitHub user not found |
| `429` | GitHub API rate limit exceeded |
| `500` | Internal server error |

---

### 2. List All Profiles

`GET /api/profiles`

Returns paginated list of analyzed profiles, newest first.

**Query params:** `page` (default 1), `limit` (default 20)

```bash
curl "https://github-profile-analyzer-lxxy.onrender.com/api/profiles?page=1&limit=5"
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "username": "octocat",
      "name": "The Octocat",
      "avatar_url": "https://avatars.githubusercontent.com/u/583231?v=4",
      "public_repos": 8,
      "followers": 22913,
      "total_stars": 21534,
      "last_analyzed_at": "2026-06-11T04:49:31.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 1,
    "pages": 1
  }
}
```

---

### 3. Get Single Profile

`GET /api/profiles/:username`

Returns full profile data with language breakdown.

```bash
curl https://github-profile-analyzer-lxxy.onrender.com/api/profiles/octocat
```

**Response (200):** Same shape as `POST /api/analyze/:username` (above).

**Error cases:**
| Status | Message |
|---|---|
| `404` | Profile not found — run `POST /api/analyze/:username` first |

---

## 🧠 Insights Stored

| Column | Source | Description |
|---|---|---|
| `username`, `name`, `bio`, `avatar_url` | GitHub User API | Profile metadata |
| `blog`, `company`, `location`, `email`, `twitter_username` | GitHub User API | Contact & social |
| `public_repos`, `public_gists` | GitHub User API | Repository counts |
| `followers`, `following` | GitHub User API | Community metrics |
| `total_stars` ⭐ | **Computed** from all repos | Aggregate star count |
| `total_forks` 🍴 | **Computed** from all repos | Aggregate fork count |
| `top_languages` | **Computed** from all repos | Language distribution (top 10) |
| `account_created_at` | GitHub User API | Account age |
| `hireable` | GitHub User API | Job-seeking flag |
| `last_analyzed_at` | Auto-generated | Track when last analyzed |

---

## 📊 Database Schema

```
┌─────────────────────────────────────────┐
│                profiles                  │
├─────────────────────────────────────────┤
│ id              INT (PK, AUTO_INCREMENT) │
│ username        VARCHAR(255) UNIQUE      │
│ name            VARCHAR(255)             │
│ bio             TEXT                     │
│ avatar_url      VARCHAR(500)             │
│ html_url        VARCHAR(500)             │
│ blog            VARCHAR(500)             │
│ company         VARCHAR(255)             │
│ location        VARCHAR(255)             │
│ email           VARCHAR(255)             │
│ twitter_username VARCHAR(255)            │
│ public_repos    INT                      │
│ public_gists    INT                      │
│ followers       INT                      │
│ following       INT                      │
│ total_stars     INT                      │
│ total_forks     INT                      │
│ account_created_at DATETIME              │
│ account_updated_at DATETIME              │
│ hireable        TINYINT(1)               │
│ last_analyzed_at TIMESTAMP               │
│ created_at      TIMESTAMP                │
│ updated_at      TIMESTAMP                │
└───────────────┬─────────────────────────┘
                │ 1 ──── N
┌───────────────▼─────────────────────┐
│          profile_languages           │
├─────────────────────────────────────┤
│ id            INT (PK, AUTO_INC)     │
│ profile_id    INT (FK → profiles.id) │
│ language      VARCHAR(100)           │
│ repo_count    INT                    │
└─────────────────────────────────────┘
```

Full SQL in [`schema.sql`](./schema.sql). Tables auto-create on startup — no manual migration needed.

---

## ⚙️ Setup (Local)

### Prerequisites

- **Node.js** 18+
- **MySQL** 8+ running locally

### Steps

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/github-profile-analyzer.git
cd github-profile-analyzer

# 2. Install
npm install

# 3. Configure
cp .env.example .env
# Edit .env — set DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME

# 4. Create the database (optional — tables auto-create on startup)
mysql -u root -p < schema.sql

# 5. Start
npm start
# 🚀 Server running on http://localhost:3000
```

### Environment Variables

| Variable | Default | Required | Notes |
|---|---|---|---|
| `DB_HOST` | `localhost` | Yes | MySQL hostname |
| `DB_PORT` | `3306` | Yes | MySQL port |
| `DB_USER` | `root` | Yes | MySQL username |
| `DB_PASS` | *(empty)* | Yes | MySQL password |
| `DB_NAME` | `github_analyzer` | Yes | Database name |
| `DB_SSL` | `false` | For cloud DB | Set to `true` for Aiven, PlanetScale, etc. |
| `GH_TOKEN` | *(none)* | Optional | GitHub PAT to raise rate limit from 60 → 5000 req/hr |
| `PORT` | `3000` | No | Server port |

---

## ☁️ Deployment (Render + Aiven)

Render hosts the API. Since Render doesn't offer MySQL, we pair it with Aiven's free MySQL.

### 1. Push to GitHub
```bash
git init && git add . && git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/github-profile-analyzer.git
git push -u origin main
```

### 2. Create free MySQL on Aiven
- Visit [console.aiven.io](https://console.aiven.io) → sign up
- **Create Service** → MySQL → **Free plan** (Startup-4, 5 GB)
- Once RUNNING → copy **Host**, **Port**, **User**, **Password**
- Default database is `defaultdb`

### 3. Deploy API on Render
- Visit [dashboard.render.com](https://dashboard.render.com) → **New** → **Web Service**
- Connect your GitHub repo
- Set **Build Command:** `npm install`, **Start Command:** `npm start`
- Add Environment Variables with your Aiven credentials + `DB_SSL=true`
- Click **Create Web Service**

### 4. Done
Your API is live at `https://your-service-name.onrender.com`. Test with:

```bash
curl -X POST https://your-service-name.onrender.com/api/analyze/torvalds
```

---

## ✨ Features Beyond Requirements

| Feature | Description |
|---|---|
| 🔤 **Language Analysis** | Aggregates programming languages across all public repos into a `profile_languages` table |
| ⭐ **Total Stars & Forks** | Computes cumulative star and fork counts across all repos |
| 📄 **Pagination** | `GET /api/profiles` supports `?page=1&limit=20` with pagination metadata |
| 🔄 **Smart Upsert** | Re-analyzing a user updates their data and refreshes languages instead of creating duplicates |
| 🛡️ **Graceful Error Handling** | Distinct 404 (user not found), 429 (rate limited), and 500 responses with human-readable messages |
| 🔌 **Auto Table Creation** | `initDB()` creates tables on startup — no manual `schema.sql` needed on deploy |
| 🔒 **SSL Support** | `DB_SSL=true` env var for cloud-hosted MySQL (Aiven, PlanetScale, etc.) |
| 🔑 **GitHub Token Support** | `GH_TOKEN` env var raises rate limits from 60 → 5000 requests per hour |
| 📅 **ISO 8601 Date Conversion** | Handles GitHub's ISO timestamps and converts them to MySQL DATETIME format |
| ⏱️ **Last Analyzed Timestamp** | Tracks when each profile was refreshed |

---

## 📁 Project Structure

```
github-profile-analyzer/
├── .env.example          # Environment variable template
├── README.md             # You are here
├── schema.sql            # Database DDL (reference — auto-created at runtime)
├── package.json          # Dependencies & scripts (type: module)
├── index.js              # Entry point — Express server
├── config/
│   └── db.js             # MySQL connection pool & table initialization
├── routes/
│   └── api.js            # All 3 API route handlers
└── services/
    └── github.js         # GitHub REST API client
```

---

## 📮 Postman Collection

Coming soon — or create one by importing:

```json
{
  "info": { "name": "GitHub Profile Analyzer" },
  "item": [
    { "name": "Analyze Profile", "request": { "method": "POST", "url": "{{base_url}}/api/analyze/octocat" } },
    { "name": "List Profiles",   "request": { "method": "GET",  "url": "{{base_url}}/api/profiles" } },
    { "name": "Get Profile",     "request": { "method": "GET",  "url": "{{base_url}}/api/profiles/octocat" } }
  ],
  "variable": [{ "key": "base_url", "value": "https://github-profile-analyzer-lxxy.onrender.com" }]
}
```

Save as `postman_collection.json` and import into Postman.

---

<div align="center">
Made with ☕ for the Node.js Intern assignment
</div>
