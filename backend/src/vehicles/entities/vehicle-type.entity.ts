export class VehicleTypeEntity {
  id: number;
  name: string;

  constructor(partial: Partial<VehicleTypeEntity>) {
    Object.assign(this, partial);
  }
}
