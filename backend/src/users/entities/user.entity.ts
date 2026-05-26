export class UserEntity {
  id: number;
  firebaseUid: string;
  fullName: string;
  phone: string;
  email: string;
  role: string;
  avatar: string | null;
  createdAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
