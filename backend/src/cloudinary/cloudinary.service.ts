import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { AppConfigService } from '../config/config.service';

@Injectable()
export class CloudinaryService {
  constructor(private configService: AppConfigService) {
    cloudinary.config({
      cloud_name: this.configService.cloudinaryCloudName,
      api_key: this.configService.cloudinaryApiKey,
      api_secret: this.configService.cloudinaryApiSecret,
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'mma_avatars' },
        (error, result) => {
          if (error) return reject(new Error(error.message));
          if (result) return resolve(result.secure_url);
          reject(new Error('Upload failed with empty result'));
        },
      );
      upload.end(file.buffer);
    });
  }
}
