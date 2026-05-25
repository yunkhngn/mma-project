export class UserEntity {
  id: number;
  firebaseUid: string;
  fullName: string;
  phone: string;
  email: string;
  role: string;
  createdAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
