import { OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { AppConfigService } from '../config/config.service';
export declare class FirebaseService implements OnModuleInit {
    private configService;
    private readonly logger;
    private firebaseApp;
    constructor(configService: AppConfigService);
    onModuleInit(): void;
    getAdmin(): typeof admin;
    getApp(): admin.app.App;
}
