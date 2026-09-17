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

import { afterEach, describe, expect, it, vi } from 'vitest';
import { DefaultServiceFactory } from '../../../../src/infrastructure/factories/DefaultServiceFactory';
import * as DefaultClientServiceModule from '../../../../src/services/DefaultClientService';
import { DefaultClientService } from '../../../../src/services/DefaultClientService';
import * as DefaultEncryptionServiceModule from '../../../../src/services/DefaultEncryptionService';
import { DefaultEncryptionService } from '../../../../src/services/DefaultEncryptionService';
import * as DefaultPaymentProductServiceModule from '../../../../src/services/DefaultPaymentProductService';
import { DefaultPaymentProductService } from '../../../../src/services/DefaultPaymentProductService';
import { CacheManager } from '../../../../src/infrastructure/utils/CacheManager';
import { mock } from 'vitest-mock-extended';
import type { ClientService } from '../../../../src/services/interfaces/ClientService';
import type { EncryptionService } from '../../../../src/services/interfaces/EncryptionService';
import type { PaymentProductService } from '../../../../src/services/interfaces/PaymentProductService';
import type { PaymentProductFactory } from '../../../../src/infrastructure/interfaces/PaymentProductFactory';
import type { ApiClient } from '../../../../src/infrastructure/interfaces/ApiClient';
import { sessionData } from '../../testUtils/SessionData';
import * as DefaultApiClientModule from '../../../../src/infrastructure/DefaultApiClient';
import * as DefaultPaymentProductFactoryModule from '../../../../src/infrastructure/factories/DefaultPaymentProductFactory';
import { NetceteraClickToPayService } from '../../../../src/infrastructure/clickToPay/NetceteraClickToPayService';
import type { ClickToPayService } from '../../../../src/services/interfaces/ClickToPayService';
import {
    ConfigurationError,
    type PaymentContextWithAmount,
    PaymentProduct,
    PaymentProduct5002SpecificData,
} from '../../../../src';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('default service factory behavior', () => {
    it('creates all default instances', () => {
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

    it('returns client service if provided in constructor', () => {
        const mockService = mock<ClientService>();
        const service = new DefaultServiceFactory({
            sessionData,
            clientService: mockService,
        });

        expect(service.getClientService()).toBe(mockService);
        expect(service.getClientService()).not.toBeInstanceOf(DefaultClientService);
    });

    it('returns encryption service if provided in constructor', () => {
        const mockService = mock<EncryptionService>();
        const service = new DefaultServiceFactory({
            sessionData,
            encryptionService: mockService,
        });

        expect(service.getEncryptionService()).toBe(mockService);
        expect(service.getEncryptionService()).not.toBeInstanceOf(DefaultEncryptionService);
    });

    it('returns payment product service if provided in constructor', () => {
        const mockService = mock<PaymentProductService>();
        const service = new DefaultServiceFactory({
            sessionData,
            paymentProductService: mockService,
        });

        expect(service.getPaymentProductService()).toBe(mockService);
        expect(service.getPaymentProductService()).not.toBeInstanceOf(DefaultPaymentProductService);
    });
});

describe('getCacheManager', () => {
    it('returns the same instance on every call', () => {
        const factory = new DefaultServiceFactory({ sessionData });

        expect(factory.getCacheManager()).toBe(factory.getCacheManager());
    });
});

describe('constructor apiClient wiring', () => {
    it('creates DefaultApiClient from sessionData when no apiClient override is provided', () => {
        const apiClientSpy = vi.spyOn(DefaultApiClientModule, 'DefaultApiClient');

        new DefaultServiceFactory({ sessionData });

        expect(apiClientSpy).toHaveBeenCalledWith(
            sessionData.clientApiUrl,
            sessionData.customerId,
            sessionData.clientSessionId,
            undefined,
        );
    });

    it('uses provided apiClient for all created services', () => {
        const mockApiClient = mock<ApiClient>();
        const encryptionSpy = vi.spyOn(DefaultEncryptionServiceModule, 'DefaultEncryptionService');
        const clientSpy = vi.spyOn(DefaultClientServiceModule, 'DefaultClientService');
        const productSpy = vi.spyOn(DefaultPaymentProductServiceModule, 'DefaultPaymentProductService');

        new DefaultServiceFactory({ sessionData, apiClient: mockApiClient });

        expect(encryptionSpy.mock.calls[0][2]).toBe(mockApiClient);
        expect(clientSpy.mock.calls[0][1]).toBe(mockApiClient);
        expect(productSpy.mock.calls[0][1]).toBe(mockApiClient);
    });
});

describe('constructor paymentProductFactory wiring', () => {
    it('creates DefaultPaymentProductFactory when no override is provided', () => {
        const factorySpy = vi.spyOn(DefaultPaymentProductFactoryModule, 'DefaultPaymentProductFactory');

        new DefaultServiceFactory({ sessionData });

        expect(factorySpy).toHaveBeenCalledTimes(1);
        expect(factorySpy).toHaveBeenCalledWith();
    });

    it('uses provided paymentProductFactory when creating payment product service', () => {
        const mockFactory = mock<PaymentProductFactory>();
        const productSpy = vi.spyOn(DefaultPaymentProductServiceModule, 'DefaultPaymentProductService');

        new DefaultServiceFactory({ sessionData, paymentProductFactory: mockFactory });

        expect(productSpy.mock.calls[0][2]).toBe(mockFactory);
    });
});

describe('constructor CacheManager sharing', () => {
    it('passes the same CacheManager instance to all default services', () => {
        const encryptionSpy = vi.spyOn(DefaultEncryptionServiceModule, 'DefaultEncryptionService');
        const clientSpy = vi.spyOn(DefaultClientServiceModule, 'DefaultClientService');
        const productSpy = vi.spyOn(DefaultPaymentProductServiceModule, 'DefaultPaymentProductService');

        const factory = new DefaultServiceFactory({ sessionData });
        const cacheManager = factory.getCacheManager();

        expect(encryptionSpy.mock.calls[0][1]).toBe(cacheManager);
        expect(clientSpy.mock.calls[0][0]).toBe(cacheManager);
        expect(productSpy.mock.calls[0][0]).toBe(cacheManager);
    });
});

// ─── getClickToPayService ─────────────────────────────────────────────────────

describe('getClickToPayService', () => {
    const context: PaymentContextWithAmount = {
        countryCode: 'NL',
        amountOfMoney: { amount: 1000, currencyCode: 'EUR' },
    };

    it('returns injected ClickToPayService when provided in constructor', async () => {
        const mockC2PService = mock<ClickToPayService>();
        const factory = new DefaultServiceFactory({ sessionData, clickToPayService: mockC2PService });

        const result = await factory.getClickToPayService(context);

        expect(result).toBe(mockC2PService);
    });

    it('fetches product 5002 from PaymentProductService', async () => {
        const mockProductService = mock<PaymentProductService>();
        const specificData = new PaymentProduct5002SpecificData({
            mastercard: { srcInitiatorId: 'init', srciDpaId: 'dpa' },
        });
        const mockProduct = mock<PaymentProduct>();

        (mockProduct as any).paymentProduct5002SpecificData = specificData;
        mockProductService.getPaymentProduct.mockResolvedValue(mockProduct);

        const factory = new DefaultServiceFactory({ sessionData, paymentProductService: mockProductService });

        await factory.getClickToPayService(context);

        expect(mockProductService.getPaymentProduct).toHaveBeenCalledWith(5002, context);
    });

    it('returns a NetceteraClickToPayService when product 5002 has specificData', async () => {
        const mockProductService = mock<PaymentProductService>();
        const specificData = new PaymentProduct5002SpecificData({
            mastercard: { srcInitiatorId: 'init', srciDpaId: 'dpa' },
        });
        const mockProduct = mock<PaymentProduct>();

        (mockProduct as any).paymentProduct5002SpecificData = specificData;
        mockProductService.getPaymentProduct.mockResolvedValue(mockProduct);

        const factory = new DefaultServiceFactory({ sessionData, paymentProductService: mockProductService });

        const result = await factory.getClickToPayService(context);

        expect(result).toBeInstanceOf(NetceteraClickToPayService);
    });

    it('passes config to the provider when provided', async () => {
        const mockProductService = mock<PaymentProductService>();
        const specificData = new PaymentProduct5002SpecificData({
            mastercard: { srcInitiatorId: 'init', srciDpaId: 'dpa' },
        });
        const mockProduct = mock<PaymentProduct>();

        (mockProduct as any).paymentProduct5002SpecificData = specificData;
        mockProductService.getPaymentProduct.mockResolvedValue(mockProduct);

        const factory = new DefaultServiceFactory({ sessionData, paymentProductService: mockProductService });

        // Should not throw — config is passed through without error
        await expect(factory.getClickToPayService(context, { locale: 'nl_NL' })).resolves.toBeInstanceOf(
            NetceteraClickToPayService,
        );
    });

    it('throws ConfigurationError when product 5002 has no specificData', async () => {
        const mockProductService = mock<PaymentProductService>();
        const mockProduct = mock<PaymentProduct>();

        (mockProduct as any).paymentProduct5002SpecificData = undefined;
        mockProductService.getPaymentProduct.mockResolvedValue(mockProduct);

        const factory = new DefaultServiceFactory({ sessionData, paymentProductService: mockProductService });

        await expect(factory.getClickToPayService(context)).rejects.toBeInstanceOf(ConfigurationError);
    });
});
