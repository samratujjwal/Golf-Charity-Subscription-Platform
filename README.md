# Golf Charity Subscription Platform

Production-ready full-stack foundation for a SaaS golf charity subscription platform using React, Vite, TanStack Router, Tailwind CSS, Axios, Node.js, Express.js, and MongoDB with Mongoose.

## Project Structure

```text
ROOT/
├── client/
├── server/
├── .env.example
├── README.md
```

## Install

```bash
cd server
npm install

cd ../client
npm install
```

## Environment Setup

Copy the root `.env.example` values into:

- `server/.env`
- `client/.env`

Recommended values:

```env
MONGO_URI=mongodb://127.0.0.1:27017/golf-charity-platform
PORT=5000
CLIENT_URL=http://localhost:5173
ACCESS_TOKEN_SECRET=replace-with-a-secure-random-access-secret
REFRESH_TOKEN_SECRET=replace-with-a-secure-random-refresh-secret
VITE_API_URL=http://localhost:5000/api/v1
```

## Run The Backend

```bash
cd server
npm run dev
```

Backend runs on `http://localhost:5000`.

## Run The Frontend

```bash
cd client
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Verification

1. Start MongoDB locally.
2. Run the backend on port `5000`.
3. Run the frontend on port `5173`.
4. Open `http://localhost:5173`.
5. The homepage will call `GET /api/v1/health` and display `API is running`.

## Available Backend Routes

- `GET /api/v1/health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/me`

## Seed Data

Run the MongoDB seed script:

```bash
cd server
npm run seed
```

## Example API Usage

```bash
# Create a subscription
curl -X POST http://localhost:5000/api/v1/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_OBJECT_ID",
    "plan": "monthly",
    "status": "active",
    "startDate": "2026-03-01T00:00:00.000Z",
    "endDate": "2026-03-31T23:59:59.999Z",
    "amount": 49,
    "charityPercentage": 15
  }'

# Add a score. The service keeps only the most recent 5 by date.
curl -X POST http://localhost:5000/api/v1/scores/users/USER_OBJECT_ID \
  -H "Content-Type: application/json" \
  -d '{ "value": 9, "date": "2026-03-15T09:00:00.000Z" }'

# Create a monthly draw. Month/year is unique.
curl -X POST http://localhost:5000/api/v1/draws \
  -H "Content-Type: application/json" \
  -d '{
    "month": 3,
    "year": 2026,
    "numbers": [4, 9, 17, 23, 41],
    "type": "random",
    "status": "completed"
  }'

# Assign a winning. User + draw is unique.
curl -X POST http://localhost:5000/api/v1/winnings \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_OBJECT_ID",
    "drawId": "DRAW_OBJECT_ID",
    "matchCount": 3,
    "prizeAmount": 150,
    "status": "verified"
  }'

# Create a payment record
curl -X POST http://localhost:5000/api/v1/payments \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_OBJECT_ID",
    "subscriptionId": "SUBSCRIPTION_OBJECT_ID",
    "amount": 49,
    "currency": "USD",
    "status": "success",
    "paymentProvider": "stripe",
    "transactionId": "txn_live_123"
  }'
```
