import { Injectable } from '@nestjs/common';
import { OrdersService, OrderStatus } from '../orders/orders.service';
import { DeliveryService } from '../delivery/delivery.service';
import { GetReportsQueryDto } from './dto/get-reports-query.dto';

@Injectable()
export class ReportsService {
  constructor(
    private ordersService: OrdersService,
    private deliveryService: DeliveryService,
  ) {}

  getDashboardSummary(query: GetReportsQueryDto) {
    let orders = this.ordersService.getAllOrders();

    if (query.restaurantId) {
      orders = orders.filter((o) => o.restaurantId === query.restaurantId);
    }

    if (query.startDate) {
      const start = new Date(query.startDate);
      orders = orders.filter((o) => new Date(o.createdAt) >= start);
    }

    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      orders = orders.filter((o) => new Date(o.createdAt) <= end);
    }

    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.status === OrderStatus.DELIVERED).length;
    const cancelledOrders = orders.filter((o) => o.status === OrderStatus.CANCELLED).length;
    const pendingOrders = orders.filter(
      (o) => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED,
    ).length;

    const totalRevenue = orders
      .filter((o) => o.status === OrderStatus.DELIVERED || o.status === OrderStatus.CONFIRMED)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      overview: {
        totalOrders,
        completedOrders,
        cancelledOrders,
        pendingOrders,
        totalRevenue: Number(totalRevenue.toFixed(2)),
      },
      timeRange: {
        startDate: query.startDate || 'All-Time',
        endDate: query.endDate || 'All-Time',
      },
    };
  }

  getDriverPerformanceSummary(driverId: string) {
    const deliveries = this.deliveryService.getDriverDeliveries(driverId);
    const totalAssigned = deliveries.length;
    const completedDeliveries = deliveries.filter((d) => d.status === 'DELIVERED').length;
    const activeDeliveries = deliveries.filter((d) => d.status !== 'DELIVERED').length;

    return {
      driverId,
      metrics: {
        totalAssigned,
        completedDeliveries,
        activeDeliveries,
        completionRate: totalAssigned > 0 ? `${((completedDeliveries / totalAssigned) * 100).toFixed(1)}%` : '0%',
      },
    };
  }
}