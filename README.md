# IT Asset Tracker

Full-stack inventory & assignment management system.

**Stack:** React + Tailwind CSS → Java Spring Boot REST API → Supabase (PostgreSQL)

---

## Project Structure

```
it-asset-tracker/
├── schema.sql                          ← Run this in Supabase SQL Editor first
├── backend/                            ← Spring Boot Java project
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/assettracker/
│       │   ├── AssetTrackerApplication.java
│       │   ├── config/CorsConfig.java
│       │   ├── controller/AssetController.java
│       │   ├── model/
│       │   │   ├── Asset.java
│       │   │   └── AssignmentLog.java
│       │   └── repository/
│       │       ├── AssetRepository.java
│       │       └── AssignmentLogRepository.java
│       └── resources/application.properties
└── frontend/                           ← React + Vite project
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── api/assetApi.js
        └── components/Dashboard.jsx
```

---

## Setup Guide

### Step 1 — Supabase Database

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** in the dashboard
3. Paste and run the full contents of `schema.sql`
4. Verify tables `assets` and `assignment_logs` are created with seed data

### Step 2 — Java Backend

**Prerequisites:** Java 17+, Maven 3.8+

1. Edit `backend/src/main/resources/application.properties`:
   ```
   spring.datasource.url=jdbc:postgresql://db.YOUR_PROJECT_REF.supabase.co:5432/postgres
   spring.datasource.password=YOUR_SUPABASE_DB_PASSWORD
   ```
   Find these in: Supabase Dashboard → Project Settings → Database

2. Build and run:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   The API will be available at `http://localhost:8080`

3. Test the API:
   ```bash
   curl http://localhost:8080/api/assets/dashboard
   curl http://localhost:8080/api/assets
   ```

### Step 3 — React Frontend

**Prerequisites:** Node.js 18+

```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## API Reference

| Method | Endpoint                     | Description                          |
|--------|------------------------------|--------------------------------------|
| GET    | `/api/assets/dashboard`      | Live metric counts                   |
| GET    | `/api/assets`                | All assets (optional `?status=`)     |
| GET    | `/api/assets/{id}`           | Single asset by UUID                 |
| GET    | `/api/assets/{id}/logs`      | Assignment history for an asset      |
| POST   | `/api/assets`                | Create new asset                     |
| PUT    | `/api/assets/{id}/assign`    | Assign asset to a user               |
| PUT    | `/api/assets/{id}/status`    | Change status (AVAILABLE/IN_REPAIR…) |

### Example: Assign an asset
```bash
curl -X PUT http://localhost:8080/api/assets/{UUID}/assign \
  -H "Content-Type: application/json" \
  -d '{"assignedTo": "Alice Johnson", "performedBy": "IT Admin"}'
```

### Example: Mark as In-Repair
```bash
curl -X PUT http://localhost:8080/api/assets/{UUID}/status \
  -H "Content-Type: application/json" \
  -d '{"status": "IN_REPAIR", "notes": "LCD screen cracked", "performedBy": "IT Admin"}'
```

---

## Environment Variables (Frontend)

Create `frontend/.env.local` to override the default API URL:
```
VITE_API_BASE_URL=http://localhost:8080/api
```

For production, set this to your deployed backend URL.

---

## Asset Status Flow

```
        ┌──────────────────────────────────┐
        │                                  │
  [AVAILABLE] ──assign──► [ASSIGNED]       │
       ▲                      │            │
       │                  unassign         │
       └──────────────────────┘            │
       │                                   │
  [IN_REPAIR] ◄──mark repair──────────────┘
       │
  mark available
       │
  [AVAILABLE]

  [RETIRED] ← terminal state, no transitions out
```
