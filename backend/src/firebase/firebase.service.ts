import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { AppConfigService } from '../config/config.service';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private firebaseApp: admin.app.App;

  constructor(private configService: AppConfigService) {}

  onModuleInit() {
    const serviceAccountStr = this.configService.firebaseServiceAccount;
    if (serviceAccountStr && serviceAccountStr !== '{}') {
      try {
        const serviceAccount = JSON.parse(serviceAccountStr);
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        this.logger.log('✅ Firebase Admin SDK initialized successfully');
      } catch (error) {
        this.logger.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
      }
    } else {
      this.logger.warn('⚠️  Firebase service account key not provided. Skipping initialization.');
    }
  }

  getAdmin() {
    return admin;
  }

  getApp() {
    return this.firebaseApp;
  }
}
