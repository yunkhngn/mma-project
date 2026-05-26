# Firebase Configuration & Hot Reload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable NestJS backend to initialize the Firebase Admin SDK using either a local service account JSON file path or a stringified JSON environment variable, and configure Docker Compose / Dockerfile for development hot-reloading.

**Architecture:** Modify `FirebaseService` to inspect the `FIREBASE_SERVICE_ACCOUNT` configuration. If it represents a JSON string, parse it; if it is a file path, load it using Node's `fs` module. Create a `development` stage in the `Dockerfile` running `npm run start:dev` and mount local volumes to `api` service in `docker-compose.yml`.

**Tech Stack:** NestJS, TypeScript, Firebase Admin SDK (`firebase-admin`), Node.js `fs` & `path` modules, Docker, Docker Compose.

---

## Plan Details

### Task 1: Add Unit Tests for Firebase Service Path and JSON Loading (Completed)
- Done. Unit tests added to `backend/src/firebase/firebase.service.spec.ts`.

### Task 2: Implement File Path Loading in Firebase Service (Completed)
- Done. Implementation code updated in `backend/src/firebase/firebase.service.ts` and tests verified passing.

---

### Task 3: Add Development Stage to Dockerfile

**Files:**
- Modify: `backend/Dockerfile`

- [ ] **Step 1: Edit Dockerfile to insert development stage before production stage**
  Modify `backend/Dockerfile` to add the `development` stage after the `builder` stage:
  ```dockerfile
  # ---- Development ----
  FROM base AS development
  COPY --from=deps /app/node_modules ./node_modules
  COPY . .
  RUN npx prisma generate
  EXPOSE 3000
  CMD ["npm", "run", "start:dev"]
  ```

- [ ] **Step 2: Commit Dockerfile**
  Run:
  ```bash
  git add backend/Dockerfile
  git commit -m "feat: add development build target to Dockerfile"
  ```

---

### Task 4: Update Docker Compose for Dev Target, Volumes, and Hot-Reload

**Files:**
- Modify: `backend/docker-compose.yml`

- [ ] **Step 1: Update api service in docker-compose.yml**
  Modify `backend/docker-compose.yml` to change target to `development` and mount code volumes:
  ```yaml
    api:
      build:
        context: .
        target: development
      container_name: mma-api
      restart: unless-stopped
      ports:
        - "${PORT:-3000}:3000"
      volumes:
        - .:/app
        - /app/node_modules
        - ./serviceAccountKey.json:/app/serviceAccountKey.json
      environment:
        PORT: 3000
        NODE_ENV: ${NODE_ENV:-development}
        DATABASE_URL: mysql://${DB_USER:-mma_user}:${DB_PASSWORD:-mma_password}@mysqldb:3306/${DB_NAME:-mma_db}
        FIREBASE_SERVICE_ACCOUNT: ${FIREBASE_SERVICE_ACCOUNT:-'{}'}
      depends_on:
        mysqldb:
          condition: service_healthy
      networks:
        - mma-network
  ```

- [ ] **Step 2: Verify Docker build and hot reload works**
  Run build command: `docker compose build`
  Expected: Successful build of `development` target image.

- [ ] **Step 3: Commit docker-compose.yml**
  Run:
  ```bash
  git add backend/docker-compose.yml
  git commit -m "config: enable docker compose hot reload for development"
  ```
