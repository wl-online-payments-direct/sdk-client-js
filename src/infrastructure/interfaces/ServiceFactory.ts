import type { PaymentProductService } from '../../services/interfaces/PaymentProductService';
import type { EncryptionService } from '../../services/interfaces/EncryptionService';
import type { ClientService } from '../../services/interfaces/ClientService';

export interface ServiceFactory {
    getEncryptionService(): EncryptionService;

    getPaymentProductService(): PaymentProductService;

    getClientService(): ClientService;
}
