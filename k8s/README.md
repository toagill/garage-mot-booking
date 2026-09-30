# Kubernetes deployment

For a learning/demo cluster:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl get all -n garage-mot
```

For production on AWS EKS:
- replace local image names with ECR image URIs
- use Amazon RDS PostgreSQL instead of the in-cluster PostgreSQL deployment
- store secrets in AWS Secrets Manager / External Secrets
- expose the frontend using AWS Load Balancer Controller / Ingress
