import { DeliveryService } from './delivery.service';
import { AssignDeliveryDto } from './dto/assign-delivery.dto';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';
export declare class DeliveryController {
    private readonly deliveryService;
    constructor(deliveryService: DeliveryService);
    assignDelivery(dto: AssignDeliveryDto): import("./delivery.service").DeliveryRecord;
    getMyDeliveries(req: any): import("./delivery.service").DeliveryRecord[];
    getAssignedDriverOrders(req: any): import("./delivery.service").DeliveryRecord[];
    acceptDeliveryOffer(orderId: string, req: any): import("./delivery.service").DeliveryRecord;
    updateStatus(id: string, dto: UpdateDeliveryStatusDto): import("./delivery.service").DeliveryRecord;
    updateDriverOrderStatus(id: string, status: string): import("./delivery.service").DeliveryRecord;
    updateDriverAvailabilityStatus(req: any, status: 'AVAILABLE' | 'BUSY' | 'OFFLINE'): {
        driverId: string;
        status: import("./delivery.service").DriverAvailabilityStatus;
        updatedAt: Date;
    };
    getDeliveryByOrder(orderId: string): import("./delivery.service").DeliveryRecord;
}
