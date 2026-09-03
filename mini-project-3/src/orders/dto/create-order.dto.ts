import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  deliveryAddress: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountCodeAmount?: number;
}