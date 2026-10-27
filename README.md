<!-- PROJECT SHIELDS -->

<!-- PROJECT LOGO -->

<br />

<div align="center">

<h3 align="center">GitInsight</h3>

<p align="center">

An AI-assisted software repository analytics platform that imports GitHub repositories, analyzes development activity, computes repository health metrics, detects engineering bottlenecks, and generates contextual engineering insights.

<br />
<br />

<!-- <a href="https://github.com/abrahamjust/gitinsight"><strong>Explore the Project »</strong></a> -->

<br />
<br />

<!-- <a href="LIVE_DEMO_LINK">View Demo</a> -->

</p>

</div>

---

<details>

  <summary>Table of Contents</summary>

1. [About The Project](#about-the-project)
2. [Features](#features)
3. [Built With](#built-with)
4. [System Architecture](#system-architecture)
5. [Getting Started](#getting-started)
6. [Usage](#usage)
7. [Repository Intelligence Engine](#repository-intelligence-engine)
8. [Roadmap](#roadmap)
9. [Acknowledgements](#acknowledgements)
10. [License](#license)
11. [Contact](#contact)

</details>

---

# About The Project

**GitInsight** is an AI-assisted software repository analytics platform that transforms raw GitHub repository data into actionable engineering insights.

Instead of simply displaying repository statistics, GitInsight analyzes commits, pull requests, issues, reviews, releases, and contributor activity to generate repository health metrics, identify engineering bottlenecks, measure collaboration patterns, and provide AI-assisted explanations of repository health.

GitHub acts as the external data source, while MongoDB stores imported repository data. The Repository Intelligence Engine processes this data into structured engineering metrics and health assessments. Redis is used for caching analytics results, while BullMQ enables repository synchronization to run as background jobs without blocking API requests.

Gemini is used to generate contextual explanations and recommendations based on the computed repository analytics.

The project demonstrates full-stack software engineering concepts including REST APIs, authentication, NoSQL database design, caching, background job processing, data analytics, GitHub API integration, and AI-assisted engineering intelligence.

---

# Features

## Authentication

- Email and password authentication
- Session-based authentication
- Protected API routes
- User-scoped repository access
- Secure server-side credential handling

## Repository Import

- Import public GitHub repositories
- Retrieve repository metadata
- Import commits
- Import pull requests
- Import issues
- Import contributors
- Import releases
- Import pull request reviews
- Store imported data in MongoDB

## Repository Synchronization

- Synchronize previously imported repositories
- Incremental commit synchronization
- Incremental pull request synchronization
- Duplicate prevention
- Background synchronization using BullMQ
- Synchronization status tracking
- Failed synchronization handling
- Redis cache invalidation after synchronization

## Repository Analytics

- Commit activity analysis
- Pull request analytics
- Issue analytics
- Contributor analytics
- Release analytics
- Pull request review analytics
- Development activity trends
- Collaboration metrics
- Issue resolution metrics
- Contributor concentration analysis
- Review coverage analysis

## Repository Health Engine

- Overall repository health score
- Activity health assessment
- Collaboration health assessment
- Issue health assessment
- Contributor health assessment
- Release health assessment
- Review health assessment
- Health confidence estimation
- Dimension-level health scoring

## Bottleneck Detection

- Repository inactivity detection
- Prolonged inactivity detection
- Low pull request merge rate detection
- Slow pull request merging
- Low issue closure rate
- Low bus factor
- Top contributor dependency
- Contributor concentration
- Low review coverage
- Reviewer concentration

## AI-Assisted Insights

- Repository health explanations
- Key engineering findings
- Context-aware repository analysis
- Engineering recommendations
- Analytics-grounded AI explanations

## Performance

- Redis analytics caching
- Cached AI-generated insights
- Background repository synchronization
- Incremental synchronization for commits and pull requests
- MongoDB persistence
- Repository-scoped analytics caching

---

# Built With

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Redis
- BullMQ
- ioredis
- GitHub REST API
- Gemini API
- Passport.js
- Passport Local
- Express Session
- bcryptjs

## Frontend

- React
- Vite
- React Router
- Plain CSS with design tokens (light and dark themes)
- Custom SVG charts
- Lucide icons
- Axios

## Development

- JavaScript (ES6)
- REST APIs
- Layered Architecture
- NoSQL Database Design
- Background Job Processing
- Git
- GitHub

---

# System Architecture

```text
                           ┌──────────────────┐
                           │    GitHub API    │
                           └────────┬─────────┘
                                    │
                                    ▼
                     ┌──────────────────────────┐
                     │   Repository Import /    │
                     │   Synchronization Layer  │
                     └────────────┬─────────────┘
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │      MongoDB        │
                       │                     │
                       │ Repositories        │
                       │ Commits             │
                       │ Pull Requests       │
                       │ Issues              │
                       │ Contributors        │
                       │ Releases            │
                       │ Reviews             │
                       └──────────┬──────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │   Repository Intelligence     │
                  │           Engine              │
                  └───────────────┬───────────────┘
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
             ▼                    ▼                    ▼
      ┌─────────────┐     ┌──────────────┐     ┌──────────────┐
      │   Activity  │     │ Collaboration│     │    Issues    │
      │   Analyzer  │     │   Analyzer   │     │   Analyzer   │
      └──────┬──────┘     └──────┬───────┘     └──────┬───────┘
             │                    │                    │
             └────────────────────┼────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
             ┌──────────────┐          ┌─────────────────┐
             │ Health Engine│          │   Bottleneck    │
             │              │          │    Detector     │
             └──────┬───────┘          └────────┬────────┘
                    │                           │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                      ┌────────────────────────┐
                      │     AI Context Builder │
                      └────────────┬───────────┘
                                   │
                                   ▼
                      ┌────────────────────────┐
                      │    Gemini Integration  │
                      └────────────┬───────────┘
                                   │
                                   ▼
                         ┌──────────────────┐
                         │   Redis Cache    │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  React Frontend  │
                         │    Dashboard     │
                         └──────────────────┘


                     Background Synchronization

                            API Request
                                   │
                                   ▼
                            ┌─────────────┐
                            │   BullMQ    │
                            │    Queue    │
                            └──────┬──────┘
                                   │
                                   ▼
                            ┌─────────────┐
                            │ Sync Worker │
                            └──────┬──────┘
                                   │
                                   ▼
                     GitHub API → MongoDB → Redis

```
# Backend Architecture

GitInsight follows a layered backend architecture:

```text
Routes
   │
   ▼
Controllers
   │
   ▼
Services
   │
   ▼
Repositories
   │
   ▼
Models
   │
   ▼
MongoDB
```

### Routes

Define API endpoints and connect requests to controllers.

### Controllers

Handle HTTP requests, authentication checks, validation, and responses.

### Services

Contain application and business logic such as repository synchronization, analytics generation, health assessment, bottleneck detection, caching, and AI integration.

### Repositories

Encapsulate database access and MongoDB queries.

### Models

Define MongoDB/Mongoose schemas and data structures.

---

# Background Synchronization

Repository synchronization is handled asynchronously using BullMQ and Redis.

```text
Frontend
   │
   │ POST /repositories/:id/sync
   ▼
Express API
   │
   ▼
Sync Service
   │
   ▼
BullMQ Queue
   │
   ▼
Background Worker
   │
   ├── Fetch GitHub data
   ├── Update MongoDB
   ├── Calculate synchronization results
   ├── Invalidate Redis cache
   └── Update synchronization status
```

Repositories transition through synchronization states:

```text
pending
   ↓
processing
   ↓
completed

processing
   ↓
failed
```

This prevents long-running GitHub API operations from blocking HTTP requests.

---

# Getting Started

Follow these steps to run GitInsight locally.

## Prerequisites

- Node.js
- npm
- MongoDB
- Redis
- GitHub Personal Access Token
- Gemini API Key

---

## Installation

### Clone the repository

```bash
git clone https://github.com/abrahamjust/gitinsight.git
```

### Navigate into the project

```bash
cd gitinsight
```

### Install backend dependencies

```bash
cd server
npm install
```

### Install frontend dependencies

```bash
cd ../client
npm install
```

---

## Environment Variables

Create a `.env` file inside the `server` directory.

```env
SERVER_PORT=3000

MONGODB_URI=your_mongodb_connection_string

REDIS_URL=your_redis_connection_string

SESSION_SECRET=your_session_secret

GITHUB_TOKEN=your_github_personal_access_token

GEMINI_API_KEY=your_gemini_api_key

# Optional
NODE_ENV=development
# newest N commits / PRs / issues / releases fetched per sync (0 = no cap)
GITHUB_MAX_ITEMS_PER_RESOURCE=5000
```

`GITHUB_MAX_ITEMS_PER_RESOURCE` keeps very large repositories from using up the GitHub rate limit. Items are fetched newest first, so the cap keeps the most recent history.

> **Important:** Never expose `GITHUB_TOKEN`, `GEMINI_API_KEY`, or `SESSION_SECRET` in the frontend.

---

## Start MongoDB

Make sure MongoDB is running locally or use a MongoDB deployment.

```bash
mongod
```

---

## Start Redis

Make sure Redis is running.

```bash
redis-server
```

---

## Run the Backend

From the `server` directory:

```bash
npm run dev
```

---

## Run the Synchronization Worker

The BullMQ worker runs as a separate process.

```bash
npm run worker
```

---

## Run the Frontend

From the `client` directory:

```bash
npm run dev
```

The Vite dev server proxies `/api/*` to the backend on `http://localhost:3000`, so the session cookie stays same-origin and no CORS setup is needed. To use a different backend address, set `VITE_API_TARGET` (for example `VITE_API_TARGET=http://localhost:4000 npm run dev`).

---

## Open GitInsight

```text
http://localhost:5173
```

---

# Usage

## 1. Create an Account

Register using an email address and password.

---

## 2. Import a Repository

Provide the URL of a public GitHub repository.

Example:

```text
https://github.com/facebook/react
```

GitInsight retrieves repository metadata and associated development data.

---

## 3. Analyze Repository

The platform imports:

- Repository metadata
- Commits
- Pull requests
- Issues
- Reviews
- Releases
- Contributors

---

## 4. View Repository Analytics

Explore:

- Repository activity
- Pull request metrics
- Issue metrics
- Contributor statistics
- Review metrics
- Repository health
- Engineering bottlenecks

---

## 5. View AI-Assisted Insights

GitInsight uses the computed repository analytics as context for Gemini to generate:

- Repository health explanations
- Key findings
- Engineering recommendations
- Contextual development insights

---

## 6. Synchronize Repository

Previously imported repositories can be synchronized with GitHub.

Synchronization occurs in the background, allowing the API to return immediately while the worker processes the repository.

---

# Repository Intelligence Engine

The Repository Intelligence Engine is the core analytical component of GitInsight.

It transforms raw GitHub development data into structured engineering intelligence.

## Modules

- Repository Import Engine
- Repository Synchronization Engine
- Commit Analyzer
- Pull Request Analyzer
- Issue Analyzer
- Contributor Analyzer
- Release Analyzer
- Review Analyzer
- Activity Analyzer
- Collaboration Analyzer
- Health Engine
- Bottleneck Detection Engine
- AI Context Builder
- AI Insight Generator

---

## Generated Metrics

### Activity

- Total commits
- Recent commit activity
- Commits per week
- Contributor activity
- Inactivity periods
- Activity trends

### Pull Requests

- Total pull requests
- Open / closed pull requests
- Merged pull requests
- Merge rate
- Average time to merge
- Median time to merge
- Pull request size
- Changed files
- Recent pull request activity

### Issues

- Total issues
- Open / closed issues
- Issue closure rate
- Average resolution time
- Median resolution time
- Average comments
- Issue backlog

### Contributors

- Total contributors
- Total contributions
- Top contributor contribution share
- Top-three contributor share
- Contributor concentration
- Herfindahl-Hirschman Index (HHI)
- Estimated bus factor

### Reviews

- Total reviews
- Unique reviewers
- Review coverage
- Pull requests without reviews
- Approval count
- Change-request count
- Comment count
- Average time to first review
- Median time to first review
- Reviewer concentration

### Health

The platform calculates health scores across multiple repository dimensions:

- Activity
- Collaboration
- Issues
- Contributors
- Releases
- Reviews

These dimensions are combined into an overall repository health score.

---

# Bottleneck Detection Engine

The Bottleneck Detection Engine identifies potential engineering bottlenecks from repository analytics.

Current detection categories include:

- Repository Inactivity
- Prolonged Inactivity
- Low PR Merge Rate
- Slow PR Merging
- Low Issue Closure Rate
- Low Bus Factor
- Top Contributor Dependency
- Contributor Concentration
- Low Review Coverage
- Reviewer Concentration

Each detected bottleneck is assigned a severity level such as:

- Critical
- Warning

The detected bottlenecks are then passed into the AI context used for generating repository explanations and recommendations.

---

# Caching

Redis is used to improve analytics performance.

```text
Analytics Request
      │
      ▼
 Check Redis Cache
      │
 ┌────┴─────┐
 │          │
Hit        Miss
 │          │
 ▼          ▼
Return    Generate
Result    Analytics
              │
              ▼
         Store in Redis
              │
              ▼
            Return
```

Analytics results and AI-generated insights are cached to reduce repeated computation and unnecessary AI API requests.

---

# Roadmap

## Core Platform

- [x] Email/password authentication
- [x] Public repository import
- [x] MongoDB integration
- [x] Repository synchronization
- [x] Repository ownership checks
- [x] Background synchronization

## Data Ingestion

- [x] Repository metadata
- [x] Commit ingestion
- [x] Pull request ingestion
- [x] Issue ingestion
- [x] Contributor ingestion
- [x] Release ingestion
- [x] Pull request review ingestion

## Analytics

- [x] Commit analytics
- [x] Pull request analytics
- [x] Issue analytics
- [x] Contributor analytics
- [x] Release analytics
- [x] Review analytics
- [x] Activity trends
- [x] Collaboration metrics

## Repository Intelligence Engine

- [x] Repository Health Score
- [x] Multi-dimensional health analysis
- [x] Contributor concentration analysis
- [x] Bus factor estimation
- [x] Review efficiency analysis
- [x] Bottleneck detection
- [x] AI context generation

## AI Features

- [x] Repository health explanations
- [x] AI-assisted findings
- [x] Engineering recommendations
- [x] Analytics-grounded AI insights

## Performance

- [x] Redis caching
- [x] Cached analytics
- [x] Cached AI insights
- [x] Background synchronization
- [x] Incremental commit synchronization
- [x] Incremental pull request synchronization

## Frontend

- [ ] Authentication interface
- [ ] Repository management interface
- [ ] Repository dashboard
- [ ] Health visualization
- [ ] Analytics charts
- [ ] Bottleneck visualization
- [ ] AI insights interface
- [ ] Synchronization status UI
- [ ] Responsive design

## Future Improvements

- [ ] GitHub OAuth
- [ ] Support private repositories
- [ ] GitLab integration
- [ ] Bitbucket integration
- [ ] Predictive repository health forecasting
- [ ] CI/CD analytics
- [ ] Code ownership analysis
- [ ] Repository benchmarking
- [ ] Team collaboration analytics
- [ ] Scheduled reports
- [ ] Slack integration
- [ ] Email reports

---

# Acknowledgements

- GitHub REST API
- Google Gemini
- MongoDB
- Redis
- BullMQ
- React
- Express.js
- Node.js
- Passport.js

---

# License

This project is intended for educational, research, and portfolio purposes.

---

# Contact

**Abraham Justin**

GitHub: https://github.com/abrahamjust

Email: abrahamjust@gmail.com

<!-- Project Link: https://github.com/abrahamjust/gitinsight -->

<p align="right">(<a href="#top">back to top</a>)</p>