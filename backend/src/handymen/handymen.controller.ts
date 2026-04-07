import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { HandymenService } from './handymen.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('handymen')
@ApiBearerAuth()
@Controller('handymen')
@UseGuards(JwtAuthGuard)
export class HandymenController {
  constructor(private readonly handymenService: HandymenService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current handyman profile' })
  async getProfile(@Request() req) {
    return this.handymenService.findByUserId(req.user.id);
  }

  @Patch('availability')
  @ApiOperation({ summary: 'Update availability status (available/offline)' })
  async updateAvailability(
    @Request() req,
    @Body('availability') availability: 'available' | 'offline',
  ) {
    return this.handymenService.updateAvailability(req.user.id, availability);
  }

  @Patch('location')
  @ApiOperation({ summary: 'Update real-time coordinates' })
  async updateLocation(
    @Request() req,
    @Body('latitude') lat: number,
    @Body('longitude') lng: number,
  ) {
    return this.handymenService.updateLocation(req.user.id, lat, lng);
  }
}
