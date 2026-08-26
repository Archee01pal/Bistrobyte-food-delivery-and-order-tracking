import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsInt()
  @Min(1, { message: 'You must book at least 1 ticket.' })
  ticketCount: number;
}