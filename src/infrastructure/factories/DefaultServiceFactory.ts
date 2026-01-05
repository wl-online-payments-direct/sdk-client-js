/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import type { PaymentProductFactory } from '../interfaces/PaymentProductFactory';
import { DefaultPaymentProductFactory } from './DefaultPaymentProductFactory';
import type { ServiceFactory } from '../interfaces/ServiceFactory';
import type { ApiClient } from '../interfaces/ApiClient';
import { DefaultApiClient } from '../DefaultApiClient';
import { CacheManager } from '../utils/CacheManager';
import type { PaymentProductService } from '../../services/interfaces/PaymentProductService';
import type { EncryptionService } from '../../services/interfaces/EncryptionService';
import type { ClientService } from '../../services/interfaces/ClientService';
import { DefaultEncryptionService } from '../../services/DefaultEncryptionService';
import { DefaultClientService } from '../../services/DefaultClientService';
import { DefaultPaymentProductService } from '../../services/DefaultPaymentProductService';
import type { SdkConfiguration, SessionData } from '../../domain';

export interface ServiceFactoryProps {
    sessionData: SessionData;
    configuration?: SdkConfiguration;
    paymentProductService?: PaymentProductService;
    encryptionService?: EncryptionService;
    clientService?: ClientService;
    apiClient?: ApiClient;
    paymentProductFactory?: PaymentProductFactory;
}

export class DefaultServiceFactory implements ServiceFactory {
    private readonly apiClient: ApiClient;
    private readonly encryptionService: EncryptionService;
    private readonly paymentProductService: PaymentProductService;
    private readonly paymentProductFactory: PaymentProductFactory;
    private readonly clientService: ClientService;
    private readonly cacheManager: CacheManager;

    constructor(props: ServiceFactoryProps) {
        this.apiClient =
            props.apiClient ??
            new DefaultApiClient(
                props.sessionData.clientApiUrl,
                props.sessionData.customerId,
                props.sessionData.clientSessionId,
                props.configuration?.appIdentifier,
            );

        this.paymentProductFactory = props.paymentProductFactory ?? new DefaultPaymentProductFactory();
        this.cacheManager = new CacheManager();

        this.encryptionService =
            props.encryptionService ??
            new DefaultEncryptionService(
                props.sessionData,
                this.getCacheManager(),
                this.apiClient,
                props.configuration,
            );

        this.clientService = props.clientService ?? new DefaultClientService(this.getCacheManager(), this.apiClient);

        this.paymentProductService =
            props.paymentProductService ??
            new DefaultPaymentProductService(this.getCacheManager(), this.apiClient, this.paymentProductFactory);
    }

    getEncryptionService(): EncryptionService {
        return this.encryptionService;
    }

    getPaymentProductService(): PaymentProductService {
        return this.paymentProductService;
    }

    getCacheManager(): CacheManager {
        return this.cacheManager;
    }

    getClientService(): ClientService {
        return this.clientService;
    }
}
