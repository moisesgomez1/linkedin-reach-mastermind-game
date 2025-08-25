# Mastermind Game

**Tech:** Node.js + Express, TypeScript, PostgreSQL, Sequelize, JWT (httpOnly cookie), React + Tailwind.

---

## Table of Contents

* [Quick Start (Docker)](#quick-start-docker)  
* [Local Development (Postgres running in Docker Container)](#local-development-postgres-running-in-docker-container)  
* [Environment Variables Docker](#environment-variables-docker)  
* [Environment Variables](#environment-variables)  
* [Tech + Structure](#tech--structure)  
* [How the game works (high-level)](#how-the-game-works-high-level)  
* [How the app flows (end-to-end)](#how-the-app-flows-end-to-end)  
* [API cheat sheet](#api-cheat-sheet)  
* [Testing with Postman & Swagger](#testing-with-postman-and-swagger)
* [Frontend flow](#frontend-flow)  
* [Engineering story](#engineering-story)   
* [Implemented Extensions](#implemented-extensions)  
* [What’s next](#whats-next)

---

## Quick Start (Docker)

This is the easiest way to run the stack without installing Postgres locally.

1. **Install prerequisites**

   Before running, make sure Docker is installed for your platform:

   - **macOS & Windows (with WSL2)** → install [Docker Desktop](https://www.docker.com/products/docker-desktop)  
     - On Windows, ensure **WSL2 integration** is enabled for your distro in Docker Desktop settings.
   - **Linux** → install [Docker Engine](https://docs.docker.com/engine/install/) and [Docker Compose plugin](https://docs.docker.com/compose/install/).

   Verify with:
   ```bash
   docker --version
   docker compose version
   ```

   *(Optional)*: Install `make`/`git` if you want, but not required.

2. **Clone & configure**

   ```bash
   git clone https://github.com/moisesgomez1/linkedin-reach-mastermind-game.git
   cd linkedin-reach-mastermind-game
   touch .env.docker     # docker env will be provided in email or upon request
   ```
   Create a `.env.docker` in the project root (see [Environment Variables Docker](#environment-variables-docker)).

3. **Build & run**

   ```bash
   docker compose up --build -d
   ```

4. **Open the app**

   * Backend: [http://localhost:3000](http://localhost:3000)  
   * Swagger: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

> **Note**: The compose file provisions Postgres, builds the server, and runs the client. If your compose uses different service names/ports, check the file and adjust accordingly.

---

## Local Development (Postgres running in Docker Container or Local Install)

If you prefer to run things directly on your machine.

### 1) Install tools

* **Node.js** (LTS recommended)
* **PostgreSQL 14+** (either local install or Docker container)

### 2) Start a Postgres database

Option A — **Run Postgres in Docker** (simplest):
```bash
docker run --name mastermind-db -e POSTGRES_USER=postgres   -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=mastermind   -p 5432:5432 -d postgres:16
```

Option B — **Install Postgres locally**:
1. [Install PostgreSQL](https://www.postgresql.org/download/) for your OS.  
2. Start the service (on Linux it’s usually `sudo service postgresql start`).  
3. Create a database and user that match your `.env` file:
   ```bash
   psql -U postgres
   ```
   Then inside the shell:
   ```sql
   CREATE DATABASE mastermind;
   CREATE USER postgres WITH PASSWORD 'postgres';
   GRANT ALL PRIVILEGES ON DATABASE mastermind TO postgres;
   ```

### 3) Configure environment

Create a `.env` in the project root (see [Environment Variables](#environment-variables)).

### 4) Install & run

```bash
npm install

# run backend + frontend in dev mode (two processes)
npm run dev
# backend only
npm run dev:server
# frontend only
npm run dev:client

# build for production
npm run build:server && npm run build:client
npm start  # serves built bundle via Express
```

Open:

* **Client** dev server: [http://localhost:8080](http://localhost:8080)  
* **Server**: [http://localhost:3000](http://localhost:3000)  
* **Swagger**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## Environment Variables Docker

Create a `.env.docker` file and copy the values provided in the email into the file:

## Environment Variables
Create a `.env` file and copy the values provided in the email into the file:

---

## Tech + Structure
- **Backend:** Node/Express, Sequelize, PostgreSQL
- **Auth:** simple cookie/JWT‑style auth (HTTP‑only cookie). `requireAuth` populates `req.userId`.
- **Randomness:** Random.org API with a local fallback when the API fails.
- **Frontend:** React + TypeScript. One page to start/resume, a play screen, and auth screens.
- **Docs:** OpenAPI served at `/api-docs`.

**Core data model** (Sequelize)
- `User`: `{ id, username, password }`
- `Game`: `{ id, userId, secret:number[4], attemptsLeft|null, isWin, isOver, mode:'classic'|'timed', startTime|null, timeLimit|null }`
- `GameHistory`: `{ id, gameId, guess:number[4], correctNumbers, correctPositions }`

---

## How the game works (high‑level)
**Rules summary**
- Secret is 4 digits, each 0–7. Duplicates **allowed**.
- Classic mode: 10 attempts. Timed mode: 60 seconds.
- After each guess, feedback returns:
  - `correctPositions` (right number, right spot)
  - `correctNumbers` (right number, wrong spot)
- The **server** does the judging; the **client** just renders.

**Session & identity**
- You must be signed in. Auth endpoints set an HTTP‑only cookie; `requireAuth` reads it and sets `req.userId`.
- Each started game sets a `gameId` cookie so the client doesn’t need to pass IDs with every request.

---

## How the app flows (end‑to‑end)
This is the heart of the project. The **server runs the game**, the **client just shows what the server says**.

### 1) Authentication
- You **sign up or log in**.
- On success, the server sets a **secure, HTTP‑only cookie**.
- The React app calls **`GET /api/auth/me`** on load; if the cookie is valid, you’re logged in.
- All game routes require that cookie.

### 2) Start a new game
- In the UI, click **Start New Game** → pick **Classic** or **Timed**.
- The client sends **`POST /api/start`** with `{ mode }`.
- The server:
  - gets a **secret code** (Random.org → local fallback if needed),
  - **creates** a Game in Postgres,
  - sets a **`gameId` cookie** so future calls know which game you’re playing,
  - returns a simple success message.
- The client navigates to **/mastermind**.
> Note: starting a game just **creates** it and sets the cookie. The actual game data is fetched next.

### 3) Load the current game (page load)
- When **/mastermind** mounts, a `useEffect` calls **`GET /api/game`**.
- The server reads the **`gameId` cookie**, loads the game + its full **guess history**, and returns one tidy payload:
  - `guesses[]`, `attemptsLeft`, `isWin`, `isOver`, `mode`, and (for timed games) `startTime` + `timeLimit`.
  - The **secret** is only included when the game is **over**.
- The client fills the screen from this payload.

### 4) Make a guess
- You type **4 digits (0–7)** and submit.
- The client posts **`POST /api/guess`** with `{ guess: number[] }`.
- The server:
  - checks the input is 4 integers in range,
  - finds your game via the cookie,
  - applies the **game logic** (counts correct numbers and positions),
  - updates attempts (Classic) or checks the clock (Timed),
  - sets **win/over** flags when appropriate,
  - appends a row to **GameHistory**,
  - returns the **full, updated game state** and a friendly message like
    _“X correct numbers and Y correct locations.”_
- The client refreshes the history list, updates the latest feedback, attempts, and end‑of‑game UI (and shows the secret if included), then clears the input.

### 5) Continue a past game
- On **Home**, click **Continue Game**.
- The client calls **`GET /api/games`** to list your games.
- Pick one → the client calls **`POST /api/games/:id/select`**.
- The server sets the **`gameId` cookie** to that game.
- The client navigates to **/mastermind** and step **3** runs to hydrate the UI.

### 6) Timed mode expiration
- The UI shows a countdown based on **`startTime + timeLimit`** from the server.
- When it hits **0**, the client calls **`PUT /api/game/expire`**.
- The server marks the game **over** and returns the **secret**, so refreshes stay consistent.

---

## API cheat sheet
All endpoints expect/return JSON and require auth unless noted.

### Auth
- `POST /api/auth/signup` — `{ username, password }`
- `POST /api/auth/login` — `{ username, password }` → sets auth cookie
- `POST /api/auth/logout`
- `GET /api/auth/me` — who am I?

### Game
- `POST /api/start` — body `{ mode:'classic'|'timed' }` → sets `gameId` cookie
- `GET  /api/game` — returns current game state + history (based on `gameId` cookie)
- `POST /api/guess` — body `{ guess:[0..7,0..7,0..7,0..7] }`
- `PUT  /api/game/expire` — mark current game over (timed)
- `GET  /api/games` — list your games
- `POST /api/games/:id/select` — set active game cookie to `:id`

### API docs
- `GET /api-docs` — Swagger UI

---

## Testing with Postman and Swagger
These routes are protected. You’ll need a **valid auth token** first, which the server issues as an **HTTP‑only cookie** on login.

### Quick path (Postman)
1) **Sign up (once)**  
   `POST http://localhost:3000/api/auth/signup` with `{ "username": "alice", "password": "secret" }`.
2) **Log in**  
   `POST http://localhost:3000/api/auth/login` with the same body. Postman will store the **Set‑Cookie** automatically for `localhost:3000` (Cookie Jar).
3) **Verify cookie**  
   In Postman, click **Cookies** (top‑right) → select `localhost` → you should see your auth cookie (e.g., `token`). You don’t need to copy it; Postman will send it on every request to the API.
4) **Call game endpoints**  
   Now `POST /api/start`, `GET /api/game`, etc. will succeed. Remember that **`/api/guess` requires a `gameId` cookie**, which is set when you call `/api/start` (or `/api/games/:id/select`).

### Quick path (Swagger UI)
1) Open **http://localhost:3000/api-docs**.
2) Use **`POST /api/auth/signup`** (once) and then **`POST /api/auth/login`**. Because Swagger runs on the **same origin** as the API, the browser will store the auth cookie.
3) Click **Authorize** on the top right of the Swagger page. When asked for a token, you can paste the token value from your cookie
4) Try any protected route (e.g., **POST /api/start**). For guessing, start a game first so the server can set the `gameId` cookie.

**Troubleshooting**
- If Swagger calls fail after login: refresh the page so the cookie is picked up, or click **Authorize** and paste a token if your Swagger requires Bearer.
- For local dev, cookies are `sameSite:'lax'` and `secure:false`, which is correct for `http://localhost`.


---

## Frontend flow
- **Home** (`/`) has two main buttons:
  - **Start New Game** → goes to **ModeSelect** (`/select-mode`)
  - **Continue Game** → calls `/api/games` and shows your list. Clicking one posts to `/api/games/:id/select` and then routes to `/mastermind`.
- **ModeSelect** posts to `/api/start` with the chosen mode and then routes to `/mastermind`.
- **Mastermind** does a single `useEffect` on mount to call `/api/game`. That payload fully hydrates the screen (history, attempts, flags, and timer config). Every submitted guess posts to `/api/guess` and replaces the local state with the server’s version of truth. The sidebar always reflects the **server‑stored** history.

---

## Engineering story

### Starting tiny
I began with the smallest useful pieces:
- a **random number service** that hits Random.org and falls back locally, and
- a **judge function** that compares two arrays and reports `correctPositions` and `correctNumbers`.

I drove both from Postman first. Seeing a simple 200 with a tiny JSON object made the problem feel grounded before I touched databases or UI.

Next I wrote down the “story” of a round: a player starts a game, makes guesses, and gets feedback until they win or run out of time/attempts. That story immediately raised a question: **where does the secret live** and how do we **resume** a game?

I decided to persist the game, not keep it in memory. That led to two models:
- **Game**: the secret, attempts/time, win/over flags, and later the mode.
- **GameHistory**: every guess with its feedback and timestamp.

### Getting Postgres talking
I hit a funny detour: Windows vs WSL2 Postgres. I had pgAdmin on Windows and Postgres in Ubuntu/WSL. Two installs fought over port 5432. The fix was to disable the Windows service and add a `.wslconfig` with `localhostForwarding=true`. After pointing pgAdmin at `localhost:5432` with the WSL credentials, everything clicked. Lesson: check which Postgres you’re really hitting.

### Designing the middleware chain
I broke flows into small, readable steps:
- **Start game**: `fetchSecret → startGame → setGameCookie`.
- **Play turn**: `loadGame → validateGuessInput → makeGuess → getCurrentGame`.

This made each responsibility obvious and easy to test in isolation.

### Choosing cookies
Early on I let the client send `gameId` in the body. It worked, but it was noisy and easy to misuse. Moving to an **HTTP‑only `gameId` cookie** simplified every call, hid internals from the browser, and unlocked “resume game” with a single `/games/:id/select` endpoint. The client just asks the server, “what’s my current game?”

### CORS, proxies and cookies
Dev was HTTP + a frontend dev server proxy. At first the cookie got “stuck” on the proxy port. The practical fix was to **call the API origin directly** from the client during dev and use `sameSite:'lax'` with `secure:false`. Not pretty, but it removed the mystery.

### The three‑hour, one‑line Tailwind fix
I chased config for a while (PostCSS, file extensions, old docs) before realizing Tailwind v4 just wants a single `@tailwind` import in `index.css`. I was using a previous configuration file and that setup was deprecated. Lesson learned. 

### Adding authentication last
I finished by layering in **auth**: signup/login, an auth cookie, and a lightweight React context with protected routes. On the server, a `requireAuth` middleware injects `userId` so all game queries are scoped to the current user. The UI gained a small Sign Out button.

---

## Implemented Extensions

* **Authentication** (JWT httpOnly) and **per‑user game history**.
* **Timed vs Classic** modes (60s timer, unlimited attempts vs 10 attempts).
* **Resume games**: continue where you left off; `/games` list + `/games/:id/select` to switch.

## What’s next 
- “Hard mode” (no duplicates) + configurable digits/length.
- Hints (spend attempts to reveal a digit or position).
- Scoreboard per user.
