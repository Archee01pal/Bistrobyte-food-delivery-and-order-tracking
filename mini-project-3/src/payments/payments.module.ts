import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { OrdersModule } from '../orders/orders.module';
import { AuthModule } from '../auth/auth.module'; 

@Module({
  imports: [OrdersModule, AuthModule], 
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}