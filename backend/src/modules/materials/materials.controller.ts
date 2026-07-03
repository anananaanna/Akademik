import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Material } from './entities/material.entity';

@Controller('materials')
@UseGuards(JwtAuthGuard)
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  // POST /api/v1/materials/booking/:bookingId
  @Post('booking/:bookingId')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateMaterialDto,
  ): Promise<Material> {
    return this.materialsService.create(bookingId, userId, dto);
  }

  // GET /api/v1/materials/booking/:bookingId
  @Get('booking/:bookingId')
  async findByBooking(
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @CurrentUser('id') userId: string,
  ): Promise<Material[]> {
    return this.materialsService.findByBooking(bookingId, userId);
  }

  // PATCH /api/v1/materials/:id
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateMaterialDto,
  ): Promise<Material> {
    return this.materialsService.update(id, userId, dto);
  }

  // DELETE /api/v1/materials/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return this.materialsService.remove(id, userId);
  }
}