/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { DefaultServiceFactory } from '../../../../src/infrastructure/factories/DefaultServiceFactory';
import { DefaultClientService } from '../../../../src/services/DefaultClientService';
import { DefaultEncryptionService } from '../../../../src/services/DefaultEncryptionService';
import { DefaultPaymentProductService } from '../../../../src/services/DefaultPaymentProductService';
import { CacheManager } from '../../../../src/infrastructure/utils/CacheManager';
import { mock } from 'vitest-mock-extended';
import type { ClientService } from '../../../../src/services/interfaces/ClientService';
import type { EncryptionService } from '../../../../src/services/interfaces/EncryptionService';
import type { PaymentProductService } from '../../../../src/services/interfaces/PaymentProductService';
import { sessionData } from '../../testUtils/SessionData';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('default service factory behavior', () => {
    it('creates all default instances', async () => {
        const service = new DefaultServiceFactory({
            sessionData,
        });

        expect(service.getClientService()).toBeDefined();
        expect(service.getClientService()).toBeInstanceOf(DefaultClientService);
        expect(service.getEncryptionService()).toBeDefined();
        expect(service.getEncryptionService()).toBeInstanceOf(DefaultEncryptionService);
        expect(service.getPaymentProductService()).toBeDefined();
        expect(service.getPaymentProductService()).toBeInstanceOf(DefaultPaymentProductService);
        expect(service.getCacheManager()).toBeDefined();
        expect(service.getCacheManager()).toBeInstanceOf(CacheManager);
    });

    it('returns client service if provided in constructor', async () => {
        const mockService = mock<ClientService>();
        const service = new DefaultServiceFactory({
            sessionData,
            clientService: mockService,
        });

        expect(service.getClientService()).toBe(mockService);
        expect(service.getClientService()).not.toBeInstanceOf(DefaultClientService);
    });

    it('returns encryption service if provided in constructor', async () => {
        const mockService = mock<EncryptionService>();
        const service = new DefaultServiceFactory({
            sessionData,
            encryptionService: mockService,
        });

        expect(service.getEncryptionService()).toBe(mockService);
        expect(service.getEncryptionService()).not.toBeInstanceOf(DefaultEncryptionService);
    });

    it('returns payment product service if provided in constructor', async () => {
        const mockService = mock<PaymentProductService>();
        const service = new DefaultServiceFactory({
            sessionData,
            paymentProductService: mockService,
        });

        expect(service.getPaymentProductService()).toBe(mockService);
        expect(service.getPaymentProductService()).not.toBeInstanceOf(DefaultEncryptionService);
    });
});
