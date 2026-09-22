# Candor — Code Review Honesty Tracker

[![Candor CI/CD](https://github.com/Lavanya-Sundarapu08/candor/actions/workflows/ci-cd.yml/badge.svg?branch=main)](https://github.com/Lavanya-Sundarapu08/candor/actions/workflows/ci-cd.yml)

An "LGTM" approval comment is treated as proof a pull request was reviewed carefully — but it
often isn't. Candor pulls a repository's merged pull requests from GitHub, classifies each
review comment as **substantive** or **superficial**, and checks whether the same files showed
**follow-up fix activity** soon after merge. That combination — a superficial approval followed
by a fix — is the signal the tool exists to surface, framed as a signal worth investigating, not
a verdict.

## How it works (4 steps, each explainable in one sentence)

1. **Fetch** — pull merged PRs, their review comments, changed files, and follow-up commit
   history from the GitHub REST API. Detects and clearly reports rate-limit/error responses
   from GitHub instead of crashing on them.
2. **Classify** — a short review comment, or a longer one that's mostly generic approval
   phrases ("LGTM", "looks good", "approved") strung together, is superficial; anything else is
   substantive. Rule-based, no ML, with a plain-language reason attached to every classification.
3. **Correlate** — for each file a PR touched, look at commits in the next 14 days; if any
   commit message contains a fix-related keyword, the PR is flagged with follow-up fix evidence
   (which file, which keyword, how long after merge).
4. **Report** — review coverage (never confusing "no review" with "good review"), an aggregated
   summary with correct N/A-vs-0% handling, cross-tab analytics, and a per-PR evidence panel
   separating Observed facts / Classification / Signal.

## Features

- **Analysis dashboard** — summary stats and a per-PR log, framed as signals rather than verdicts.
- **"Why?" explanations** — every review classification comes with a plain-language reason.
- **Evidence panel & timeline** — expand any PR to see Observed facts, Classification, and Signal
  correlation kept clearly separate, plus a review timeline (opened, reviewed, merged, follow-up).
- **"Would you trust this approval?"** — the top follow-up-signal PRs get a detailed evidence
  card with a "WORTH INVESTIGATING" verdict and an explicit correlation-does-not-imply-causation caveat.
- **Reviewer signals** — substantive/superficial counts and follow-up-fix-signal counts per
  reviewer, deliberately not framed as a ranking of people.
- **Analytics / Patterns** — review coverage over time, review composition, follow-up fix rate by
  review state, time-to-first-fix stats, and repeated-file hotspots — all real, no fabricated data.
- **Correct N/A handling throughout** — 0% means "evaluated, found none"; N/A means "not enough
  data to evaluate." The two are never confused.
- **Trend chart** — a hand-rolled SVG bar chart showing superficial review rate by month.
- **Saved history** — a second tab that reads back cached results via `/api/history`.
- **Light/dark theme** with a toggle.
- **JWT authentication** — register/login, with saved analyses scoped per-user.
- **Async analysis pipeline (Apache Kafka)** — "Run Analysis" submits a job to Kafka and returns immediately; a `@KafkaListener` consumer does the actual GitHub fetch/classify/correlate work off the request thread. The original synchronous `/api/analyze` endpoint still works unchanged.
- **AI Interpretation (Spring AI + DeepSeek via Ollama)** — opt-in, per-PR button that sends only the same structured evidence already shown in the UI to a local LLM, and returns a plain-language interpretation — never additional "evidence," always clearly labeled and kept separate from the deterministic Observed/Classified/Signal panel.

## Project structure

```
candor/
├── backend/    Spring Boot 3 (Java 21) - REST API, GitHub client, classification & correlation logic
├── frontend/   React + TypeScript (Vite) - dashboard, analytics, evidence UI
├── .github/workflows/ci-cd.yml   Test-gated CI/CD pipeline
├── docker-compose.yml            Local dev: Postgres + backend + frontend together
└── DEPLOYMENT.md                 AWS deployment guide (RDS, Elastic Beanstalk, S3+CloudFront)
```

## Running it

### Option A: Docker Compose (fastest way to try the whole stack)

```bash
docker compose up --build
```

Starts PostgreSQL, Kafka (single-node KRaft mode), the backend (localhost:8080), and the
frontend (localhost:3000) together, with everything wired via environment variables.

**AI Interpretation needs one extra manual step**, since Ollama isn't containerized here:
install [Ollama](https://ollama.com) on your machine, then run:

```bash
ollama pull deepseek-r1
ollama serve
```

The backend reaches it at `http://host.docker.internal:11434` automatically in Docker Compose.
Everything else (auth, the async Kafka pipeline, all analysis features) works without this step -
the "Generate AI Interpretation" button just shows a clear error until Ollama is running.

### Option B: Run backend and frontend separately (for active development)

Also requires PostgreSQL and a local Kafka broker running (`docker compose up postgres kafka` is
an easy way to get both without starting the backend/frontend containers too).

#### Backend

Create the database once:

```sql
CREATE DATABASE candor;
```

By default it connects as postgres/postgres on localhost:5432 - update
backend/src/main/resources/application.properties if yours differs.

```bash
cd backend
mvn spring-boot:run
```

Runs on http://localhost:8080. Tables are created automatically on first run.

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on http://localhost:5173. (Under Docker Compose, it's served on http://localhost:3000 instead.)

### Using it

Enter any public GitHub owner and repo (e.g. spring-projects / spring-boot) and click
**Run analysis**. Public repos work without a token, limited to GitHub's 60 requests/hour
anonymous rate limit. Add a personal access token in the form to raise that limit; it's sent
only with the outgoing request and never stored.

## Testing

```bash
cd backend
mvn test
```

CommentClassifierTest covers superficial phrases, substantive feedback, the case that
specifically requires keyword matching (not just length), and null/blank comments. Plain unit
tests - CommentClassifier has no external dependencies, so no Spring context or mocking is needed.

## Docker

```bash
docker compose up --build
```

Builds and runs all three services together. See docker-compose.yml, backend/Dockerfile,
and frontend/Dockerfile.

## CI/CD

.github/workflows/ci-cd.yml runs on every push/PR to main: tests, then backend build, then
frontend build, then deploy (only on main, only if tests and both builds passed). The deploy
job is a working template that needs AWS secrets configured - see DEPLOYMENT.md.

## Deployment

See DEPLOYMENT.md for the full AWS setup.

## API

| Method | Path | Description |
|---|---|---|
| POST | /api/analyze | Runs a fresh analysis: { owner, repo, token?, limit } -> summary + per-PR results with evidence |
| GET | /api/history?owner=&repo= | Returns cached results from a previous analysis |
| GET | /api/health | Health check |

## Talking about this in an interview

"I noticed that in most teams, a PR approval comment like 'LGTM' doesn't tell you whether the
review was actually rigorous. I built Candor to pull PR and commit history from the GitHub
API, classify review comments as superficial or substantive using length and keyword rules,
and check whether the same files showed follow-up fix activity within two weeks of merge.
Everything is framed as a signal worth investigating, never as proof - the UI explicitly
separates observed facts from classification from correlation, and distinguishes '0% -
evaluated and found none' from 'N/A - not enough data to evaluate' throughout."

One honest limitation worth knowing going in: the keyword-based classifier and fix-detector are
heuristics, not ground truth - a long comment isn't always a good one, and a "fix" commit isn't
always related to the reviewed change. That's a reasonable trade-off to name if asked, not a
flaw to hide.
