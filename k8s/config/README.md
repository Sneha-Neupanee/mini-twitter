# Mini Twitter – Kubernetes config notes

Apply order: namespace, secrets, data stores, app workloads, ingress. `kubectl apply -k ../` from the `k8s/` directory applies the full stack in a safe order.

## Secrets

**Local default:** The repo includes `../database/postgres-secret.yaml`, `../rabbitmq/rabbitmq-secret.yaml`, and `../backend/backend-secret.yaml` with disposable dev values so `backend` pods do not hit `CreateContainerConfigError`. Rotate these for any shared or production environment.

**Production:** Replace with your secret manager, Sealed Secrets, External Secrets Operator, or imperative apply, for example:

```bash
kubectl create namespace mini-twitter --dry-run=client -o yaml | kubectl apply -f -

kubectl -n mini-twitter create secret generic postgres-secret \
  --from-literal=username=postgres \
  --from-literal=password='YOUR_DB_PASSWORD' \
  --from-literal=database=minitwitter \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl -n mini-twitter create secret generic rabbitmq-secret \
  --from-literal=username=guest \
  --from-literal=password='YOUR_RABBIT_PASSWORD' \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl -n mini-twitter create secret generic backend-secret \
  --from-literal=jwt-secret='YOUR_JWT_SECRET_HEX_OR_BASE64' \
  --dry-run=client -o yaml | kubectl apply -f -
```

The `*.example.yaml` files under `database/`, `rabbitmq/`, and `backend/` are optional templates.

**Backend wiring:** `backend-deployment.yaml` expects these exact names and keys:

| Secret            | Keys                                      |
|-------------------|-------------------------------------------|
| `postgres-secret` | `username`, `password`, `database`        |
| `rabbitmq-secret` | `username`, `password`                    |
| `backend-secret`  | `jwt-secret` (injected as env `JWT_SECRET`) |

Ensure `database` in `postgres-secret` matches `SPRING_DATASOURCE_URL` in `backend/backend-configmap.yaml` (default `minitwitter`).
