import type { PaymentRequest } from '../../domain/paymentRequest/PaymentRequest';
import { type EncryptedRequest } from '../../types';
import { PublicKeyResponse } from '../../dataModel';
import type { CreditCardTokenRequest } from '../../domain/paymentRequest/CreditCardTokenRequest';

export interface EncryptionService {
    getPublicKey(): Promise<PublicKeyResponse>;

    encryptPaymentRequest(request: PaymentRequest): Promise<EncryptedRequest>;

    encryptTokenRequest(tokenRequest: CreditCardTokenRequest): Promise<EncryptedRequest>;
}
