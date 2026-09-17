import { OrdersService } from '../orders/orders.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AssignDeliveryDto } from './dto/assign-delivery.dto';
export declare enum DeliveryStatus {
    ASSIGNED = "ASSIGNED",
    PICKED_UP = "PICKED_UP",
    IN_TRANSIT = "IN_TRANSIT",
    DELIVERED = "DELIVERED"
}
export interface DeliveryRecord {
    id: string;
    orderId: string;
    deliveryPartnerId: string;
    status: DeliveryStatus;
    statusHistory: {
        status: DeliveryStatus;
        timestamp: Date;
    }[];
    updatedAt: Date;
}
export type DriverAvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';
export declare class DeliveryService {
    private ordersService;
    private notificationsService;
    private deliveryTable;
    private driverAvailabilityTable;
    constructor(ordersService: OrdersService, notificationsService: NotificationsService);
    assignDelivery(dto: AssignDeliveryDto): DeliveryRecord;
    acceptDeliveryOffer(orderId: string, driverId: string): DeliveryRecord;
    updateDeliveryStatus(deliveryId: string, status: DeliveryStatus | string): DeliveryRecord;
    updateDeliveryStatusByOrderId(orderId: string, status: string): DeliveryRecord;
    updateDriverAvailability(driverId: string, status: DriverAvailabilityStatus): {
        driverId: string;
        status: DriverAvailabilityStatus;
        updatedAt: Date;
    };
    getDriverDeliveries(driverId: string): DeliveryRecord[];
    getDeliveryByOrderId(orderId: string): DeliveryRecord;
}
