import { IsArray, IsDecimal, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class JobPartDto {
  @ApiProperty({ example: 'PVC pipe 1/2 inch' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 4.5 })
  @IsNumber()
  unit_cost: number;
}

export class CreateJobDto {
  @ApiProperty({ example: 'pipe_leak' })
  @IsString()
  @IsNotEmpty()
  job_type: string;

  @ApiProperty({ example: 'My kitchen sink is leaking under the pipes.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 41.311081 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 69.240562 })
  @IsNumber()
  longitude: number;

  @ApiProperty({ example: 1.5 })
  @IsNumber()
  estimated_duration_hours: number;

  @ApiProperty({ example: 60.0, description: 'Snapshot of the labor cost at time of booking' })
  @IsNumber()
  labor_cost: number;

  @ApiProperty({ example: 10.0, description: 'Snapshot of the transport fee at time of booking' })
  @IsNumber()
  transport_fee: number;

  @ApiProperty({ type: [JobPartDto], description: 'List of confirmed materials/parts' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobPartDto)
  parts: JobPartDto[];
}
