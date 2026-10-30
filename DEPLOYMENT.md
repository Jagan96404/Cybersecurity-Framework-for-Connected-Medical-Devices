# MedSentinel CPS: Cloud Deployment Guide

This repository is pre-configured with automated deployment configurations for major cloud providers and continuous integration via GitHub Actions.

---

## 1. Automated GitHub Actions CI/CD

Every push to `main` automatically runs our CI/CD pipeline:
- **Backend Test**: Runs `pytest` on the Patient Safety Risk Engine and Anomaly Detector.
- **Frontend Build**: Compiles TypeScript and builds the production bundle with Vite.
- **Docker Validation**: Builds and verifies backend and frontend container images.

You can view live workflow runs under the **Actions** tab on your GitHub repository:
[https://github.com/Jagan96404/MedSentinel-/actions](https://github.com/Jagan96404/MedSentinel-/actions)

---

## 2. Option A: Free 1-Click Deploy on Render (Recommended)

Render uses the included `render.yaml` Blueprint to automatically deploy both the Python FastAPI backend and the React Vite frontend.

### Steps:
1. Log into [Render.com](https://render.com).
2. Click **New +** $\to$ **Blueprint**.
3. Connect your GitHub repository: `https://github.com/Jagan96404/MedSentinel-`.
4. Render will detect `render.yaml` and configure:
   - **medsentinel-backend**: Python web service with automatic seeding and live Swagger API docs.
   - **medsentinel-frontend**: Static site hosting the React command center.
5. Click **Apply**. Within 3 minutes, your live URL will be active!

---

## 3. Option B: 1-Click Deploy on Railway

1. Log into [Railway.app](https://railway.app).
2. Click **New Project** $\to$ **Deploy from GitHub Repo**.
3. Select `Jagan96404/MedSentinel-`.
4. Railway will automatically detect `railway.json` and `backend/Procfile` and deploy the service.

---

## 4. Option C: Frontend on Vercel + Backend on Render/Railway

1. Go to [Vercel.com](https://vercel.com) and click **Add New...** $\to$ **Project**.
2. Import `Jagan96404/MedSentinel-`.
3. Vercel automatically detects `vercel.json` and the Vite build.
4. Set the Root Directory to `./frontend` or keep the default with `vercel.json`.
5. Click **Deploy**.

---

## 5. Option D: Deploy on Any Linux VPS / Cloud VM (Docker Compose)

On any Ubuntu / Debian / CentOS cloud server (AWS EC2, DigitalOcean Droplet, GCP Compute, Hetzner):

```bash
# 1. Clone repository
git clone https://github.com/Jagan96404/MedSentinel-.git
cd MedSentinel-

# 2. Launch production stack with Docker Compose
docker compose up -d --build

# 3. Check container status
docker compose ps
```

The stack provisions:
- `medsentinel-frontend`: Nginx serving the React SPA on port `5173` (or port `80`).
- `medsentinel-backend`: FastAPI on port `8000`.
- `medsentinel-postgres`: PostgreSQL database with persistent volume storage.

