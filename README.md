<!-- PROJECT SHIELDS -->

<!-- PROJECT LOGO -->

<br />
<div align="center">

<h3 align="center">Gitinsight</h3>

<p align="center">
An AI-assisted software repository analytics platform that imports GitHub repositories, analyzes development activity, computes repository health metrics, detects engineering bottlenecks, and generates intelligent insights using Node.js, Express, MongoDB, Redis, OpenAI, and React.
<br />
<br />
<!-- <a href="https://github.com/abrahamjust/REPOSITORY_NAME"><strong>Explore the Project »</strong></a> -->
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

Repo Intelligence is an AI-assisted software engineering analytics platform that transforms raw GitHub repository data into actionable engineering insights.

Instead of simply displaying repository statistics, the platform continuously analyzes commits, pull requests, issues, reviews, releases, and contributor activity to generate repository health metrics, detect development bottlenecks, identify collaboration patterns, and produce AI-assisted summaries for maintainers and developers.

GitHub serves as the external data source, while MongoDB stores imported repository snapshots. The Repository Intelligence Engine processes this data into engineering metrics, Redis accelerates dashboard performance through caching, and OpenAI generates explainable insights based on computed analytics.

The project demonstrates modern full-stack software engineering concepts including REST APIs, NoSQL databases, caching, data analytics, AI integration, authentication, and scalable backend architecture.

---

# Features

## Repository Import

- Import any public GitHub repository
- GitHub OAuth authentication
- Import repositories from authenticated users
- Automatic synchronization with GitHub
- Store repository snapshots in MongoDB

## Repository Analytics

- Commit activity analysis
- Pull request analytics
- Issue analytics
- Contributor analytics
- Release history analysis
- Branch analytics
- Language statistics
- Repository growth trends

## Repository Intelligence Engine

- Repository Health Score
- Development velocity analysis
- Code review efficiency
- Issue resolution metrics
- Contributor diversity analysis
- Activity trend analysis
- Repository maturity assessment

## Bottleneck Detection

- Long-running pull requests
- Stale issues
- Review delays
- Knowledge concentration detection
- Low contributor activity
- Repository maintenance risk
- Inactive branches

## AI-Assisted Insights

- Repository summaries
- Engineering recommendations
- Repository Q&A
- Weekly development summaries
- Contributor summaries
- Repository health explanations
- Trend interpretation

## Dashboard

- Interactive analytics dashboard
- Health overview
- Charts and visualizations
- Repository comparison
- Contributor leaderboard
- AI Insights panel

## Performance

- Redis caching
- Optimized MongoDB queries
- Fast dashboard loading
- Cached AI summaries
- Background repository synchronization

---

# Built With

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Redis
- GitHub REST API
- OpenAI API
- JWT Authentication
- GitHub OAuth

## Frontend

- React
- Vite
- Tailwind CSS
- Chart.js / Recharts
- Axios

## Development

- JavaScript (ES6)
- REST APIs
- MVC Architecture
- Git
- GitHub

---

# System Architecture

```text
                 GitHub API
                      │
                      ▼
          Repository Import Engine
                      │
                      ▼
                 MongoDB Database
                      │
                      ▼
      Repository Intelligence Engine
                      │
      ┌───────────────┼────────────────┐
      ▼               ▼                ▼
 Commit Analyzer   Issue Analyzer   PR Analyzer
      ▼               ▼                ▼
 Contributor Analyzer  Trend Engine  Health Engine
                      │
                      ▼
             Bottleneck Detector
                      │
                      ▼
              Repository Context
                      │
                      ▼
               OpenAI Integration
                      │
                      ▼
                 Redis Cache
                      │
                      ▼
                React Dashboard
```

---

# Getting Started

Follow these steps to run the project locally.

## Prerequisites

- Node.js
- npm
- MongoDB
- Redis
- GitHub Developer Account
- OpenAI API Key (or your llm provider api key of your choice)

---

## Installation

### Clone the repository

```bash
git clone https://github.com/abrahamjust/gitinsight.git
```

### Navigate into the project

```bash
cd repo-intelligence
```

### Install dependencies

Backend

```bash
cd backend
npm install
```

Frontend

```bash
cd frontend
npm install
```

---

### Create a `.env` file

```env
PORT=3000

MONGO_URI=your_mongodb_connection_string

REDIS_URL=your_redis_connection_string

JWT_SECRET=your_secret_key

GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret

OPENAI_API_KEY=your_openai_api_key
```

---

### Start MongoDB

```bash
mongod
```

---

### Start Redis

```bash
redis-server
```

---

### Run the backend

```bash
npm run dev
```

---

### Run the frontend

```bash
npm run dev
```

---

### Open

```text
http://localhost:5173
```

---

# Usage

## Import Repository

- Paste a GitHub repository URL

or

- Login with GitHub and select repositories

---

## Analyze Repository

The system automatically imports

- Repository metadata
- Commits
- Pull Requests
- Issues
- Reviews
- Releases
- Contributors

---

## View Analytics

Explore

- Repository Health
- Commit trends
- Contributor statistics
- Issue analytics
- Pull request metrics
- Repository growth

---

## AI Insights

Generate

- Repository summaries
- Engineering recommendations
- Repository health explanations
- Ask repository-specific questions
- Development trend analysis

---

## Compare Repositories

Compare multiple repositories based on

- Health Score
- Development velocity
- Contributor diversity
- Issue resolution
- Pull request efficiency

---

# Repository Intelligence Engine

The Repository Intelligence Engine is the core component of the platform.

It transforms raw GitHub repository events into structured engineering intelligence.

### Modules

- Repository Import Engine
- Repository Analyzer
- Commit Analyzer
- Pull Request Analyzer
- Issue Analyzer
- Contributor Analyzer
- Trend Engine
- Health Engine
- Bottleneck Detection Engine
- AI Context Builder
- AI Insight Generator

### Generated Metrics

- Repository Health Score
- Commit Frequency
- Development Velocity
- Average Merge Time
- Average Issue Resolution Time
- Contributor Diversity
- Repository Activity Trend
- Review Efficiency
- Knowledge Concentration
- Repository Maintenance Risk

---

# Roadmap

## Core Platform

- [x] GitHub OAuth
- [x] Public repository import
- [x] MongoDB integration
- [x] Repository synchronization
- [x] Repository dashboard

## Analytics

- [x] Commit analytics
- [x] Pull request analytics
- [x] Issue analytics
- [x] Contributor analytics
- [x] Release analytics
- [x] Trend analysis

## Repository Intelligence Engine

- [x] Repository Health Score
- [x] Development velocity
- [x] Contributor diversity
- [x] Bottleneck detection
- [x] Repository maturity analysis

## AI Features

- [x] Repository summaries
- [x] AI recommendations
- [x] Repository Q&A
- [x] Weekly summaries
- [x] Health explanations

## Performance

- [x] Redis caching
- [x] Background synchronization
- [x] Dashboard optimization

## Future Improvements

- [ ] Support GitLab repositories
- [ ] Bitbucket integration
- [ ] Team collaboration dashboard
- [ ] Predictive repository health forecasting
- [ ] CI/CD analytics
- [ ] Code ownership analysis
- [ ] Email reports
- [ ] Slack integration
- [ ] Repository benchmarking
- [ ] Custom analytics plugins

---

# Acknowledgements

- GitHub REST API
- OpenAI
- MongoDB
- Redis
- React
- Express.js
- Node.js

---

# License

This project is intended for educational, research, and portfolio purposes.

---

# Contact

**Abraham Justin**

GitHub: https://github.com/abrahamjust

Email: abrahamjust@gmail.com

<!-- Project Link: https://github.com/abrahamjust/repo-intelligence -->

<p align="right">(<a href="#top">back to top</a>)</p>