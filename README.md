# API Gateway

A simple microservices architecture with an API gateway, authentication service, and audit logging. Built to brush up on Nodejs + Typescript and learn how services talk to each other.

**This is still a work in progress**

## What's Inside

**gateway** — The front door. Routes requests to the right service and checks that you're logged in.

**auth-service** — Handles user registration and login. Issues JWTs so the gateway knows who you are.

**audit-service** — Quietly records what everyone is doing. Listens to RabbitMQ and saves events to MongoDB.

**mock-protected-service** — A fake protected endpoint. Shows how other services would sit behind the gateway.

**shared** — Shared types that everyone uses.

## Getting Started

### Prerequisites
- Node 18+
- MongoDB running
- RabbitMQ running (for audit logging)

### Setup

Install dependencies in each service:
```bash
cd auth-service && npm install
cd ../gateway && npm install
cd ../audit-service && npm install
cd ../mock-protected-service && npm install
```

### Run Everything

Start each service in its own terminal:

```bash
# Terminal 1: Auth service
cd auth-service && npm run dev

# Terminal 2: Gateway
cd gateway && npm run dev

# Terminal 3: Audit service
cd audit-service && npm run dev

# Terminal 4: Mock protected service
cd mock-protected-service && npm run dev
```

## How It Works

1. **Sign up** → `POST /auth/register` with `{ username, email, password }`
2. **Log in** → `POST /auth/login` with credentials, get back a JWT token
3. **Use it** → Include the token as `Authorization: Bearer <token>` in requests to protected endpoints
4. **Audit logs** → Every login/registration gets logged to MongoDB asynchronously via RabbitMQ

## Useful Endpoints

- `POST /api/auth/register` — Create an account
- `POST /api/auth/login` — Get a token
- `GET /api/protected/` — Protected route (requires token)

## Environment Variables

Create `.env` files in each service:

**auth-service/.env:**
```
PORT=???
DATABASE_URL=?????
RABBITMQ_URL=?????
JWT_SECRET=y?????
```

**gateway/.env:**
```
PORT=3000
AUTH_SERVICE_URL=????
PROTECTED_SERVICE_URL=????
JWT_SECRET=????
RABBITMQ_URL=????
```

**audit-service/.env:**
```
DATABASE_URL=????
RABBITMQ_URL=????
```

**mock-protected-service/.env:**
```
PORT=????
```
