# Finance Data Processing and Access Control Backend

A comprehensive backend system for a finance dashboard implementing precise APIs, layered data modeling, and robust Role-Based Access Control (RBAC). Built as an evaluation of core backend proficiency.

## Tech Stack & Setup Process

This project prioritizes maintainability and strong typings.
- **Node.js + Express**: Scalable, minimalist, but universally understood.
- **TypeScript**: Used aggressively for data integrity validation and IDE completions.
- **Prisma & SQLite**: Prisma is an outstanding ORM that syncs with SQLite perfectly. SQLite was chosen over Postgres/MySQL to eliminate heavy local dependencies and allow 1-click evaluation.
- **Zod**: Input boundaries are guarded using rigorous Zod typings statically synced with TypeScript.
- **JSON Web Tokens (JWT)**: Fully uncoupled stateless authentication. 

### Quick Start
1. **Install modules**:
   ```sh
   npm install
   ```

2. **Migrate the schema locally**: 
   Creates your `dev.db` file populated directly from `schema.prisma`.
   ```sh
   npx prisma db push
   ```

3. **Start the Development Server**:
   ```sh
   npm run dev
   ```

---

## Architecture & APIs Explanation

Routing logic is separated clearly between modular instances: Auth, Users, Records, and Dashboard. Every entity delegates heavy DB queries cleanly to Prisma instances.

### 1. Authentication (`/api/auth`)
*   `POST /register`: A specialized bootstrap endpoint allowing you to seed your **ADMIN** account immediately for evaluation testing. Payload: `{ email, password }`.
*   `POST /login`: Receives `{ email, password }` and responds securely with an active JWT token to populate the header `Authorization: Bearer <TOKEN>`.

### 2. User Management (`/api/users`) - strictly ADMIN
*   Provides standardized CRUD. Handlers restrict users strictly to `{ email, password, role }` payloads safely hashing inputs.

### 3. Financial Records Management (`/api/records`) - ANALYST, ADMIN
*   `GET /`: Fetches all existing records. Features native dataset **Pagination** utilizing the query mappings `?take=10&skip=0`. Easily filter targets identically via `?category=Salary&type=INCOME&startDate=2024-01-01`.
*   `POST /`, `PUT /:id`, `DELETE /:id`: Data modification interfaces reserved exclusively for Admin authorization logic. Zod coercion natively translates date inputs accurately inside JSON boundaries. 

### 4. Dashboards Aggregation (`/api/dashboard`) - VIEWER, ANALYST, ADMIN
*   `GET /summary`: Exploits Prisma SQLite's `_sum` properties directly. Pulls `Total Income` and maps `Total Expenses`, securely solving net balances natively without blocking memory channels. 
*   `GET /category-totals` & `GET /recent-activity`: Fast grouped analytics payloads mirroring the summaries natively securely formatted.
*   `GET /trends`: In-memory array mapper projecting chronological transactions to clean, front-end friendly `YYYY-MM` formats representing financial trend insights effectively. Useful for line/bar charts implementations.

---

## Roles Summary (RBAC)

Strict access guarantees intercept logic per-route layer securely:
*   **VIEWER**: The lowest privilege subset. Can inspect parsed read-only items (Dashboard summaries). Requesting records results dynamically in a `403 Forbidden` response.
*   **ANALYST**: Extended monitoring logic allows viewing Dashboard aggregates **and** paginating core transactional Finance Records, but not editing them.
*   **ADMIN**: Limitless routing privileges. Extends Analyst access providing exclusive `POST/PUT/DELETE` methods onto `FinancialRecords` & native User tracking routes securely.

---

## Assumptions Made

- **Registration**: Normally behind enterprise authentication or invitation logics, the `POST /auth/register` route was purposely kept public simply to accommodate immediate bootstrap testing.
- **Error Formats**: I assumed consumer frontends require heavily mapped error payloads to display accurate field labels, causing the implementation of custom wrapper catching in `app.ts` mapped exclusively to native Zod validation faults.

## Tradeoffs Considered

- **In-Memory Trends vs SQL View:** Prisma SQLite native `groupBy` struggles uniquely parsing raw `Date()` objects compared to Postgres strings. To circumvent adding arbitrary raw SQL, `getTrends()` maps dates iteratively in memory. While technically highly-efficient under 100K sets, an eventual production transition to PostgreSQL natively resolves this using `date_trunc()` commands internally.
- **Soft Deletion Mechanism**: Standard `prisma.financialRecord.delete()` destroys rows entirely natively. In standard enterprise architecture, we attach `deletedAt` DateTime columns acting as dynamic filter markers. Since "Soft Delete functionality" was optional, building hard deletions was preferred here cleanly maximizing code brevity.