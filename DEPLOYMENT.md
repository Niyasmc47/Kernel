# 🚀 KERNEL Production Deployment Guide (Vercel + Azure)

This guide walks through deploying the **Frontend to Vercel** and the **Backend to Microsoft Azure App Service (Free Student Plan)**.

---

## 📋 Architecture Overview
- **Frontend**: React 18 + Vite + Tailwind CSS + Framer Motion (Hosted on **Vercel Edge Global CDN**)
- **Backend**: Spring Boot 3.2.5 + Java 21 + MongoDB Atlas + Google Gemini LLM + Gmail SMTP (Hosted on **Microsoft Azure App Service**)

---

## 1️⃣ Deploying Backend to Microsoft Azure (Student Plan)

Azure offers free App Service compute for students on Linux / Java 21.

### Option A: Deploy via Azure Portal (Simplest)
1. **Log in to Azure Portal:** Go to [portal.azure.com](https://portal.azure.com) with your student account.
2. **Create Web App:**
   - Click **Create a resource** → **Web App**.
   - **Name**: e.g., `kernel-backend-api` (URL will be `https://kernel-backend-api.azurewebsites.net`).
   - **Publish**: `Code` (or `Docker Container`).
   - **Runtime stack**: `Java 21`.
   - **Java web server stack**: `Java SE (Embedded Web Server)`.
   - **Operating System**: `Linux`.
   - **Pricing Plan**: `Free F1` or `Basic B1` (Available on Azure for Students).
3. **Configure Environment Variables (Application Settings):**
   - In your newly created App Service, navigate to **Settings** → **Environment variables** (or **Configuration** → **Application settings**).
   - Add the following keys:
     | Setting Name | Value | Description |
     | :--- | :--- | :--- |
     | `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
     | `GEMINI_API_KEY` | `AIzaSy...` | Free API key from Google AI Studio |
     | `GEMINI_MODEL` | `gemini-1.5-flash` | Gemini model name |
     | `ADMIN_PASSWORD` | `your-secret-password` | Passcode to login to `/admin` Command Center |
     | `JWT_SECRET` | `long-random-string-min-32-chars` | Signing key for JWT tokens |
     | `GMAIL_USERNAME` | `niyas36et@gmail.com` | Email address to receive superhero voice notes |
     | `GMAIL_APP_PASSWORD` | `your-16-char-app-pw` | Google Account App Password |
     | `FRONTEND_URL` | `https://<your-app>.vercel.app` | Your Vercel frontend URL |
     | `CORS_ALLOWED_ORIGINS` | `https://*.vercel.app,http://localhost:3000` | Allowed origins pattern for CORS |
     | `PORT` | `8080` | Server port |
4. **Deploy the Code / JAR:**
   - **Via GitHub Deployment:** Go to **Deployment Center** → Source: **GitHub** → select repository `Kernel` → branch `main` → Build: Maven / Java 21.
   - **Or via Maven Azure Plugin / CLI:**
     ```bash
     cd backend
     mvn clean package -DskipTests
     az webapp deploy --resource-group <your-rg> --name <your-app-name> --src-path target/kernel-backend-1.0.0.jar --type jar
     ```

### Option B: Deploy via Docker Container
- You can build the container with the included [`Dockerfile`](file:///home/niyas/Projects/Internships/Kernel/backend/Dockerfile) and push to Azure Container Registry (ACR) or Docker Hub, then select **Docker Container** in Azure App Service.

---

## 2️⃣ Deploying Frontend to Vercel

1. **Log in to Vercel:** Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. **Import Git Repository:**
   - Click **Add New...** → **Project**.
   - Select your repository `Kernel`.
3. **Configure Project Settings:**
   - **Framework Preset**: `Vite` (auto-detected).
   - **Root Directory**: Click `Edit` and select `frontend`.
   - **Build Command**: `npm run build` (auto-detected).
   - **Output Directory**: `dist` (auto-detected).
4. **Set Environment Variables:**
   - Under **Environment Variables**, add:
     - `VITE_API_BASE_URL` = `https://<your-backend-app-name>.azurewebsites.net` (Your live Azure backend URL).
5. **Click Deploy!**
   - Vercel will build and assign you a global domain: `https://<your-project>.vercel.app`.

---

## 3️⃣ Verification Checklist

After deploying both:
- [ ] Visit `https://<your-backend>.azurewebsites.net/api/health` -> Should return status `UP`.
- [ ] Visit `https://<your-app>.vercel.app` -> Test the full flow:
  - Background audio ambience & tactile typing sounds.
  - Conversational grievance intake (Name, Age, Location, Email).
  - Voice note recording and transmission to `niyas36et@gmail.com`.
  - Admin login at `https://<your-app>.vercel.app/admin` using your configured `ADMIN_PASSWORD`.
  - Playback of voice recordings and signal filters in the Command Center.

