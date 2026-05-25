export class RouteEntity {
  id: number;
  origin: string;
  destination: string;
  distanceKm: number;

  constructor(partial: Partial<RouteEntity>) {
    Object.assign(this, partial);
  }
}
