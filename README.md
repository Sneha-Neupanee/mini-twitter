# Mini Twitter

Mini Twitter is a production-style microblogging backend built with Spring Boot 3 and a supporting infrastructure stack (PostgreSQL, Redis, RabbitMQ). The system includes JWT authentication, user/social graph, posts with engagement, feed generation, trending, and direct messaging.

This repository contains:
- `backend/`: Spring Boot REST API (Java 17)
- `frontend/`: React client (Vite + TailwindCSS) that consumes the backend API

## Key capabilities

### Authentication and security
- JWT-based authentication (stateless API)
- Password hashing via BCrypt
- Validation on auth DTOs (registration/login)

### Core product features
- Users: profile, search
- Social graph: follow/unfollow
- Posts: create/delete, repost
- Engagement: likes and comments
- Feeds: home feed, ranked feed, trending feed
- Messaging: direct messages and conversation retrieval

### Asynchronous processing and caching
- RabbitMQ events for async updates (e.g., feed/trending recalculation)
- Redis used for caching feed/trending results

## Architecture and code layout

```
mini-twitter/
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/minitwitter/
│       ├── auth/         # JWT authentication, DTOs, filters, services
│       ├── user/         # User domain, repository, endpoints
│       ├── post/         # Post domain and endpoints
│       ├── social/       # Follow/unfollow graph
│       ├── engagement/   # Likes and comments
│       ├── feed/         # Home + ranked feed
│       ├── trending/     # Trending posts
│       ├── messaging/    # Direct messages
│       ├── events/       # RabbitMQ publisher/consumer
│       └── config/       # Security, Redis, RabbitMQ, app wiring
├── frontend/
│   ├── package.json
│   └── src/
│       ├── api/          # API client (Axios)
│       ├── context/      # Auth/session context
│       ├── components/   # UI building blocks
│       └── pages/        # Routes/pages
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## Tech stack

### Backend
- Java 17, Spring Boot 3.2.x
- Spring Security (JWT), Spring Validation
- Spring Data JPA / Hibernate

### Data and infrastructure
- PostgreSQL (primary relational datastore)
- Redis (caching)
- RabbitMQ (event bus; management UI enabled in Docker)

### Frontend
- React + Vite
- TailwindCSS
- Axios for HTTP calls to the backend API

## Running the full system (recommended)

### Prerequisites
- Docker Engine + Docker Compose v2

### Start everything

From the repository root:

```bash
docker compose up --build
```

Services started:
- Backend API: `http://localhost:8080/api`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- RabbitMQ: `localhost:5672`
- RabbitMQ Management UI: `http://localhost:15672`

### Run the frontend against the Dockerized backend

The frontend is not containerized in `docker-compose.yml` (intentionally, to keep the production backend stack focused), but it can be run locally while the backend runs in Docker.

Prerequisites:
- Node.js 18+

Start the backend stack:

```bash
docker compose up --build
```

Start the frontend (in a separate terminal):

```bash
cd frontend
npm install
npm run dev
```

By default the backend is available at `http://localhost:8080/api`. If your frontend needs an explicit API base URL, set it using Vite environment variables (example):

```bash
echo "VITE_API_BASE_URL=http://localhost:8080/api" > .env.local
npm run dev
```

### Configuration via environment variables

The backend is configured to read sensitive settings from environment variables (with safe local defaults). For Docker Compose, you can supply these via a `.env` file.

1) Copy the example file:

```bash
cp .env.example .env
```

2) Edit `.env` and set at minimum:
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `JWT_SECRET` (set a strong secret for anything beyond local dev)

### Environment variables used by the backend

| Category | Variable | Example |
|---|---|---|
| DB | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://postgres:5432/minitwitter` |
| DB | `SPRING_DATASOURCE_USERNAME` | `postgres` |
| DB | `SPRING_DATASOURCE_PASSWORD` | `postgres` |
| Redis | `SPRING_DATA_REDIS_HOST` | `redis` |
| Redis | `SPRING_DATA_REDIS_PORT` | `6379` |
| RabbitMQ | `SPRING_RABBITMQ_HOST` | `rabbitmq` |
| RabbitMQ | `SPRING_RABBITMQ_PORT` | `5672` |
| RabbitMQ | `SPRING_RABBITMQ_USERNAME` | `guest` |
| RabbitMQ | `SPRING_RABBITMQ_PASSWORD` | `guest` |
| RabbitMQ | `SPRING_RABBITMQ_VIRTUAL_HOST` | `/` |
| JWT | `JWT_SECRET` | `change-me-in-prod` |
| JWT | `JWT_EXPIRATION` | `86400000` |

## Running locally without Docker (advanced)

### Prerequisites
- Java 17+
- Maven 3.8+
- PostgreSQL 14+
- Redis 6+
- RabbitMQ 3.11+

### Backend

```bash
cd backend
mvn spring-boot:run
```

Backend base URL: `http://localhost:8080/api`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend dev server: `http://localhost:3000`

## Feed scoring

The ranked feed uses a simple scoring heuristic:

```
score = (likes × 2) + (comments × 3) + (reposts × 4) − (ageInHours × 0.5)
```

Updates are performed asynchronously via RabbitMQ events.

## API overview (selected)

All endpoints are served under the base path `/api`.

### Auth
- `POST /auth/register`: Register a new user
- `POST /auth/login`: Login and retrieve a JWT

### Users and social graph
- `GET /users/{id}`: Get user by id
- `GET /users/search?q=`: Search users
- `POST /users/{id}/follow`: Follow a user
- `DELETE /users/{id}/unfollow`: Unfollow a user

### Posts and engagement
- `POST /posts`: Create post
- `DELETE /posts/{id}`: Delete post
- `POST /posts/{id}/like`: Toggle like
- `POST /posts/{id}/comment`: Add comment
- `POST /posts/{id}/repost`: Repost

### Feeds
- `GET /feed/home`: Home feed
- `GET /feed/ranked`: Ranked feed
- `GET /feed/trending`: Trending posts

### Messaging
- `POST /messages`: Send a direct message
- `GET /messages/{userId}`: Get conversation
- `GET /messages/conversations`: List conversations

## CI

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on pushes to `main`:
- Maven build + tests
- Docker image build for the backend (build-only; no deploy)

## Production notes

- The Docker Compose stack is designed for parity and repeatability. For real production:
  - Move secrets to a secret manager (or at minimum a protected CI/CD secret store).
  - Use managed Postgres/Redis/RabbitMQ or add backups, persistence strategy, and monitoring.
  - Consider enabling Spring Boot Actuator health endpoints and wiring compose healthchecks to HTTP.
 
    enjoy using my mini twitter:)
