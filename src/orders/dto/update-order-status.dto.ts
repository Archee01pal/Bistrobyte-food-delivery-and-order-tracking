import { IsEnum } from 'class-validator';
import { OrderStatus } from '../orders.service';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}