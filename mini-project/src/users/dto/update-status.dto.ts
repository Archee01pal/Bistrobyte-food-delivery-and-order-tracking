import { IsIn } from 'class-validator';

export class UpdateStatusDto {
  @IsIn(['active', 'inactive'], { message: 'Status must be either active or inactive' })
  status: string;
}