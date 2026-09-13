# ⚡ KERNEL — Interactive Superhero Grievance & Help Portal

> **"Whenever there is injustice, a call for help, or a glitch in humanity's fabric — Theo is listening."**

[![Frontend: React + Vite](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%20%7C%20TailwindCSS-61DAFB?logo=react&logoColor=black)](https://kernel47.vercel.app/)
[![Backend: Spring Boot 3](https://img.shields.io/badge/Backend-Spring%20Boot%203.2%20%7C%20Java%2021-6DB33F?logo=springboot&logoColor=white)](https://kernel-backend-api-a8fmcze0ezfdg7au.centralindia-01.azurewebsites.net/api/health)
[![Database: MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](#)
[![AI: Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini%20Flash-4285F4?logo=google&logoColor=white)](#)
[![Deployment: Vercel & Azure](https://img.shields.io/badge/Deploy-Vercel%20%2B%20Azure%20App%20Service-0078D4?logo=microsoftazure&logoColor=white)](#)

---

## 🌟 Live Demo & Deployments
- **Production Frontend:** [https://kernel47.vercel.app](https://kernel47.vercel.app)
- **Production Backend API:** `https://kernel-backend-api-a8fmcze0ezfdg7au.centralindia-01.azurewebsites.net`
- **Health Check Endpoint:** `https://kernel-backend-api-a8fmcze0ezfdg7au.centralindia-01.azurewebsites.net/api/health`

---

## 📖 Table of Contents
- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Configuration & Environment Variables](#-configuration--environment-variables)
- [API Endpoints](#-api-endpoints)
- [Security & Privacy Standards](#-security--privacy-standards)
- [License](#-license)

---

## 🚀 Project Overview

**KERNEL** is a high-tech, cinematic interactive web portal and emergency response platform created for **Theo (codename: KERNEL)**, a tech-augmented superhero dedicated to resolving civilian grievances and defending humanity. 

The application combines cutting-edge web design, real-time multimodal AI analysis (Google Gemini), high-contrast accessibility, audio synthesizers, voice recording, live 1-to-1 administrative communication, and military-grade encryption to provide an immersive superhero experience.

---

## ✨ Key Features

### 1. 🎬 Cinematic Hero Introduction
- When the application loads, users are greeted with a full-screen, high-impact video sequence showing **KERNEL** walking purposefully toward the camera with atmospheric particle effects and futuristic HUD overlays.

### 2. 💬 Interactive Chatbox
- An empathetic, emotionally intelligent, conversational interface powered by **Google Gemini AI**. Theo actively listens, clarifies the context of grievances without judgment or prejudice, and provides comforting, human dialogue.

### 3. 📝 Grievance Submission Portal
- Citizens can submit detailed grievances, emergency reports, or assistance requests with structured metadata, automatic priority classification (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), and category grouping (`GENERAL`, `PERSONAL`, `EMERGENCY`, `TECHNICAL`, `COMMUNITY`, `OTHER`).

### 4. ⚡ Origin Story
- A dedicated narrative experience delving into Theo's transformation into KERNEL—how an ordinary individual gained transcendent computational intuition and bio-digital enhancements to protect society.

### 5. 🦹 Arch-Nemesis Lore
- Discover the dossier and story behind KERNEL’s notorious arch-nemesis, exploring their ideological clash, past battles, and the existential threat posed to the city.

### 6. 🔐 Secret Root Access (Command Center Ingress)
- An encrypted backdoor sequence allowing Theo and authorized personnel to unlock the hidden **KERNEL Command Center**:
  - **Desktop / Laptop Access:**
    1. **Triple-Click** rapidly anywhere on the screen (3 clicks within 2.5s) to activate resonance detection.
    2. Type the secret key sequence **`SHIFT + K - E - R - N - E - L`** while holding `Shift`.
  - **Mobile / Tablet Access:**
    1. **Triple-Tap** rapidly anywhere on the screen.
    2. Perform a deliberate **Swipe Down** gesture.
  - **Core Ingress:** A cinematic holographic **`ROOT ACCESS`** overlay will materialize on screen. Clicking **`[ ACCESS CORE ]`** grants entry into the administrative portal (`/admin`).

### 7. 🛡️ Grievance Management / Command Center
- Full-featured administrative dashboard:
  - **Live Filter & Search:** Search across cases by submitter name, email, tracking ID, category, or urgency.
  - **Status Workflows:** Move cases across `SUBMITTED`, `IN_REVIEW`, `RESOLVED`, and `CLOSED`.
  - **Analytics & Triage:** Real-time stats, urgency badges, and quick-dispatch actions.

### 8. 🔴 Private 1-to-1 Live Chat
- Direct real-time bidirectional communication channel between Theo (Command Center) and the citizen for active investigations, follow-ups, and live emergency coordination.

### 9. 📧 Automated Email Notifications
- Instant high-contrast HTML email confirmations and progress alerts dispatched directly to the citizen's inbox upon submission, status change, or admin replies via Gmail SMTP integration.

### 10. 🔒 Security & Privacy by Design
- **Privacy-First Architecture:** Pre-submission exploratory chat sessions are ephemeral and strictly not persisted until user confirmation.
- **JWT Authentication & RBAC:** Secure token-based authentication protecting admin endpoints.
- **Data Protection:** Sanitized user inputs, SQL injection protection, and encrypted communications.

### 11. 🌗 Dark & Light Mode
- Immersive high-contrast cyber dark mode (default) paired with an accessible, high-visibility light theme toggled with persistent user preference.

### 12. 🌍 Multilingual Support
- Native onboarding, voice synthesis, and chat interactions available in **10 major languages**:
  - English (`en`), Spanish (`es`), French (`fr`), German (`de`), Japanese (`ja`), Hindi (`hi`), Malayalam (`ml`), Arabic (`ar`), Portuguese (`pt`), Russian (`ru`).

### 13. 🎙️ Voice Grievance Recording
- Built-in audio recorder that allows users to record and submit spoken voice notes directly from their browser, complete with interactive waveforms, playback controls, and speech synthesis.

---

## 🏗️ System Architecture

```mermaid
graph TD
    User([Citizen / User]) <-->|HTTPS / REST / WebSocket| Frontend[React + Vite Frontend\nTailwindCSS + Lucide + Howler]
    Admin([Theo / HQ Admin]) <-->|Authenticated JWT Dashboard| Frontend
    
    Frontend <-->|REST API| Backend[Spring Boot 3 API Gateway\nSecurity + MongoDB + Validation]
    
    Backend <-->|AI Conversational Analysis| Gemini[Google Gemini LLM]
    Backend <-->|Notification Dispatch| SMTP[Gmail SMTP Service]
    Backend <-->|Document Persistence| Database[(MongoDB Database)]
```

---

## 💻 Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Bundler & Build Tool:** Vite
- **Styling:** TailwindCSS, Custom Futuristic Cyberpunk Theme, Glassmorphism
- **Icons & Visuals:** Lucide React, Custom SVG HUD overlays
- **Audio & Media:** Web Audio API, Canvas Waveform Visualizer, SpeechSynthesis API

### Backend
- **Framework:** Spring Boot 3.2.5 (Java 21)
- **Security:** Spring Security, JWT (JSON Web Tokens), BCrypt password hashing
- **Persistence:** Spring Data MongoDB
- **Database:** MongoDB (Atlas / Azure Cosmos DB / Local MongoDB)
- **AI Integration:** Google Gemini API (`gemini-1.5-flash`)
- **Email:** Spring Boot Starter Mail (Gmail SMTP TLS/SSL)
- **Testing:** JUnit 5, Mockito, AssertJ (52 passing automated tests)

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher & `npm`
- **Java JDK**: Version 17 or 21
- **Maven**: Version 3.8+
- **MongoDB**: MongoDB Atlas URI or local MongoDB instance (`mongodb://localhost:27017/kernel`)

---

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Configure Environment Variables:**
   Create an `application-local.yml` or set environment variables:
   ```bash
   export KERNEL_ADMIN_PASSWORD="your-secure-admin-password"
   export KERNEL_JWT_SECRET="your-256-bit-secret-key-goes-here"
   export GEMINI_API_KEY="your-gemini-api-key"
   export GMAIL_USERNAME="your-email@gmail.com"
   export GMAIL_APP_PASSWORD="your-gmail-app-password"
   ```

3. **Build & Run Tests:**
   ```bash
   mvn clean test
   ```

4. **Start the Backend Server:**
   ```bash
   mvn spring-boot:run
   ```
   The backend will start at `http://localhost:8080`.

---

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:8080
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` or `http://localhost:5173` in your browser.

5. **Build for Production:**
   ```bash
   npm run build
   ```

---

## ⚙️ Configuration & Environment Variables

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `SERVER_PORT` | Port for Spring Boot | `8080` |
| `MONGODB_URI` | MongoDB Connection URI (Atlas / Cosmos DB / Local) | `mongodb+srv://user:pass@cluster.mongodb.net/kernel` |
| `ADMIN_PASSWORD` | Secure root password for Admin Command Center | `kernelctygz` |
| `JWT_SECRET` | Secret key for JWT signing | 256-bit HS256 String |
| `GEMINI_API_KEY` | Google Gemini API key for conversational AI | Gemini Flash API key |
| `GMAIL_USERNAME` | Gmail SMTP sender address | `notifications@gmail.com` |
| `GMAIL_APP_PASSWORD` | Gmail App Password (16 chars) | `xxxx xxxx xxxx xxxx` |
| `VITE_API_URL` | Base API URL consumed by React client | `https://kernel-backend-api-...` |

---

## 📡 API Endpoints

### Public Endpoints
- `GET /api/health` — Health check status and uptime
- `POST /api/chat` — Conversational interaction with Gemini AI
- `POST /api/grievances` — Submit a grievance with citizen details and classification
- `GET /api/grievances/track/{trackingId}` — Track grievance status and live chat

### Administrative Endpoints (JWT Protected)
- `POST /api/admin/login` — Authenticate and receive JWT token
- `GET /api/admin/grievances` — Fetch all grievances with filters, pagination, and sorting
- `GET /api/admin/grievances/{id}` — Fetch complete dossier and conversation logs
- `PATCH /api/admin/grievances/{id}/status` — Update grievance lifecycle state
- `POST /api/admin/grievances/{id}/messages` — Send direct 1-to-1 message to citizen

---

## 🛡️ Security & Privacy Standards

- **Zero-Logging Before Confirmation:** Pre-submission conversations are processed in-memory for session understanding and discarded if unconfirmed.
- **Role-Based Access Control:** Strict authorization barrier on all triage and command center capabilities.
- **Email Redaction & Data Sanitization:** Strict validation on all incoming payload schemas preventing script injection and header manipulation.
- **Cross-Origin Resource Sharing (CORS):** Strict domain origin rules enabled for production origins.

---

## 📄 License
This project is open-source and distributed under the **MIT License**.

---
*Built with ❤️ for humanity by the KERNEL Operations Team.*
