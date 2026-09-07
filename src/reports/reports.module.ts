import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { OrdersModule } from '../orders/orders.module';
import { DeliveryModule } from '../delivery/delivery.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [OrdersModule, DeliveryModule, AuthModule],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}