# API Gateway

A simple microservices architecture with an API gateway, authentication service, and audit logging. Built to brush up on Nodejs + Typescript and learn how services talk to each other.

**This is still a work in progress**

## What's Inside

**gateway** — The front door. Routes requests to the right service and checks that you're logged in.

**auth-service** — Handles user registration and login. Issues JWTs so the gateway knows who you are.

**audit-service** — Quietly records what everyone is doing. Listens to RabbitMQ and saves events to MongoDB.

**mock-protected-service** — A fake protected endpoint. Shows how other services would sit behind the gateway.

**shared** — Shared utilities that everyone uses.

## Getting Started

### Prerequisites
- Docker
- MongoDB running

### Environment variables

Set these in your `.env` file:

```bash
DATABASE_URL=your-mongodb-connection-string
RABBITMQ_URL=amqp://rabbitmq:5672
JWT_SECRET=your-secret
GATEWAY_PORT=3000
AUTH_PORT=3001
PROTECTED_PORT=3002
AUTH_SERVICE_URL=http://auth-service:3001
PROTECTED_SERVICE_URL=http://protected-service:3002
```

## Run the stack

```bash
docker compose up --build
```

## How It Works

1. **Sign up** → `POST v1/auth/register` with `{ username, email, password }`
2. **Log in** → `POST v1/auth/login` with credentials, get back a JWT token
3. **Use it** → Include the token as `Authorization: Bearer <token>` in requests to protected endpoints
4. **Audit logs** → Every login/registration gets logged to MongoDB asynchronously via RabbitMQ

## Useful Endpoints

- `POST v1/api/auth/register` — Create an account
- `POST v1/api/auth/login` — Get a token
- `GET v1/api/protected/` — Protected route (requires token)
