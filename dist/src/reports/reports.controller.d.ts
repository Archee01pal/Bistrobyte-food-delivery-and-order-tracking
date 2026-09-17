import { ReportsService } from './reports.service';
import { GetReportsQueryDto } from './dto/get-reports-query.dto';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getDashboardMetrics(query: GetReportsQueryDto): {
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
    getDriverPerformance(driverId: string): {
        driverId: string;
        metrics: {
            totalAssigned: number;
            completedDeliveries: number;
            activeDeliveries: number;
            completionRate: string;
        };
    };
}
