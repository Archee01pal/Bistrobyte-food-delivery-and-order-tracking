import { IsEnum } from 'class-validator';
import { DeliveryStatus } from '../delivery.service';

export class UpdateDeliveryStatusDto {
  @IsEnum(DeliveryStatus)
  status: DeliveryStatus;
}