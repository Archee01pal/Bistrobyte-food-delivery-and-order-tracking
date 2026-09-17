import { OrderStatus } from '../orders.service';
export declare class GetOrdersQueryDto {
    status?: OrderStatus;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sort?: 'asc' | 'desc';
}
