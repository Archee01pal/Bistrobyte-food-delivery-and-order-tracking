import { IsOptional, IsString, IsNumberString, IsIn } from 'class-validator';

export class SearchProductsDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsNumberString()
  maxPrice?: string; // Filter for price less than this value

  @IsOptional()
  @IsIn(['name', 'price'])
  sortBy?: 'name' | 'price';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}