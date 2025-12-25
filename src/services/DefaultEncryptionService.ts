import { Encryptor } from '../infrastructure/encryption/Encryptor';
import { EncryptionError, PublicKeyResponse, ResponseError } from '../dataModel';
import { type EncryptedRequest, type PublicKeyJson, type SdkConfiguration, type SessionData } from '../types';
import { PaymentRequest } from '../domain/paymentRequest/PaymentRequest';
import type { CreditCardTokenRequest } from '../domain/paymentRequest/CreditCardTokenRequest';
import type { ApiClient } from '../infrastructure/interfaces/ApiClient';
import { Util } from '../infrastructure/utils/Util';
import type { CacheManager } from '../infrastructure/utils/CacheManager';
import type { EncryptionService } from './interfaces/EncryptionService';

export class DefaultEncryptionService implements EncryptionService {
    constructor(
        private readonly sessionData: SessionData,
        private readonly cacheManager: CacheManager,
        private readonly apiClient: ApiClient,
        private readonly configuration?: SdkConfiguration,
    ) {}

    async getPublicKey(): Promise<PublicKeyResponse> {
        const cacheKey = 'publicKey';
        if (this.cacheManager.has(cacheKey)) {
            return this.cacheManager.get(cacheKey)!;
        }

        const response = await this.apiClient.get<PublicKeyJson>('/crypto/publickey');

        if (!response?.success) {
            throw new ResponseError(response ?? {}, 'Could not fetch the public key.');
        }

        const publicKeyResponse = new PublicKeyResponse(response.data);
        this.cacheManager.set(cacheKey, publicKeyResponse);

        return publicKeyResponse;
    }

    async encryptPaymentRequest(request: PaymentRequest): Promise<EncryptedRequest> {
        const validationResult = request.validate();
        if (!validationResult.isValid) {
            throw new EncryptionError('Error encrypting payment request: the payment request is not valid.', {
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
