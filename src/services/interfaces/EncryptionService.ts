/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import type { PaymentRequest } from '../../domain/paymentRequest/PaymentRequest';
import type { CreditCardTokenRequest } from '../../domain/paymentRequest/CreditCardTokenRequest';
import { type EncryptedRequest, PublicKeyResponse } from '../../domain';

export interface EncryptionService {
    getPublicKey(): Promise<PublicKeyResponse>;

    encryptPaymentRequest(request: PaymentRequest): Promise<EncryptedRequest>;

    encryptTokenRequest(tokenRequest: CreditCardTokenRequest): Promise<EncryptedRequest>;
}
