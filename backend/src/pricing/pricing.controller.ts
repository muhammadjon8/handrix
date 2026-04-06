import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { CalculatePriceDto, PriceQuoteResponseDto } from './pricing.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Pricing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post('calculate')
  @ApiOperation({
    summary: 'Calculate a price quote from a classified job',
    description:
      'Accepts the output of POST /intake/chat (when type="classification") and returns an itemised price breakdown. Quote is valid for 15 minutes.',
  })
  @ApiResponse({ status: 200, type: PriceQuoteResponseDto })
  @ApiResponse({ status: 404, description: 'No pricing config found for the given job_type' })
  async calculate(@Body() dto: CalculatePriceDto): Promise<PriceQuoteResponseDto> {
    return this.pricingService.calculate(dto);
  }
}
