# Garage MOT Booking

A realistic three-tier UK Garage/MOT booking application.

## Architecture
- Frontend: React + Vite + Nginx
- Backend: Node.js + Express
- Database: PostgreSQL
- Vehicle data: DVLA Vehicle Enquiry Service
- Secrets: AWS Secrets Manager in AWS/EKS
- Local deployment: Docker Compose
- Cloud-ready: ECR + EKS + RDS

## Features
- Live DVLA vehicle registration lookup
- MOT status and expiry
- Road-tax status and due date
- Engine, fuel, colour, CO2 and registration information
- MOT/service catalogue
- Available appointment slots
- Customer booking flow
- Booking persistence in PostgreSQL
- Garage admin booking API
- Health endpoints

## Local quick start

Create a local `.env` file from `.env.example`. Never commit the real key.

```bash
cp .env.example .env
docker compose up --build
```

Frontend: http://localhost:5173  
API: http://localhost:4000  
PostgreSQL: localhost:5432

Test:

```bash
curl http://localhost:4000/api/vehicle/OW08FBE
```

## AWS Secrets Manager

The backend first checks `DVLA_API_KEY` for local development. If it is absent, it loads the key from AWS Secrets Manager using `AWS_SECRET_NAME`.

Create the secret:

```bash
aws secretsmanager create-secret \
  --name garage-mot/dvla \
  --region eu-west-2 \
  --secret-string '{"DVLA_API_KEY":"YOUR_DVLA_API_KEY"}'
```

Do not put the real key in GitHub, Kubernetes YAML, Docker images, or Jenkinsfiles.

For EKS, give the backend service account an IAM role (IRSA / EKS Pod Identity) with permission to call `secretsmanager:GetSecretValue` on the specific secret. See `infra/secrets-manager-policy.json` and `k8s/serviceaccount.yaml`.

## Project structure

```
frontend/
backend/
database/
infra/
k8s/
docker-compose.yml
Jenkinsfile
```
