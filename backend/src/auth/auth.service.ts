import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly prisma: PrismaService,
  ) {}

  async validateAndSyncUser(token: string) {
    try {
      const decodedToken = await this.firebaseService
        .getAdmin()
        .auth()
        .verifyIdToken(token);
      const { uid, email, name } = decodedToken;

      if (!email) {
        throw new UnauthorizedException('Email is required from Firebase Auth');
      }

      let user = await this.prisma.user.findUnique({
        where: { firebaseUid: uid },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            firebaseUid: uid,
            email: email,
            fullName: name || email.split('@')[0],
            phone: '',
            role: 'passenger',
          },
        });
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException(
        error instanceof Error ? error.message : 'Invalid Firebase token',
      );
    }
  }
}
