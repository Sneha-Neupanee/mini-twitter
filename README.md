# Mini Twitter

Mini Twitter is a production-style full-stack microblogging application: a **Spring Boot 3** REST API (Java 17), a **React** SPA (Vite + TailwindCSS), and supporting infrastructure (**PostgreSQL**, **Redis**, **RabbitMQ**). It includes JWT authentication, user profiles and search, a follow graph, posts with engagement (likes, comments, reposts), ranked and trending feeds backed by cache and async events, and direct messaging.

This repository contains:

- **`backend/`** — Spring Boot REST API (`server.servlet.context-path=/api`)
- **`frontend/`** — React client; Axios uses **`baseURL: '/api'`** (same-origin in production)
- **`docker-compose.yml`** — One-command local stack (Postgres, Redis, RabbitMQ, backend)
- **`k8s/`** — Kubernetes manifests (NGINX Ingress, StatefulSets, Secrets, ConfigMaps, HPA)
- **`.github/workflows/ci.yml`** — CI: Maven tests + backend Docker image build

## Key capabilities

### Authentication and security

- JWT-based authentication (stateless API)
- Password hashing via BCrypt
- Validation on auth DTOs (registration/login)
- Spring Boot **Actuator** health endpoints (used for Kubernetes probes under `/api/actuator/health/*`)

### Core product features

- Users: profile, search
- Social graph: follow/unfollow
- Posts: create/delete, repost
- Engagement: likes and comments
- Feeds: home feed, ranked feed, trending feed
- Messaging: direct messages and conversation retrieval

### Asynchronous processing and caching

- **RabbitMQ** for domain events (e.g. feed/trending updates)
- **Redis** for feed/trending caching (TTLs configured in `application.yml`)

## Architecture and folder structure

High-level flow:

1. The browser talks to the **API under `/api`** (relative to the site origin).
2. The **backend** persists data in **PostgreSQL**, publishes/consumes **RabbitMQ** messages, and uses **Redis** for cache keys defined under `cache.*` in config.
3. **Docker Compose** runs all dependencies plus the backend on one machine.
4. **Kubernetes** runs the same logical stack with cluster DNS (`postgres`, `redis`, `rabbitmq`, `backend`, `frontend`) and an **Ingress** that splits `/` (SPA) and `/api` (API).

```
mini-twitter/
├── backend/
│   ├── Dockerfile                 # Multi-stage: Maven build → JRE 17 runtime (non-root)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/minitwitter/
│       │   ├── auth/              # JWT, AuthController, JwtService, filters
│       │   ├── user/
│       │   ├── post/
│       │   ├── social/
│       │   ├── engagement/
│       │   ├── feed/
│       │   ├── trending/
│       │   ├── messaging/
│       │   ├── events/            # RabbitMQ integration
│       │   ├── config/            # Security, Redis, RabbitMQ, ApplicationConfig
│       │   └── exception/         # GlobalExceptionHandler, domain exceptions
│       └── resources/
│           └── application.yml    # Env-driven config + Actuator
├── frontend/
│   ├── Dockerfile                 # Node build → nginx:alpine (static SPA)
│   ├── nginx.conf                 # SPA + optional in-cluster /api → backend proxy
│   ├── vite.config.js             # Dev proxy: /api → http://localhost:8080
│   └── src/
│       ├── api/                   # Axios instance (baseURL `/api`)
│       ├── context/
│       ├── components/
│       └── pages/
├── docker-compose.yml
├── .env.example                   # Compose-friendly variable template
├── .dockerignore
├── k8s/
│   ├── kustomization.yaml         # kubectl apply -k k8s/
│   ├── namespace.yaml
│   ├── README.md                  # Detailed K8s runbook
│   ├── config/README.md           # Secrets and wiring notes
│   ├── database/                  # Postgres Secret, Service, StatefulSet (+ examples)
│   ├── redis/
│   ├── rabbitmq/
│   ├── backend/                   # ConfigMap, Deployment, Service, HPA, Secret
│   ├── frontend/
│   └── ingress/                   # NGINX Ingress: / → frontend, /api → backend
└── .github/workflows/ci.yml
```

## Tech stack

| Area | Technology |
|------|------------|
| Backend | Java 17, Spring Boot 3.2.x, Spring Security (JWT), Validation, Data JPA, Actuator |
| API docs / health | Actuator: `health`, `info`; Kubernetes probe paths under `/api/actuator/health` |
| Database | PostgreSQL 16 (Docker / K8s StatefulSet) |
| Cache | Redis 7 (Spring Data Redis) |
| Messaging | RabbitMQ 3.13 with management plugin (Docker / K8s) |
| Auth tokens | JJWT, BCrypt (`PasswordEncoder` bean) |
| Frontend | React 18, Vite, TailwindCSS, Axios |
| Containers | Docker Compose; backend and frontend multi-stage Dockerfiles |
| Orchestration | Kubernetes (Kustomize), NGINX Ingress Controller, optional HPA (CPU) |
| CI | GitHub Actions: Maven `test`, `docker build` for backend image |

## API, frontend, and reverse-proxy behavior

- **Backend URL prefix:** All REST routes are served under **`/api`** (Spring `server.servlet.context-path=/api`). Example: `POST /api/auth/login`.
- **Frontend HTTP client:** `frontend/src/api/axios.js` sets **`baseURL: '/api'`**, so the browser calls same-origin paths like `/api/feed/home`.
- **Local dev (`npm run dev`):** Vite proxies **`/api`** to **`http://localhost:8080`** (see `frontend/vite.config.js`), which matches the backend port; Spring still serves under `/api` on that port.
- **Docker Compose:** Only the **backend** service is defined; the UI is typically run with Vite on port 3000 against `localhost:8080` (or adjust `.env` / Vite as needed).
- **Production frontend container (`frontend/nginx.conf`):**
  - **`/`** — static files + SPA fallback (`try_files` → `index.html`).
  - **`/api`** — `proxy_pass http://backend:8080` **without** stripping the path, so upstream receives **`/api/...`**, which matches Spring’s context path. This is intended for topologies where the browser hits the **frontend** pod and the pod proxies to the **`backend`** Kubernetes Service.
- **Kubernetes Ingress (`k8s/ingress/ingress.yaml`):** NGINX routes **`/`** to the **frontend** Service and **`/api`** to the **backend** Service on port 8080. Either Ingress-only or nginx-in-pod proxying can work; avoid double-proxying unless you understand path and header behavior.

## PostgreSQL, Redis, and RabbitMQ integration

- **PostgreSQL:** Primary datastore for users, posts, follows, messages, etc. Connection via `SPRING_DATASOURCE_*`. In Compose/K8s, hosts are **`postgres`** (not `localhost` inside containers).
- **Redis:** Used for feed/trending cache keys and TTLs (`cache.feed`, `cache.trending` in `application.yml`). Host **`redis`** in Compose/K8s.
- **RabbitMQ:** Declared exchanges/queues/routing keys under `rabbitmq.*` in `application.yml`; Java packages under `events/` implement publishers/consumers. Host **`rabbitmq`** in Compose/K8s; management UI on **15672** when exposed.

## Running the full system with Docker Compose (recommended for local parity)

### Prerequisites

- Docker Engine + Docker Compose v2

### Start infrastructure + backend

From the repository root:

```bash
docker compose up --build
```

Services:

| Service | Role | Ports (host) |
|---------|------|----------------|
| Backend API | Spring Boot | **8080** (base path **`/api`**) |
| PostgreSQL | Database | 5432 |
| Redis | Cache | 6379 |
| RabbitMQ | AMQP + management | 5672, **15672** (UI) |

### Run the frontend (local dev)

Compose does **not** start the React dev server by design. In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open **`http://localhost:3000`**. Vite proxies **`/api`** to **`http://localhost:8080`**.

Optional explicit API base (usually not needed with the default proxy):

```bash
echo "VITE_API_BASE_URL=http://localhost:8080/api" > .env.local
npm run dev
```

### Compose environment variables

Copy and edit:

```bash
cp .env.example .env
```

Compose injects variables into the **backend** container (see `docker-compose.yml`). Typical overrides: `POSTGRES_*`, `RABBITMQ_*`, `JWT_SECRET`, `JWT_EXPIRATION`.

### Backend configuration reference (`application.yml` + env)

Spring reads standard **`SPRING_*`** variables and **`JWT_*`**. Defaults in `application.yml` target localhost for bare-metal dev; Compose and K8s override hosts to service names.

| Category | Variable | Example (in-cluster) |
|----------|----------|----------------------|
| DB | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://postgres:5432/minitwitter` |
| DB | `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD` | from Secrets / `.env` |
| DB driver | `SPRING_DATASOURCE_DRIVER_CLASS_NAME` | `org.postgresql.Driver` |
| JPA | `SPRING_JPA_HIBERNATE_DDL_AUTO` | `update` (dev); prefer `validate` in strict prod |
| Redis | `SPRING_DATA_REDIS_HOST` / `SPRING_DATA_REDIS_PORT` | `redis`, `6379` |
| RabbitMQ | `SPRING_RABBITMQ_HOST` / `PORT` / `USERNAME` / `PASSWORD` / `VIRTUAL_HOST` | `rabbitmq`, `5672`, … |
| JWT | `JWT_SECRET` | strong secret (hex/base64/string per `JwtService` decoding) |
| JWT | `JWT_EXPIRATION` | e.g. `86400000` |
| Hikari | `SPRING_DATASOURCE_HIKARI_INITIALIZATION_FAIL_TIMEOUT` | `0` in Compose to tolerate slow DB start |

**CORS:** `app.cors.allowed-origins` defaults to `http://localhost:3000`. If you serve the UI from another origin, align CORS in config or environment for that deployment.

**Actuator (health):** With `management.endpoint.health.probes.enabled=true`, Kubernetes-oriented liveness/readiness paths are exposed under **`/api/actuator/health`** (same servlet context as the API).

## Running locally without Docker (advanced)

### Prerequisites

- Java 17+, Maven 3.8+
- PostgreSQL 14+, Redis 6+, RabbitMQ 3.11+ running locally

### Backend

```bash
cd backend
mvn spring-boot:run
```

Base URL: **`http://localhost:8080/api`**

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Dev server: **`http://localhost:3000`**

## Kubernetes deployment

Manifests live under **`k8s/`** and are wired with **`kubectl apply -k k8s/`** (`kustomization.yaml`).

### What gets deployed

| Component | Kubernetes resources |
|-----------|------------------------|
| Namespace | `mini-twitter` |
| PostgreSQL | Secret, Service, StatefulSet, PVC |
| Redis | Service, Deployment |
| RabbitMQ | Secret, Service, StatefulSet, PVC |
| Backend | Secret (`jwt-secret`), ConfigMap, Service, Deployment, **HPA** (CPU; requires metrics-server) |
| Frontend | Service, Deployment (nginx + static build) |
| Ingress | NGINX: host **`mini-twitter.local`**, **`/`** → frontend, **`/api`** → backend |

Default **dev-oriented** Secrets (`postgres-secret`, `rabbitmq-secret`, `backend-secret`) are included so the backend avoids `CreateContainerConfigError`; **replace them for production** (see `k8s/README.md` and `k8s/config/README.md`).

### Images

| Image | Dockerfile | Notes |
|-------|------------|--------|
| `mini-twitter-backend:latest` | `backend/Dockerfile` | Maven package → Temurin 17 JRE, non-root user, port **8080** |
| `mini-twitter-frontend:latest` | `frontend/Dockerfile` | `npm ci` + `npm run build` → nginx |

Build (example):

```bash
docker build -t mini-twitter-backend:latest -f backend/Dockerfile backend
docker build -t mini-twitter-frontend:latest -f frontend/Dockerfile frontend
```

On **Minikube**, build inside `eval $(minikube docker-env)` or load images into the cluster; set **`imagePullPolicy: Never`** if images are not pushed to a registry.

### Apply

```bash
kubectl apply -k k8s/
```

Add **`mini-twitter.local`** (and optionally **`rabbitmq.local`** if you apply optional RabbitMQ ingress) to `/etc/hosts` pointing at your Ingress controller external IP. Full steps, DNS, and troubleshooting: **`k8s/README.md`**.

## Feed scoring

The ranked feed uses:

```
score = (likes × 2) + (comments × 3) + (reposts × 4) − (ageInHours × 0.5)
```

Updates are driven asynchronously via RabbitMQ where implemented in the codebase.

## API overview (selected)

All HTTP routes are under **`/api`** on the server (e.g. `GET http://localhost:8080/api/feed/home`).

### Auth

- `POST /auth/register` — Register
- `POST /auth/login` — Login (returns JWT)

### Users and social graph

- `GET /users/{id}` — Get user
- `GET /users/search?q=` — Search users
- `POST /users/{id}/follow` — Follow
- `DELETE /users/{id}/unfollow` — Unfollow

### Posts and engagement

- `POST /posts` — Create post
- `DELETE /posts/{id}` — Delete post
- `POST /posts/{id}/like` — Toggle like
- `POST /posts/{id}/comment` — Add comment
- `POST /posts/{id}/repost` — Repost

### Feeds

- `GET /feed/home` — Home feed
- `GET /feed/ranked` — Ranked feed
- `GET /feed/trending` — Trending

### Messaging

- `POST /messages` — Send DM
- `GET /messages/{userId}` — Conversation
- `GET /messages/conversations` — List conversations

## CI (GitHub Actions)

On push to **`main`** (`.github/workflows/ci.yml`):

- `mvn -f backend/pom.xml test`
- `docker build` for the **backend** image (`mini-twitter-backend:ci`)

The **frontend** image is not built in CI today; build it locally or extend the workflow as needed.

## Common troubleshooting

| Symptom | Things to check |
|---------|------------------|
| **401 / CORS** from browser | Origin must match `app.cors.allowed-origins`; JWT `Authorization` header on protected routes |
| **404 on `/api` from SPA** | Vite proxy off? Wrong base URL? In K8s, Ingress path `/api` must reach backend Service :8080 |
| **Double `/api` or missing `/api`** | Spring context path is `/api`; nginx `proxy_pass` must preserve `/api` (see `frontend/nginx.conf`) |
| **Compose: backend exits** | Postgres/RabbitMQ not healthy yet; `SPRING_DATASOURCE_HIKARI_INITIALIZATION_FAIL_TIMEOUT=0` helps; check `docker compose logs backend` |
| **K8s: `CreateContainerConfigError`** | Secrets missing or wrong namespace; ensure `kubectl apply -k k8s/` created `postgres-secret`, `rabbitmq-secret`, `backend-secret` in **`mini-twitter`** |
| **K8s: PVC Pending** | Cluster needs a default **StorageClass** |
| **HPA unknown / no scale** | Install **metrics-server** |
| **JWT / signing errors** | `JWT_SECRET` format must match `JwtService` (hex, Base64, or plain string fallback) |

## Production notes

- Prefer managed PostgreSQL/Redis/RabbitMQ or hardened operators, backups, and secret rotation.
- Replace committed Kubernetes Secrets with a secret manager or Sealed Secrets / External Secrets for real environments.
- Tighten `SPRING_JPA_HIBERNATE_DDL_AUTO` (`validate` or migrations) beyond disposable clusters.
- Expand CI to build and scan the frontend image when you promote it to production registries.

## Current project status

- **Implemented:** Full-stack microblogging flow (auth, profiles, posts, social, feeds, trending, messaging), Redis-backed caching configuration, RabbitMQ-backed event wiring, Docker Compose for local full stack, multi-stage Docker images, Kubernetes manifests with Ingress and HPA, Actuator health for probes, GitHub Actions for backend build + test.
- **Operational models:** Local JVM + Vite; Docker Compose + Vite; Kubernetes (frontend + backend + data stores + Ingress).
- **Not claimed here:** Managed cloud deploy, production-grade secret storage, or extended CI for the frontend image unless you add it.
