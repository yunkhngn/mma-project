# Design Specification: Firebase Configuration & Hot Reload in Docker Compose

This design document specifies the changes required to allow the NestJS backend to load the Firebase Service Account credentials either from a stringified JSON string (compatible with current behavior) or from a local JSON file path. Additionally, it specifies configuring Docker Compose and the Dockerfile for development hot-reload capability.

## 1. Problem Statement
1. The backend application initializes Firebase Admin SDK using the `FIREBASE_SERVICE_ACCOUNT` environment variable. Previously, it only supported a stringified JSON string.
With the introduction of local file-based credentials (`./serviceAccountKey.json`), the system needs to dynamically detect whether the configured value is a JSON string or a file path, load the credentials correctly, and gracefully initialize the Firebase Admin SDK.
2. The current Docker Compose setup uses the production target of the Dockerfile, which does not support hot-reloading when local files are changed. Developers need a hot-reloading dev container for faster feedback loops.

## 2. Proposed Changes

### 2.1 Backend Code Modifications (`firebase.service.ts`)
We will modify the `onModuleInit` method of `FirebaseService` in `src/firebase/firebase.service.ts`:
- Check if the configuration variable `FIREBASE_SERVICE_ACCOUNT` is a valid string.
- If it starts with `{` (whitespace trimmed), parse it directly as JSON.
- Otherwise, treat it as a file path relative to the application's working directory (`process.cwd()`). Read the file synchronously, parse its contents, and initialize Firebase.

### 2.2 Dockerfile modifications
We will add a new `development` stage to `Dockerfile`:
- Copy the entire codebase.
- Expose port 3000.
- Command: `npm run start:dev` (starts Nest CLI watch mode).

### 2.3 Docker Compose Configuration (`docker-compose.yml`)
To support containerized development with hot-reload and local credential mapping:
- Point `api.build.target` to `development`.
- Mount the local directory `.` to `/app` inside the container.
- Mount `/app/node_modules` anonymously to preserve container-installed packages and prevent overriding them with local ones.
- Mount `./serviceAccountKey.json` into `/app/serviceAccountKey.json`.

## 3. Implementation Details

### 3.1 `firebase.service.ts` Changes
```typescript
import * as fs from 'fs';
import * as path from 'path';
// ... other imports

@Injectable()
export class FirebaseService implements OnModuleInit {
  // ...
  onModuleInit() {
    const serviceAccountStr = this.configService.firebaseServiceAccount;
    if (serviceAccountStr && serviceAccountStr !== '{}') {
      try {
        let serviceAccount: admin.ServiceAccount;
        
        if (serviceAccountStr.trim().startsWith('{')) {
          serviceAccount = JSON.parse(serviceAccountStr) as admin.ServiceAccount;
        } else {
          const resolvedPath = path.resolve(process.cwd(), serviceAccountStr);
          if (!fs.existsSync(resolvedPath)) {
            throw new Error(`Firebase credentials file not found at: ${resolvedPath}`);
          }
          const fileContent = fs.readFileSync(resolvedPath, 'utf8');
          serviceAccount = JSON.parse(fileContent) as admin.ServiceAccount;
        }

        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        this.logger.log('✅ Firebase Admin SDK initialized successfully');
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(
          '❌ Failed to initialize Firebase Admin SDK:',
          message,
        );
      }
    } else {
      this.logger.warn(
        '⚠️  Firebase service account key not provided. Skipping initialization.',
      );
    }
  }
  // ...
}
```

### 3.2 `Dockerfile` Changes
Add the `development` block:
```dockerfile
# ---- Development ----
FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "start:dev"]
```

### 3.3 `docker-compose.yml` Changes
Update the `api` service block:
```yaml
  api:
    build:
      context: .
      target: development
    container_name: mma-api
    restart: unless-stopped
    ports:
      - "${PORT:-3000}:3000"
    volumes:
      - .:/app
      - /app/node_modules
      - ./serviceAccountKey.json:/app/serviceAccountKey.json
    environment:
      PORT: 3000
      NODE_ENV: ${NODE_ENV:-development}
      DATABASE_URL: mysql://${DB_USER:-mma_user}:${DB_PASSWORD:-mma_password}@mysqldb:3306/${DB_NAME:-mma_db}
      FIREBASE_SERVICE_ACCOUNT: ${FIREBASE_SERVICE_ACCOUNT:-'{}'}
    depends_on:
      mysqldb:
        condition: service_healthy
    networks:
      - mma-network
```

## 4. Verification Plan
1. **No Credentials Configured**: Verify that starting the application with `FIREBASE_SERVICE_ACCOUNT='{}'` logs a warning but doesn't crash the application.
2. **Invalid File Path**: Verify that setting `FIREBASE_SERVICE_ACCOUNT='./non-existent.json'` logs an error but handles it gracefully (does not crash).
3. **Valid File Path**: Verify that placing a valid service account JSON file at the specified path and starting the server initializes Firebase Admin SDK successfully.
4. **Valid JSON String**: Verify that setting `FIREBASE_SERVICE_ACCOUNT` to a valid raw JSON string still works as expected.
5. **Docker Hot Reload**: Verify that running `docker compose up --build` launches NestJS in watch mode and changes to files under `src/` trigger a reload in container logs.
