import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class MaterialInputDto {
  @ApiProperty({ example: 'PVC pipe 1/2 inch' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({
    example: 4.5,
    required: false,
    description: 'Unit cost in USD. Defaults to 0 if not provided (supplier pricing not yet integrated).',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unit_cost?: number;
}

export class CalculatePriceDto {
  @ApiProperty({ example: 'pipe_leak', description: 'Job type key — must exist in pricing_config table' })
  @IsString()
  @IsNotEmpty()
  job_type: string;

  @ApiProperty({ example: 1.5, description: 'Estimated hours from AI classification' })
  @IsNumber()
  @Min(0.5)
  estimated_duration_hours: number;

  @ApiProperty({ type: [MaterialInputDto], description: 'Materials from AI classification' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialInputDto)
  materials: MaterialInputDto[];
}

// Response shape (not a DTO, just used for Swagger schema docs)
export class PriceQuoteResponseDto {
  @ApiProperty({ example: 60.0 })
  labor_cost: number;

  @ApiProperty({ example: 10.35 })
  parts_cost: number;

  @ApiProperty({ example: 10.0 })
  transport_fee: number;

  @ApiProperty({ example: 80.35 })
  total: number;

  @ApiProperty({
    example: {
      labor_rate_per_hour: 40,
      estimated_duration_hours: 1.5,
      markup_pct: 0.15,
      materials: [],
    },
  })
  breakdown: object;

  @ApiProperty({ example: '2026-04-06T12:43:00.000Z', description: 'Quote is valid for 15 minutes' })
  quote_expires_at: string;
}
