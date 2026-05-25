import { Controller, Get, Param, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehicleEntity } from './entities/vehicle.entity';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  async findAll(): Promise<VehicleEntity[]> {
    return this.vehiclesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<VehicleEntity> {
    const vehicle = await this.vehiclesService.findOne(id);
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }
    return vehicle;
  }
}
