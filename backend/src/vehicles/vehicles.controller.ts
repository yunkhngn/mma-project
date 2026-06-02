import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehicleEntity } from './entities/vehicle.entity';
import { VehicleTypeEntity } from './entities/vehicle-type.entity';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get('types')
  @ApiOperation({ summary: 'Get all vehicle types' })
  @ApiResponse({ status: 200, description: 'Return all vehicle types.' })
  async findAllTypes(): Promise<VehicleTypeEntity[]> {
    return this.vehiclesService.findAllTypes();
  }

  @Post('types')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new vehicle type (Admin only)' })
  @ApiResponse({ status: 201, description: 'Vehicle type created successfully.' })
  async createType(@Body() body: { name: string }): Promise<VehicleTypeEntity> {
    return this.vehiclesService.createType(body);
  }

  @Put('types/:id')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a vehicle type (Admin only)' })
  @ApiResponse({ status: 200, description: 'Vehicle type updated successfully.' })
  async updateType(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name: string },
  ): Promise<VehicleTypeEntity> {
    return this.vehiclesService.updateType(id, body);
  }

  @Delete('types/:id')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a vehicle type (Admin only)' })
  @ApiResponse({ status: 200, description: 'Vehicle type deleted successfully.' })
  async removeType(@Param('id', ParseIntPipe) id: number): Promise<VehicleTypeEntity> {
    return this.vehiclesService.deleteType(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vehicles' })
  @ApiResponse({ status: 200, description: 'Return all vehicles.' })
  async findAll(): Promise<VehicleEntity[]> {
    return this.vehiclesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle by ID' })
  @ApiResponse({ status: 200, description: 'Return vehicle details.' })
  @ApiResponse({ status: 404, description: 'Vehicle not found.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<VehicleEntity> {
    const vehicle = await this.vehiclesService.findOne(id);
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }
    return vehicle;
  }

  @Post()
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new vehicle (Admin only)' })
  @ApiResponse({ status: 201, description: 'Vehicle created successfully.' })
  async create(
    @Body()
    body: {
      name: string;
      totalSeats: number;
      type: string;
      seatLayout?: any;
    },
  ): Promise<VehicleEntity> {
    return this.vehiclesService.create(body);
  }

  @Put(':id')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update an existing vehicle (Admin only)' })
  @ApiResponse({ status: 200, description: 'Vehicle updated successfully.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      name?: string;
      totalSeats?: number;
      type?: string;
      seatLayout?: any;
    },
  ): Promise<VehicleEntity> {
    return this.vehiclesService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a vehicle (Admin only)' })
  @ApiResponse({ status: 200, description: 'Vehicle deleted successfully.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<VehicleEntity> {
    return this.vehiclesService.delete(id);
  }
}
