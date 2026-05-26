# Design Specification: Firebase Configuration in NestJS Backend

This design document specifies the changes required to allow the NestJS backend to load the Firebase Service Account credentials either from a stringified JSON string (compatible with current behavior) or from a local JSON file path.

## 1. Problem Statement
The backend application initializes Firebase Admin SDK using the `FIREBASE_SERVICE_ACCOUNT` environment variable. Previously, it only supported a stringified JSON string.
With the introduction of local file-based credentials (`./serviceAccountKey.json`), the system needs to dynamically detect whether the configured value is a JSON string or a file path, load the credentials correctly, and gracefully initialize the Firebase Admin SDK.

## 2. Proposed Changes

### 2.1 Backend Code Modifications (`firebase.service.ts`)
We will modify the `onModuleInit` method of `FirebaseService` in `src/firebase/firebase.service.ts`:
- Check if the configuration variable `FIREBASE_SERVICE_ACCOUNT` is a valid string.
- If it starts with `{` (whitespace trimmed), parse it directly as JSON.
- Otherwise, treat it as a file path relative to the application's working directory (`process.cwd()`). Read the file synchronously, parse its contents, and initialize Firebase.

### 2.2 Docker Compose Configuration (`docker-compose.yml`)
To support containerized development where the credentials file is not baked into the Docker image, we will:
- Mount the local `serviceAccountKey.json` into `/app/serviceAccountKey.json` inside the `api` container.

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

### 3.2 `docker-compose.yml` Changes
Add a volume mapping under the `api` service:
```yaml
    volumes:
      - ./serviceAccountKey.json:/app/serviceAccountKey.json
```

## 4. Verification Plan
1. **No Credentials Configured**: Verify that starting the application with `FIREBASE_SERVICE_ACCOUNT='{}'` logs a warning but doesn't crash the application.
2. **Invalid File Path**: Verify that setting `FIREBASE_SERVICE_ACCOUNT='./non-existent.json'` logs an error but handles it gracefully (does not crash).
3. **Valid File Path**: Verify that placing a valid service account JSON file at the specified path and starting the server initializes Firebase Admin SDK successfully.
4. **Valid JSON String**: Verify that setting `FIREBASE_SERVICE_ACCOUNT` to a valid raw JSON string still works as expected.
