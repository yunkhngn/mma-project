# MMA-Project

Monorepo containing the mobile app and backend API.

## Structure

| Folder     | Description                                    |
| ---------- | ---------------------------------------------- |
| `mobile/`  | React Native (Expo) mobile application         |
| `backend/` | Node.js + Express API with Firebase and MySQL  |

## Getting Started

### Mobile

```bash
cd mobile
npm install
npx expo start
```

### Backend

```bash
cd backend
docker compose up -d     # Start MySQL + backend
```

## Tech Stack

- **Mobile:** React Native, Expo SDK 53, TypeScript
- **Backend:** Node.js 22, Express, Firebase Admin SDK
- **Database:** MySQL 8.0
- **Infrastructure:** Docker, Docker Compose
