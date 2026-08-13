import { IsOptional, IsString, IsIn, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetUsersFilterDto {
  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['name', 'email'])
  sortBy?: 'name' | 'email' = 'name';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';

  // ✨ Day 05: Pagination Controls
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({ message: 'page must be an integer number' })
  @Min(1, { message: 'page must not be less than 1 (No negative paging)' })
  page?: number = 1; // Default to first page

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({ message: 'limit must be an integer number' })
  @Min(1, { message: 'limit must not be less than 1' })
  limit?: number = 20; // Default page size: 20
}