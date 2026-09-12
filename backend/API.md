# KERNEL Backend — API Integration Contract

Base URL: `http://localhost:8080` (dev) or configured `BACKEND_URL` (production)

All request/response bodies are JSON. All timestamps are ISO 8601 UTC.

## Authentication
Admin endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```
Obtain the token via `POST /api/admin/login`.

Public endpoints do not require authentication.

---

## Health

### GET /api/health
Returns server health status.
- Auth: None
- Response 200:
```json
{
  "status": "UP",
  "timestamp": "2026-09-12T08:00:00Z"
}
```

---

## Conversations (AI Chat)

### POST /api/conversations
Start a new AI conversation session.
- Auth: None
- Request:
```json
{
  "language": "en"
}
```
Supported languages: en, ml, hi, ta, te, kn, bn, mr, es, fr, de, ar
- Response 201:
```json
{
  "sessionId": "a1b2c3d4...",
  "message": "Session started",
  "readyToSubmit": false,
  "analysisResult": null
}
```

### POST /api/conversations/{sessionId}/messages
Send a message in the conversation.
- Auth: None
- Path: sessionId (from POST /api/conversations response)
- Request:
```json
{
  "message": "I need help with..."
}
```
- Response 200 (conversation ongoing):
```json
{
  "sessionId": "a1b2c3d4...",
  "message": "Can you tell me more about...?",
  "readyToSubmit": false,
  "analysisResult": null
}
```
- Response 200 (ready to submit):
```json
{
  "sessionId": "a1b2c3d4...",
  "message": "I understand your issue. Let me submit this for you.",
  "readyToSubmit": true,
  "analysisResult": {
    "readyToSubmit": true,
    "category": "TECHNICAL",
    "urgency": "HIGH",
    "summary": "User reports network outage in their area...",
    "followUpQuestion": null
  }
}
```
- Error 410: Session expired

### GET /api/conversations/{sessionId}
Get current session info (does NOT return conversation history for privacy).
- Auth: None
- Response 200:
```json
{
  "sessionId": "a1b2c3d4...",
  "message": null,
  "readyToSubmit": false,
  "analysisResult": null
}
```

---

## Grievances

### POST /api/grievances
Submit a completed grievance.
- Auth: None
- Request:
```json
{
  "sessionId": "a1b2c3d4...",
  "name": "John Doe",
  "age": 28,
  "location": "New York",
  "email": "john@example.com",
  "language": "en",
  "grievance": "I've been experiencing ongoing power outages in my neighborhood for the past week..."
}
```
- Validation rules:
  - name: required, 2-100 chars
  - age: required, 1-150
  - location: required, max 200 chars
  - email: required, valid email, max 254 chars
  - language: required, 2-5 chars
  - grievance: required, 10-10000 chars
  - sessionId: required
- Response 201:
```json
{
  "id": "64f...",
  "status": "NEW",
  "message": "Your grievance has been submitted successfully. KERNEL is on it!",
  "createdAt": "2026-09-12T08:00:00Z"
}
```
- Error 400: Validation errors

---

## Admin Authentication

### POST /api/admin/login
Authenticate as admin.
- Auth: None
- Request:
```json
{
  "password": "your-admin-password"
}
```
- Response 200:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "expiresAt": "2026-09-13T08:00:00Z"
}
```
- Error 401: Invalid credentials

---

## Admin Grievance Management

### GET /api/admin/grievances
List all grievances with pagination, filtering, and sorting.
- Auth: Bearer token
- Query params:
  - `page` (default: 0)
  - `size` (default: 20)
  - `sortBy` (default: createdAt)
  - `sortDir` (default: desc, accepts: asc/desc)
  - `status` (filter: NEW, REVIEWING, RESOLVED, CLOSED)
  - `category` (filter: GENERAL, PERSONAL, EMERGENCY, TECHNICAL, COMMUNITY, OTHER)
  - `urgency` (filter: LOW, MEDIUM, HIGH, CRITICAL)
  - `search` (search in name, email, grievance text)
- Response 200:
```json
{
  "content": [
    {
      "id": "64f...",
      "name": "John Doe",
      "age": 28,
      "location": "New York",
      "email": "john@example.com",
      "language": "en",
      "category": "TECHNICAL",
      "urgency": "HIGH",
      "originalGrievance": "Full original text...",
      "aiSummary": "AI generated summary...",
      "status": "NEW",
      "createdAt": "2026-09-12T08:00:00Z",
      "updatedAt": "2026-09-12T08:00:00Z",
      "communicationStatus": "DISABLED",
      "communicationEnabledAt": null,
      "communicationClosedAt": null
    }
  ],
  "pageable": { ... },
  "totalElements": 42,
  "totalPages": 3,
  "number": 0,
  "size": 20
}
```

### GET /api/admin/grievances/{id}
Get full grievance details.
- Auth: Bearer token
- Response 200: Same object as above (single grievance)
- Error 404: Grievance not found

### PATCH /api/admin/grievances/{id}/status
Update grievance status.
- Auth: Bearer token
- Request:
```json
{
  "status": "REVIEWING"
}
```
Valid statuses: NEW, REVIEWING, RESOLVED, CLOSED
- Response 200: Updated AdminGrievanceResponse
- Error 404: Not found

---

## Secure Communication

### POST /api/admin/grievances/{id}/communication/enable
Enable private communication channel for a grievance. Sends email to visitor with secure link.
- Auth: Bearer token
- Response 200:
```json
{
  "visitorToken": "abc123...",
  "visitorLink": "http://localhost:8080/communicate?token=abc123...",
  "adminToken": "def456...",
  "expiresAt": "2026-09-12T09:00:00Z"
}
```
- Error 409: Communication already active
- Error 404: Grievance not found

### POST /api/admin/grievances/{id}/communication/close
Close communication channel. Purges ephemeral session.
- Auth: Bearer token
- Response 204: No Content
- Error 404: Grievance not found

---

## WebSocket — Private Communication

Endpoint: `ws://localhost:8080/ws/communication?token=<token>`
Protocol: STOMP over WebSocket (with SockJS fallback)

### Connection
1. Admin uses `adminToken` from enable response
2. Visitor uses `visitorToken` from email link
3. Connect to `/ws/communication` with `?token=<token>` query parameter
4. Subscribe to `/topic/communication/<sessionId>`

The `sessionId` is the communication session ID (put into WebSocket session attributes during handshake).

### Sending Messages
Destination: `/app/communication.send`
```json
{
  "type": "MESSAGE",
  "content": "Hello from visitor"
}
```
The server sets `sender` (ADMIN/VISITOR) and `timestamp` automatically.

### Receiving Messages
Subscribe: `/topic/communication/{sessionId}`
```json
{
  "type": "MESSAGE",
  "sender": "VISITOR",
  "content": "Hello from visitor",
  "timestamp": "2026-09-12T08:30:00Z"
}
```

### Message Types
- `JOIN` — participant joined
- `LEAVE` — participant left
- `MESSAGE` — chat message

### Sender Roles
- `ADMIN`
- `VISITOR`

### Privacy
- Messages are NEVER stored in any database
- Messages exist only in transit via WebSocket
- Session expiry purges all in-memory data
- Server restart = conversation lost (by design)

---

## Error Responses

All errors follow this format:
```json
{
  "timestamp": "2026-09-12T08:00:00Z",
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": {
    "email": "must be a well-formed email address",
    "name": "must not be blank"
  }
}
```

### Error Codes
| Status | Error Code | Description |
|---|---|---|
| 400 | VALIDATION_ERROR | Request validation failed |
| 400 | MALFORMED_REQUEST | Unreadable request body |
| 400 | BAD_REQUEST | Invalid argument |
| 401 | UNAUTHORIZED | Missing or invalid auth |
| 401 | INVALID_TOKEN | Invalid communication token |
| 404 | NOT_FOUND | Resource not found |
| 409 | COMMUNICATION_NOT_ENABLED | Communication not available |
| 410 | SESSION_EXPIRED | Session has expired |
| 500 | INTERNAL_ERROR | Unexpected server error |

---

## Enums Reference

### Category
GENERAL, PERSONAL, EMERGENCY, TECHNICAL, COMMUNITY, OTHER

### Urgency
LOW, MEDIUM, HIGH, CRITICAL

### GrievanceStatus
NEW, REVIEWING, RESOLVED, CLOSED

### CommunicationStatus
DISABLED, ACTIVE, CLOSED, EXPIRED

---

## CORS
The backend allows requests from the configured `FRONTEND_URL`. For local development, this defaults to `http://localhost:3000`.

## Swagger/OpenAPI
Available at:
- Swagger UI: `/api/swagger-ui`
- OpenAPI spec: `/api/docs`
