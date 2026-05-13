# Mini Twitter – Kubernetes manifests

Apply order: namespace, secrets (edit first), data stores, app services, ingress.

See repository root documentation or `../README.md` (if linked) for full run instructions.

## Secrets (required before apply)

Edit and apply secrets, or generate from the command line:

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

If you prefer checked-in templates, copy `database/postgres-secret.example.yaml` and `rabbitmq/rabbitmq-secret.example.yaml` and `backend/backend-secret.example.yaml` to non-example names, fill values, and `kubectl apply -f`.
