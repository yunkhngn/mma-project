import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from './cloudinary.service';
import { AppConfigService } from '../config/config.service';
import { v2 as cloudinary } from 'cloudinary';

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
    },
  },
}));

describe('CloudinaryService', () => {
  let service: CloudinaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudinaryService,
        {
          provide: AppConfigService,
          useValue: {
            cloudinaryCloudName: 'test-cloud',
            cloudinaryApiKey: 'test-key',
            cloudinaryApiSecret: 'test-secret',
          },
        },
      ],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
  });

  it('should successfully upload a file stream and return URL', async () => {
    const mockResult = { secure_url: 'https://cloudinary.com/avatar.jpg' };
    const mockUploadStream = jest.fn(
      (options, callback: (error: any, result: any) => void) => {
        callback(null, mockResult);
        return { end: jest.fn() };
      },
    );
    (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
      mockUploadStream,
    );

    const mockFile = {
      buffer: Buffer.from('test-image-content'),
    } as Express.Multer.File;

    const result = await service.uploadFile(mockFile);

    expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
      { folder: 'mma_avatars' },
      expect.any(Function),
    );
    expect(result).toBe('https://cloudinary.com/avatar.jpg');
  });
});
