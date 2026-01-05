/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { Encryptor } from '../infrastructure/encryption/Encryptor';
import { PaymentRequest } from '../domain/paymentRequest/PaymentRequest';
import type { CreditCardTokenRequest } from '../domain/paymentRequest/CreditCardTokenRequest';
import type { ApiClient } from '../infrastructure/interfaces/ApiClient';
import { Util } from '../infrastructure/utils/Util';
import type { CacheManager } from '../infrastructure/utils/CacheManager';
import type { EncryptionService } from './interfaces/EncryptionService';
import { BaseService } from './BaseService';
import {
    type EncryptedRequest,
    InvalidArgumentError,
    PublicKeyResponse,
    type SdkConfiguration,
    type SessionData,
} from '../domain';

export class DefaultEncryptionService extends BaseService implements EncryptionService {
    constructor(
        private readonly sessionData: SessionData,
        cacheManager: CacheManager,
        apiClient: ApiClient,
        private readonly configuration?: SdkConfiguration,
    ) {
        super(cacheManager, apiClient);
    }

    async getPublicKey(): Promise<PublicKeyResponse> {
        const cacheKey = 'publicKey';
        if (this.cacheManager.has(cacheKey)) {
            return this.cacheManager.get<PublicKeyResponse>(cacheKey)!;
        }

        const response = await this.apiClient.get<PublicKeyResponse>('/crypto/publickey');

        this.validateResponse(response, 'Error while trying to fetch the public key.');

        this.cacheManager.set<PublicKeyResponse>(cacheKey, response.data);

        return response.data;
    }

    async encryptPaymentRequest(request: PaymentRequest): Promise<EncryptedRequest> {
        const validationResult = request.validate();
        if (!validationResult.isValid) {
            throw new InvalidArgumentError('The payment request is not valid.', {
                data: validationResult,
            });
        }

        return this.encrypt(request);
    }

    async encryptTokenRequest(tokenRequest: CreditCardTokenRequest): Promise<EncryptedRequest> {
        return this.encrypt(tokenRequest);
    }

    private async encrypt(request: PaymentRequest | CreditCardTokenRequest) {
        const encryptor = new Encryptor(this.sessionData.clientSessionId);
        const publicKey = await this.getPublicKey();

        const encryptedFields =
            request instanceof PaymentRequest
                ? encryptor.encrypt(publicKey, request)
                : encryptor.encryptTokenRequest(publicKey, request);

        const metadata = Util.getMetadata(this.configuration?.appIdentifier);

        return {
            encryptedCustomerInput: encryptedFields,
            encodedClientMetaInfo: Util.base64UrlEncode(JSON.stringify(metadata)),
        };
    }
}
