import { ConfigService as NestConfigService } from '@nestjs/config';
export declare class AppConfigService {
    private configService;
    constructor(configService: NestConfigService);
    get port(): number;
    get nodeEnv(): string;
    get databaseUrl(): string;
    get firebaseServiceAccount(): string;
}
