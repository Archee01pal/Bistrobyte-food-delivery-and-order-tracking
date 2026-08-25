import { IsOptional, IsEnum, IsString, IsIn } from 'class-validator';

export class GetUsersQueryDto {
  @IsOptional()
  @IsEnum(['admin', 'user'], { message: 'Role must be either admin or user' })
  role?: 'admin' | 'user';

  @IsOptional()
  @IsEnum(['active', 'inactive'], { message: 'Status must be active or inactive' })
  status?: 'active' | 'inactive';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['name', 'email'], { message: 'sortBy must be either name or email' })
  sortBy?: 'name' | 'email' = 'name';

  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'sortOrder must be either asc or desc' })
  sortOrder?: 'asc' | 'desc' = 'asc';
}