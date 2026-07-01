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
import { AdvertisementsService } from './advertisements.service';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { UpdateAdvertisementDto } from './dto/update-advertisement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Advertisement } from './entities/advertisement.entity';

@Controller('advertisements')
export class AdvertisementsController {
  constructor(private readonly advertisementsService: AdvertisementsService) {}

  // POST /api/v1/advertisements — JWT required
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAdvertisementDto,
  ): Promise<Advertisement> {
    return this.advertisementsService.create(userId, dto);
  }

  // GET /api/v1/advertisements — public
  @Get()
  async findAllActive(): Promise<Advertisement[]> {
    return this.advertisementsService.findAllActive();
  }

  // GET /api/v1/advertisements/mine — JWT required
  @Get('mine')
  @UseGuards(JwtAuthGuard)
  async findMine(
    @CurrentUser('id') userId: string,
  ): Promise<Advertisement[]> {
    return this.advertisementsService.findMine(userId);
  }

  // GET /api/v1/advertisements/:id — public
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Advertisement> {
    return this.advertisementsService.findOne(id);
  }

  // PATCH /api/v1/advertisements/:id — JWT required
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateAdvertisementDto,
  ): Promise<Advertisement> {
    return this.advertisementsService.update(id, userId, dto);
  }

  // DELETE /api/v1/advertisements/:id — JWT required
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return this.advertisementsService.remove(id, userId);
  }
}