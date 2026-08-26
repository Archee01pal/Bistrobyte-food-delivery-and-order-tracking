import { IsIn } from 'class-validator';

export class UpdateBookingStatusDto {
  @IsIn(['confirmed', 'canceled'])
  status: 'confirmed' | 'canceled';
}