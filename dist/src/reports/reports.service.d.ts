import { OrdersService } from '../orders/orders.service';
import { DeliveryService } from '../delivery/delivery.service';
import { GetReportsQueryDto } from './dto/get-reports-query.dto';
export declare class ReportsService {
    private ordersService;
    private deliveryService;
    constructor(ordersService: OrdersService, deliveryService: DeliveryService);
    getDashboardSummary(query: GetReportsQueryDto): {
        overview: {
            totalOrders: number;
            completedOrders: number;
            cancelledOrders: number;
            pendingOrders: number;
            totalRevenue: number;
        };
        timeRange: {
            startDate: string;
            endDate: string;
        };
    };
    getDriverPerformanceSummary(driverId: string): {
        driverId: string;
        metrics: {
            totalAssigned: number;
            completedDeliveries: number;
            activeDeliveries: number;
            completionRate: string;
        };
    };
}
