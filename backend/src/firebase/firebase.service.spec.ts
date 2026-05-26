import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseService } from './firebase.service';
import { AppConfigService } from '../config/config.service';
import * as admin from 'firebase-admin';
import * as fs from 'fs';

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
}));

jest.mock('fs');

describe('FirebaseService', () => {
  let service: FirebaseService;
  let configService: AppConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseService,
        {
          provide: AppConfigService,
          useValue: {
            get firebaseServiceAccount() {
              return '{}';
            },
          },
        },
      ],
    }).compile();

    service = module.get<FirebaseService>(FirebaseService);
    configService = module.get<AppConfigService>(AppConfigService);
    jest.clearAllMocks();
  });

  it('should skip initialization if credentials are default or empty', () => {
    const loggerSpy = jest.spyOn(service['logger'], 'warn');
    service.onModuleInit();
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Firebase service account key not provided'),
    );
    expect(admin.initializeApp).not.toHaveBeenCalled();
  });

  it('should initialize using raw JSON string if config starts with {', () => {
    const mockJson = '{"project_id": "test-project"}';
    jest.spyOn(configService, 'firebaseServiceAccount', 'get').mockReturnValue(mockJson);

    service.onModuleInit();

    expect(admin.credential.cert).toHaveBeenCalledWith(JSON.parse(mockJson));
    expect(admin.initializeApp).toHaveBeenCalled();
  });

  it('should initialize using file contents if config is a file path', () => {
    const mockPath = './serviceAccountKey.json';
    const mockFileContent = '{"project_id": "file-project"}';
    jest.spyOn(configService, 'firebaseServiceAccount', 'get').mockReturnValue(mockPath);

    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(mockFileContent);

    service.onModuleInit();

    expect(fs.existsSync).toHaveBeenCalled();
    expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('serviceAccountKey.json'), 'utf8');
    expect(admin.credential.cert).toHaveBeenCalledWith(JSON.parse(mockFileContent));
    expect(admin.initializeApp).toHaveBeenCalled();
  });

  it('should log an error if the configured file path does not exist', () => {
    const mockPath = './missingKey.json';
    jest.spyOn(configService, 'firebaseServiceAccount', 'get').mockReturnValue(mockPath);

    (fs.existsSync as jest.Mock).mockReturnValue(false);
    const loggerSpy = jest.spyOn(service['logger'], 'error');

    service.onModuleInit();

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to initialize Firebase Admin SDK:'),
      expect.stringContaining('Firebase credentials file not found at'),
    );
    expect(admin.initializeApp).not.toHaveBeenCalled();
  });
});
