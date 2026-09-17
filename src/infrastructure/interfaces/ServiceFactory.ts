/*
 * Do not remove or alter the notices in this preamble.
 *
 * This software is owned by Worldline and may not be be altered, copied, reproduced, republished, uploaded, posted, transmitted or distributed in any way, without the prior written consent of Worldline.
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
import type { ClickToPayService } from '../../services/interfaces/ClickToPayService';
import type { ClickToPayConfig, PaymentContextWithAmount } from '../../domain';

export interface ServiceFactory {
    getEncryptionService(): EncryptionService;

    getPaymentProductService(): PaymentProductService;

    getClientService(): ClientService;

    getClickToPayService(context: PaymentContextWithAmount, config?: ClickToPayConfig): Promise<ClickToPayService>;
}
