import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class ProcessPaymentDto {
  @ApiProperty({ description: 'Order ID to process payment for' })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ description: 'Method of payment (e.g., CREDIT_CARD, PAYPAL)' })
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @ApiPropertyOptional({ description: 'Simulate successful or failed payment', default: true })
  @IsOptional()
  @IsBoolean()
  shouldSucceed?: boolean = true;
}