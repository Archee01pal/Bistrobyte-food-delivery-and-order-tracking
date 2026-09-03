import { IsString, IsBoolean } from 'class-validator';

export class ProcessPaymentDto {
  @IsString()
  orderId: string;

  @IsBoolean()
  shouldSucceed: boolean;
}