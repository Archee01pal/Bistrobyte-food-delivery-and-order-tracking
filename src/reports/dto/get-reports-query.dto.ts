import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetReportsQueryDto {
  @ApiPropertyOptional({ description: 'Filter reports starting from date (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filter reports up to date (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Filter report metrics for a specific restaurant ID' })
  @IsOptional()
  @IsString()
  restaurantId?: string;
}