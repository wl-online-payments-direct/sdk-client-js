/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import type { PaymentProductService } from '../../services/interfaces/PaymentProductService';
import type { EncryptionService } from '../../services/interfaces/EncryptionService';
import type { ClientService } from '../../services/interfaces/ClientService';

export interface ServiceFactory {
    getEncryptionService(): EncryptionService;

    getPaymentProductService(): PaymentProductService;

    getClientService(): ClientService;
}
