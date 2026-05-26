import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { AppConfigService } from '../config/config.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private firebaseApp: admin.app.App;

  constructor(private configService: AppConfigService) {}

  onModuleInit() {
    const serviceAccountStr = this.configService.firebaseServiceAccount;
    if (serviceAccountStr && serviceAccountStr !== '{}') {
      try {
        let serviceAccount: admin.ServiceAccount;
        
        if (serviceAccountStr.trim().startsWith('{')) {
          serviceAccount = JSON.parse(
            serviceAccountStr,
          ) as admin.ServiceAccount;
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

  getAdmin() {
    return admin;
  }

  getApp() {
    return this.firebaseApp;
  }
}

