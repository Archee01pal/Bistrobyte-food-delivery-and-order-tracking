import { IsOptional, IsString, IsIn, IsDateString } from 'class-validator';

export class GetEventsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  availableOnly?: string;

  @IsOptional()
  @IsIn(['popularity', 'date', 'price'])
  sortBy?: 'popularity' | 'date' | 'price' = 'date';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}