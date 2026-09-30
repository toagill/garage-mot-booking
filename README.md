# Garage MOT Booking

A realistic three-tier UK garage/MOT booking application.

## Architecture
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL
- Local deployment: Docker Compose
- Cloud-ready: containers can later be pushed to ECR and deployed to EKS

## Features
- Vehicle registration lookup (mock provider by default)
- MOT/service catalogue
- Available appointment slots
- Customer booking flow
- Booking persistence in PostgreSQL
- Garage admin booking list
- Health endpoints

## Quick start
```bash
docker compose up --build
```

Frontend: http://localhost:5173  
API: http://localhost:4000  
PostgreSQL: localhost:5432

## Vehicle API integration
The backend uses a provider abstraction. By default it returns realistic mock data so the project runs without credentials.
Set `VEHICLE_API_MODE=dvla` and add your DVLA API key when you are ready to connect a live provider.

## Project structure
```
frontend/
backend/
database/
docker-compose.yml
```
