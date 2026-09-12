# KERNEL Backend

KERNEL — Interactive Superhero Help Portal Backend

## Overview
Spring Boot backend for the KERNEL interactive superhero help portal. Provides REST APIs, WebSocket communication, AI-powered conversation, email notifications, and secure admin management.

## Requirements
- Java 21
- Maven 3.8+
- MongoDB Atlas account
- OpenAI API key
- Resend API key

## Tech Stack
- Spring Boot 3.2.5
- Spring Data MongoDB
- Spring Security (JWT)
- Spring WebSocket (STOMP)
- OpenAI API
- Resend API
- Bean Validation (Jakarta)
- Jackson

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| MONGODB_URI | ✅ | MongoDB Atlas connection string |
| OPENAI_API_KEY | ✅ | OpenAI API key |
| OPENAI_MODEL | ❌ | OpenAI model (default: gpt-4o) |
| RESEND_API_KEY | ✅ | Resend email API key |
| RESEND_FROM_EMAIL | ✅ | Sender email for Resend |
| ADMIN_PASSWORD | ✅ | Admin authentication password |
| JWT_SECRET | ❌ | JWT signing secret (auto-generated if not set) |
| FRONTEND_URL | ❌ | Frontend origin for CORS (default: http://localhost:3000) |
| BACKEND_URL | ❌ | Backend public URL (default: http://localhost:8080) |
| PORT | ❌ | Server port (default: 8080) |

Copy `.env.example` to `.env` and fill in your values. The app will FAIL to start if required variables are missing.

## Quick Start
```bash
# Clone and navigate
cd backend

# Copy environment config
cp ../.env.example ../.env
# Edit ../.env with your credentials

# Build
mvn clean package -DskipTests

# Run
java -jar target/kernel-backend-1.0.0.jar

# Or run with Maven
mvn spring-boot:run
```

Note: To load .env file automatically during development, you can export the variables or use a tool like `direnv`.

## MongoDB Setup
1. Create a MongoDB Atlas cluster
2. Create a database named `kernel`
3. Set `MONGODB_URI` with your connection string
4. Collections are auto-created on first use
5. Only ONE collection is used: `grievances`

## API Overview

See [API.md](API.md) for the full integration contract.

### Public Endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/health | Health check |
| POST | /api/conversations | Start AI conversation |
| POST | /api/conversations/{id}/messages | Send message |
| GET | /api/conversations/{id} | Get session info |
| POST | /api/grievances | Submit grievance |

### Admin Endpoints (JWT required)
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/admin/login | Authenticate |
| GET | /api/admin/grievances | List grievances |
| GET | /api/admin/grievances/{id} | Get detail |
| PATCH | /api/admin/grievances/{id}/status | Update status |
| POST | /api/admin/grievances/{id}/communication/enable | Enable chat |
| POST | /api/admin/grievances/{id}/communication/close | Close chat |

### WebSocket
| Endpoint | Description |
|---|---|
| /ws/communication | STOMP WebSocket for private chat |

## Security Notes
- Admin password verified server-side with constant-time comparison
- JWT tokens for admin session management
- Communication tokens are cryptographically secure random (SecureRandom, 32 bytes hex)
- Tokens are time-limited and revocable
- CORS restricted to configured frontend URL
- No credentials in source code

## Ephemeral Private Chat
**CRITICAL**: Private communication messages are NEVER stored in MongoDB. They exist only in server memory during an active session.

- When admin enables communication, secure tokens are generated
- Visitor receives email with secure link
- Messages are routed via WebSocket in real-time
- No message history is persisted anywhere
- On session close/expiry, all data is purged from memory
- Server restart = conversation lost (by design)

## Deployment (Azure App Service)
1. Build: `mvn clean package -DskipTests`
2. Deploy the JAR: `target/kernel-backend-1.0.0.jar`
3. Set environment variables in Azure App Service Configuration
4. Runtime: Java 21
5. The app is stateless for persistent data (MongoDB Atlas is external)
6. Only ephemeral communication sessions are held in memory

## Testing
```bash
mvn test
```

Tests cover: DTO validation, service logic, security, admin auth, communication lifecycle, privacy guarantees (chat messages not persisted), and AI response parsing.

## API Documentation (Swagger)
When running locally: http://localhost:8080/api/swagger-ui
