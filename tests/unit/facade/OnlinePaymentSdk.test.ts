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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OnlinePaymentSdk } from '../../../src';
import type { ServiceFactory } from '../../../src/infrastructure/interfaces/ServiceFactory';
import type { EncryptionService } from '../../../src/services/interfaces/EncryptionService';
import type { PaymentProductService } from '../../../src/services/interfaces/PaymentProductService';
import type { ClientService } from '../../../src/services/interfaces/ClientService';
import {
    init,
    type PaymentContext,
    type PaymentContextWithAmount,
    type SdkConfiguration,
    type SessionData,
} from '../../../src';
import { DefaultClickToPayComponentBuilder } from '../../../src/facade/clickToPay/DefaultClickToPayComponentBuilder';
import { DefaultServiceFactory } from '../../../src/infrastructure/factories/DefaultServiceFactory';
import * as SessionDataNormalizerModule from '../../../src/facade/SessionDataNormalizer';
import type { ClickToPayService } from '../../../src/services/interfaces/ClickToPayService';

describe('OnlinePaymentSdk', () => {
    let sessionData: SessionData;
    let mockEncryptionService: EncryptionService;
    let mockPaymentProductService: PaymentProductService;
    let mockClientService: ClientService;
    let mockServiceFactory: ServiceFactory;
    let sdk: OnlinePaymentSdk;

    const createPaymentContext = (): PaymentContext => ({
        countryCode: 'NL',
        amountOfMoney: {
            amount: 1000,
            currencyCode: 'EUR',
        },
    });

    const createPaymentContextWithAmount = (): PaymentContextWithAmount => ({
        countryCode: 'NL',
        amountOfMoney: {
            amount: 1000,
            currencyCode: 'EUR',
        },
    });

    const createAmountOfMoney = () => ({
        amount: 1000,
        currencyCode: 'EUR',
    });

    const createCard = () => ({
        partialCreditCardNumber: '424242',
    });

    beforeEach(() => {
        sessionData = {
            clientSessionId: 'test-session-id',
            customerId: 'test-customer-id',
            clientApiUrl: 'https://api.example.com/client',
            assetUrl: 'https://assets.example.com',
        };

        mockEncryptionService = {
            getPublicKey: vi.fn(),
            encryptPaymentRequest: vi.fn(),
            encryptTokenRequest: vi.fn(),
        } as unknown as EncryptionService;

        mockPaymentProductService = {
            getBasicPaymentProducts: vi.fn(),
            getPaymentProduct: vi.fn(),
            getPaymentProductNetworks: vi.fn(),
        } as unknown as PaymentProductService;

        mockClientService = {
            getIinDetails: vi.fn(),
            getSurchargeCalculation: vi.fn(),
            getCurrencyConversionQuote: vi.fn(),
        } as unknown as ClientService;

        mockServiceFactory = {
            getEncryptionService: vi.fn().mockReturnValue(mockEncryptionService),
            getPaymentProductService: vi.fn().mockReturnValue(mockPaymentProductService),
            getClientService: vi.fn().mockReturnValue(mockClientService),
            getClickToPayService: vi.fn(),
        } as unknown as ServiceFactory;

        sdk = new OnlinePaymentSdk(sessionData, undefined, mockServiceFactory);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should create instance with session data', () => {
        expect(sdk).toBeInstanceOf(OnlinePaymentSdk);
    });

    it('should create instance when initializing SDK', () => {
        const sdk = init(sessionData);
        expect(sdk).toBeInstanceOf(OnlinePaymentSdk);
    });

    it('should create instance with session data and configuration', () => {
        const config: SdkConfiguration = {
            appIdentifier: 'TestApp',
        };
        const sdk = new OnlinePaymentSdk(sessionData, config, mockServiceFactory);
        expect(sdk).toBeInstanceOf(OnlinePaymentSdk);
    });

    it('should use DefaultServiceFactory when no factory is provided', () => {
        const encryptionSpy = vi.spyOn(DefaultServiceFactory.prototype, 'getEncryptionService');
        const paymentProductSpy = vi.spyOn(DefaultServiceFactory.prototype, 'getPaymentProductService');
        const clientSpy = vi.spyOn(DefaultServiceFactory.prototype, 'getClientService');

        new OnlinePaymentSdk(sessionData);

        expect(encryptionSpy).toHaveBeenCalled();
        expect(paymentProductSpy).toHaveBeenCalled();
        expect(clientSpy).toHaveBeenCalled();
    });

    it('should normalize session data before creating default factory', () => {
        const normalizeSpy = vi.spyOn(SessionDataNormalizerModule, 'normalize');

        new OnlinePaymentSdk(sessionData);

        expect(normalizeSpy).toHaveBeenCalledWith(sessionData);
    });

    it('should forward SdkConfiguration to DefaultServiceFactory', () => {
        const config: SdkConfiguration = { appIdentifier: 'MyApp/1.0' };
        const factoryConstructorSpy = vi.spyOn(DefaultServiceFactory.prototype, 'getEncryptionService');

        const sdkWithConfig = new OnlinePaymentSdk(sessionData, config);

        // Verify the sdk was created (factory was used)
        expect(sdkWithConfig).toBeInstanceOf(OnlinePaymentSdk);
        expect(factoryConstructorSpy).toHaveBeenCalled();
    });

    it('should create instance via init() with session data and configuration', () => {
        const config: SdkConfiguration = { appIdentifier: 'TestApp' };
        const sdk = init(sessionData, config);
        expect(sdk).toBeInstanceOf(OnlinePaymentSdk);
    });

    describe('getBasicPaymentProducts', () => {
        it('should delegate to payment product service', async () => {
            const paymentContext = createPaymentContext();

            const mockResponse = {
                paymentProducts: [],
                accountsOnFile: [],
            };
            vi.mocked(mockPaymentProductService.getBasicPaymentProducts).mockResolvedValue(mockResponse);

            const result = await sdk.getBasicPaymentProducts(paymentContext);

            expect(mockPaymentProductService.getBasicPaymentProducts).toHaveBeenCalledWith(paymentContext);
            expect(result).toEqual(mockResponse);
        });
    });

    describe('getPaymentProduct', () => {
        it('should delegate to payment product service', async () => {
            const paymentContext = createPaymentContext();

            const mockProduct = {} as any;
            vi.mocked(mockPaymentProductService.getPaymentProduct).mockResolvedValue(mockProduct);

            const result = await sdk.getPaymentProduct(1, paymentContext);

            expect(mockPaymentProductService.getPaymentProduct).toHaveBeenCalledWith(1, paymentContext);
            expect(result).toEqual(mockProduct);
        });

        it('should propagate rejection from payment product service', async () => {
            const error = new Error('API error');

            vi.mocked(mockPaymentProductService.getPaymentProduct).mockRejectedValue(error);

            const paymentContext = createPaymentContext();

            await expect(sdk.getPaymentProduct(1, paymentContext)).rejects.toBe(error);
        });
    });

    describe('getPaymentProductNetworks', () => {
        it('should delegate to payment product service', async () => {
            const paymentContext = createPaymentContext();

            const mockNetworks = { networks: [] } as any;
            vi.mocked(mockPaymentProductService.getPaymentProductNetworks).mockResolvedValue(mockNetworks);

            const result = await sdk.getPaymentProductNetworks(1, paymentContext);

            expect(mockPaymentProductService.getPaymentProductNetworks).toHaveBeenCalledWith(1, paymentContext);
            expect(result).toEqual(mockNetworks);
        });
    });

    describe('getSurchargeCalculation', () => {
        it('should delegate to client service with PartialCard', async () => {
            const amountOfMoney = createAmountOfMoney();
            const card = createCard();

            const mockResponse = {} as any;
            vi.mocked(mockClientService.getSurchargeCalculation).mockResolvedValue(mockResponse);

            const result = await sdk.getSurchargeCalculation(amountOfMoney, card);

            expect(mockClientService.getSurchargeCalculation).toHaveBeenCalledWith(amountOfMoney, card);
            expect(result).toEqual(mockResponse);
        });

        it('should delegate to client service with token string', async () => {
            const amountOfMoney = createAmountOfMoney();
            const token = 'token-abc-123';

            const mockResponse = {} as any;
            vi.mocked(mockClientService.getSurchargeCalculation).mockResolvedValue(mockResponse);

            const result = await sdk.getSurchargeCalculation(amountOfMoney, token);

            expect(mockClientService.getSurchargeCalculation).toHaveBeenCalledWith(amountOfMoney, token);
            expect(result).toEqual(mockResponse);
        });
    });

    describe('getCurrencyConversionQuote', () => {
        it('should delegate to client service with PartialCard', async () => {
            const amountOfMoney = createAmountOfMoney();
            const card = createCard();

            const mockResponse = {} as any;
            vi.mocked(mockClientService.getCurrencyConversionQuote).mockResolvedValue(mockResponse);

            const result = await sdk.getCurrencyConversionQuote(amountOfMoney, card);

            expect(mockClientService.getCurrencyConversionQuote).toHaveBeenCalledWith(amountOfMoney, card);
            expect(result).toEqual(mockResponse);
        });

        it('should delegate to client service with token string', async () => {
            const amountOfMoney = createAmountOfMoney();
            const token = 'token-abc-123';

            const mockResponse = {} as any;
            vi.mocked(mockClientService.getCurrencyConversionQuote).mockResolvedValue(mockResponse);

            const result = await sdk.getCurrencyConversionQuote(amountOfMoney, token);

            expect(mockClientService.getCurrencyConversionQuote).toHaveBeenCalledWith(amountOfMoney, token);
            expect(result).toEqual(mockResponse);
        });
    });

    describe('getIinDetails', () => {
        it('should delegate to client service', async () => {
            const partialCreditCardNumber = '424242';
            const paymentContext = createPaymentContextWithAmount();

            const mockResponse = {} as any;
            vi.mocked(mockClientService.getIinDetails).mockResolvedValue(mockResponse);

            const result = await sdk.getIinDetails(partialCreditCardNumber, paymentContext);

            expect(mockClientService.getIinDetails).toHaveBeenCalledWith(partialCreditCardNumber, paymentContext);
            expect(result).toEqual(mockResponse);
        });
    });

    describe('getPublicKey', () => {
        it('should delegate to encryption service', async () => {
            const mockKey = {} as any;
            vi.mocked(mockEncryptionService.getPublicKey).mockResolvedValue(mockKey);

            const result = await sdk.getPublicKey();

            expect(mockEncryptionService.getPublicKey).toHaveBeenCalled();
            expect(result).toEqual(mockKey);
        });

        it('should propagate rejection from encryption service', async () => {
            const error = new Error('Key error');

            vi.mocked(mockEncryptionService.getPublicKey).mockRejectedValue(error);

            await expect(sdk.getPublicKey()).rejects.toBe(error);
        });
    });

    describe('encryptPaymentRequest', () => {
        it('should delegate to encryption service', async () => {
            const mockRequest = {} as any;
            const mockEncrypted = { encryptedCustomerInput: 'encrypted', encodedClientMetaInfo: 'meta' };

            vi.mocked(mockEncryptionService.encryptPaymentRequest).mockResolvedValue(mockEncrypted);

            const result = await sdk.encryptPaymentRequest(mockRequest);

            expect(mockEncryptionService.encryptPaymentRequest).toHaveBeenCalledWith(mockRequest);
            expect(result).toEqual(mockEncrypted);
        });

        it('should propagate rejection from encryption service', async () => {
            const error = new Error('Encryption error');

            vi.mocked(mockEncryptionService.encryptPaymentRequest).mockRejectedValue(error);

            await expect(sdk.encryptPaymentRequest({} as any)).rejects.toBe(error);
        });
    });

    describe('encryptTokenRequest', () => {
        it('should delegate to encryption service', async () => {
            const mockRequest = {} as any;
            const mockEncrypted = { encryptedCustomerInput: 'encrypted', encodedClientMetaInfo: 'meta' };

            vi.mocked(mockEncryptionService.encryptTokenRequest).mockResolvedValue(mockEncrypted);

            const result = await sdk.encryptTokenRequest(mockRequest);

            expect(mockEncryptionService.encryptTokenRequest).toHaveBeenCalledWith(mockRequest);
            expect(result).toEqual(mockEncrypted);
        });
    });

    describe('clickToPay', () => {
        const createContext = (): PaymentContextWithAmount => ({
            countryCode: 'NL',
            amountOfMoney: { amount: 1000, currencyCode: 'EUR' },
        });

        const createMockC2PService = (): ClickToPayService => ({
            on: vi.fn().mockReturnThis(),
            mount: vi.fn().mockResolvedValue(undefined),
            unmount: vi.fn(),
            processManualCardEntry: vi
                .fn()
                .mockResolvedValue({ userAction: 'COMPLETE', checkoutResponseSignature: 'sig' }),
            processSavedCard: vi.fn(),
            displayClickToPayExplanationModal: vi.fn(),
            getComplianceResourceURLsForVisa: vi.fn(),
            getComplianceResourceURLsForMastercard: vi.fn(),
        });

        it('should return a DefaultClickToPayComponentBuilder synchronously without calling the service factory', () => {
            const context = createContext();

            const component = sdk.clickToPay(context);

            expect(component).toBeInstanceOf(DefaultClickToPayComponentBuilder);
            expect(mockServiceFactory.getClickToPayService).not.toHaveBeenCalled();
        });

        it('should delegate to the service factory with the given context and config on mount', async () => {
            document.body.innerHTML = '<div id="c2p-container"></div>';
            const context = createContext();
            const config = { locale: 'nl_NL' };
            const mockC2PService = createMockC2PService();

            vi.mocked(mockServiceFactory.getClickToPayService).mockResolvedValue(mockC2PService);

            const component = sdk.clickToPay(context).config(config);

            await component.mount('c2p-container');

            expect(mockServiceFactory.getClickToPayService).toHaveBeenCalledWith(context, config);
            expect(mockC2PService.mount).toHaveBeenCalledWith(document.getElementById('c2p-container'));
        });

        it('should propagate rejection from the service factory through mount', async () => {
            document.body.innerHTML = '<div id="c2p-container"></div>';
            const context = createContext();
            const error = new Error('factory error');

            vi.mocked(mockServiceFactory.getClickToPayService).mockRejectedValue(error);

            const component = sdk.clickToPay(context);

            await expect(component.mount('c2p-container')).rejects.toBe(error);
        });
    });
});
