import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { FirebaseModule } from './firebase/firebase.module';

@Module({
  imports: [AppConfigModule, PrismaModule, FirebaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
