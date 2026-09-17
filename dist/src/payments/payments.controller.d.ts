import { PaymentsService } from './payments.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    processPayment(dto: ProcessPaymentDto): import("./payments.service").Payment;
}
