# AWS Secrets Manager setup

## 1. Create the secret

```bash
aws secretsmanager create-secret \
  --name garage-mot/dvla \
  --region eu-west-2 \
  --secret-string '{"DVLA_API_KEY":"YOUR_DVLA_API_KEY"}'
```

If the secret already exists:

```bash
aws secretsmanager put-secret-value \
  --secret-id garage-mot/dvla \
  --region eu-west-2 \
  --secret-string '{"DVLA_API_KEY":"YOUR_DVLA_API_KEY"}'
```

## 2. Create an IAM policy

Use `secrets-manager-policy.json`, replacing `YOUR_AWS_ACCOUNT_ID`.

## 3. Attach it to the EKS workload

Use EKS Pod Identity or IRSA so only the backend workload can read this secret.

## 4. Deploy

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/serviceaccount.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
```

The application does not need the DVLA key in a Kubernetes Secret. The backend obtains it directly from AWS Secrets Manager at runtime.
