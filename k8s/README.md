# Mini Twitter on Kubernetes

This directory contains production-style manifests for running Mini Twitter on a local cluster (Minikube, kind, k3d) or any cluster with the **NGINX Ingress Controller** and a default `StorageClass` for dynamic PVCs.

## Architecture

- **Ingress (NGINX)**: Single entry host `mini-twitter.local`. Path `/api` routes to the Spring Boot **backend** service (port 8080). Path `/` routes to the **frontend** (nginx serving the Vite build, port 80). The React client uses `axios` `baseURL: '/api'`, so the browser calls same-origin `/api` and Ingress forwards to the backend.
- **Backend**: Deployment (2 replicas by default), ClusterIP Service, ConfigMap for non-sensitive Spring properties, Secrets for JWT and data-store credentials. Probes use Spring Boot Actuator under the app context path: `/api/actuator/health/*`.
- **PostgreSQL**: StatefulSet + PVC for durable data; Service DNS name `postgres` in namespace.
- **Redis**: Deployment + ClusterIP `redis` (cache; emptyDir volume for minimal local clusters).
- **RabbitMQ**: StatefulSet + PVC; ClusterIP `rabbitmq` exposes AMQP (5672) and management (15672). Optional separate Ingress for the management UI (`rabbitmq-ingress-management.yaml`, host `rabbitmq.local`).
- **HPA**: Backend HorizontalPodAutoscaler (CPU 70%) requires **metrics-server** in the cluster.

Secrets are not committed with real values. Copy the `*.example.yaml` files in `database/`, `rabbitmq/`, and `backend/` to real manifest names (or use `kubectl create secret` as documented in `config/README.md`).

## Prerequisites

1. Kubernetes cluster (Minikube / kind / k3d).
2. [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/deploy/) installed; IngressClass name `nginx`.
3. **metrics-server** (for HPA), e.g. `minikube addons enable metrics-server`.
4. Docker (or cluster-accessible registry) to build images `mini-twitter-backend:latest` and `mini-twitter-frontend:latest`.

## Build images

From the repository root:

```bash
docker build -t mini-twitter-backend:latest -f backend/Dockerfile backend
docker build -t mini-twitter-frontend:latest -f frontend/Dockerfile frontend
```

**Minikube** (load images into the cluster):

```bash
eval $(minikube docker-env)
docker build -t mini-twitter-backend:latest -f backend/Dockerfile backend
docker build -t mini-twitter-frontend:latest -f frontend/Dockerfile frontend
```

Set `imagePullPolicy: Never` on the Deployments if you rely on Minikube’s Docker daemon and images are not pushed to a registry.

**kind**:

```bash
kind load docker-image mini-twitter-backend:latest
kind load docker-image mini-twitter-frontend:latest
```

## Create secrets

Ensure `postgres-secret`, `rabbitmq-secret`, and `backend-secret` exist in namespace `mini-twitter`. See `k8s/config/README.md` for `kubectl create secret` examples.

If you use the example files:

```bash
kubectl apply -f k8s/namespace.yaml
cp k8s/database/postgres-secret.example.yaml k8s/database/postgres-secret.yaml
cp k8s/rabbitmq/rabbitmq-secret.example.yaml k8s/rabbitmq/rabbitmq-secret.yaml
cp k8s/backend/backend-secret.example.yaml k8s/backend/backend-secret.yaml
# Edit the three *-secret.yaml files, then:
kubectl apply -f k8s/database/postgres-secret.yaml
kubectl apply -f k8s/rabbitmq/rabbitmq-secret.yaml
kubectl apply -f k8s/backend/backend-secret.yaml
```

**Important**: `SPRING_DATASOURCE_URL` in `backend/backend-configmap.yaml` uses database name `minitwitter`. It must match the `database` key in `postgres-secret`.

## Apply workloads

```bash
kubectl apply -k k8s/
```

Or apply files individually in dependency order (namespace, secrets, database, redis, rabbitmq, backend config, backend, frontend, ingress).

## DNS / hosts

Point the Ingress hosts to your ingress controller IP:

```bash
kubectl get svc -n ingress-nginx ingress-nginx-controller
```

Add to `/etc/hosts` (example):

```text
<INGRESS_IP> mini-twitter.local
<INGRESS_IP> rabbitmq.local
```

Open `http://mini-twitter.local` for the SPA and API via `/api`.

## Optional RabbitMQ management Ingress

```bash
kubectl apply -f k8s/rabbitmq/rabbitmq-ingress-management.yaml
```

Browse `http://rabbitmq.local` (credentials from `rabbitmq-secret`).

## Troubleshooting

- **Pods pending PVC**: Ensure a default StorageClass exists (`kubectl get storageclass`).
- **HPA shows unknown**: Install/enable metrics-server; wait for metrics to populate.
- **502 from Ingress**: Wait for backend readiness; check `kubectl logs -n mini-twitter deploy/backend` and DB connectivity (`postgres` host, JDBC URL, credentials).
- **Actuator 404**: Ensure the image was rebuilt after adding `spring-boot-starter-actuator` and `application.yml` management settings.

## File layout

| Path | Purpose |
|------|---------|
| `namespace.yaml` | Namespace `mini-twitter` |
| `database/` | Postgres StatefulSet, Service, secret example |
| `redis/` | Redis Deployment + Service |
| `rabbitmq/` | RabbitMQ StatefulSet, Service, secret example, optional management Ingress |
| `backend/` | ConfigMap, Deployment, Service, HPA, JWT secret example |
| `frontend/` | Deployment + Service |
| `ingress/` | Main NGINX Ingress for `/` and `/api` |
| `config/README.md` | Secret creation snippets |
| `kustomization.yaml` | One-shot apply (excluding optional RabbitMQ UI ingress) |
