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
            throw new Error(
              `Firebase credentials file not found at: ${resolvedPath}`,
            );
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

  async sendPushNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<string | null> {
    if (!this.firebaseApp) {
      this.logger.warn(
        'Firebase Admin SDK is not initialized. Cannot send notification.',
      );
      return null;
    }
    try {
      const response = await this.firebaseApp.messaging().send({
        token,
        notification: {
          title,
          body,
        },
        data,
      });
      this.logger.log(`Successfully sent FCM message: ${response}`);
      return response;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error sending FCM message to token ${token}:`, msg);
      return null;
    }
  }

  async sendToTopic(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<string | null> {
    if (!this.firebaseApp) {
      this.logger.warn(
        'Firebase Admin SDK is not initialized. Cannot send notification to topic.',
      );
      return null;
    }
    try {
      const response = await this.firebaseApp.messaging().send({
        topic,
        notification: {
          title,
          body,
        },
        data,
      });
      this.logger.log(
        `Successfully sent FCM message to topic ${topic}: ${response}`,
      );
      return response;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error sending FCM message to topic ${topic}:`, msg);
      return null;
    }
  }
}
