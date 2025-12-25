import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OnlinePaymentSdk } from '../../../src/facade/OnlinePaymentSdk';
import type { PaymentContext, SdkConfiguration, SessionData } from '../../../src/types';
import type { ServiceFactory } from '../../../src/infrastructure/interfaces/ServiceFactory';
import type { EncryptionService } from '../../../src/services/interfaces/EncryptionService';
import type { PaymentProductService } from '../../../src/services/interfaces/PaymentProductService';
import type { ClientService } from '../../../src/services/interfaces/ClientService';
import { init } from '../../../src';

describe('OnlinePaymentSdk', () => {
    let sessionData: SessionData;
    let mockEncryptionService: EncryptionService;
    let mockPaymentProductService: PaymentProductService;
    let mockClientService: ClientService;
    let mockServiceFactory: ServiceFactory;

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
        } as unknown as ServiceFactory;
    });

    it('should create instance with session data', () => {
        const sdk = new OnlinePaymentSdk(sessionData, undefined, mockServiceFactory);
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

    describe('getBasicPaymentProducts', () => {
        it('should delegate to payment product service', async () => {
            const sdk = new OnlinePaymentSdk(sessionData, undefined, mockServiceFactory);
            const paymentContext: PaymentContext = {
                countryCode: 'NL',
                amountOfMoney: {
                    amount: 1000,
                    currencyCode: 'EUR',
                },
            };

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
            const sdk = new OnlinePaymentSdk(sessionData, undefined, mockServiceFactory);
            const paymentContext: PaymentContext = {
                countryCode: 'NL',
                amountOfMoney: {
                    amount: 1000,
                    currencyCode: 'EUR',
                },
            };

            const mockProduct = {} as any;
            vi.mocked(mockPaymentProductService.getPaymentProduct).mockResolvedValue(mockProduct);

            const result = await sdk.getPaymentProduct(1, paymentContext);

            expect(mockPaymentProductService.getPaymentProduct).toHaveBeenCalledWith(1, paymentContext);
            expect(result).toEqual(mockProduct);
        });
    });

    describe('getPaymentProductNetworks', () => {
        it('should delegate to payment product service', async () => {
            const sdk = new OnlinePaymentSdk(sessionData, undefined, mockServiceFactory);
            const paymentContext: PaymentContext = {
                countryCode: 'NL',
                amountOfMoney: {
                    amount: 1000,
                    currencyCode: 'EUR',
                },
            };

            const mockNetworks = { networks: [] } as any;
            vi.mocked(mockPaymentProductService.getPaymentProductNetworks).mockResolvedValue(mockNetworks);

            const result = await sdk.getPaymentProductNetworks(1, paymentContext);

            expect(mockPaymentProductService.getPaymentProductNetworks).toHaveBeenCalledWith(1, paymentContext);
            expect(result).toEqual(mockNetworks);
        });
    });

    describe('getSurchargeCalculation', () => {
        it('should delegate to client service', async () => {
            const sdk = new OnlinePaymentSdk(sessionData, undefined, mockServiceFactory);
            const amountOfMoney = { amount: 1000, currencyCode: 'EUR' };
            const card = { partialCreditCardNumber: '424242' };

            const mockResponse = {} as any;
            vi.mocked(mockClientService.getSurchargeCalculation).mockResolvedValue(mockResponse);

            const result = await sdk.getSurchargeCalculation(amountOfMoney, card);

            expect(mockClientService.getSurchargeCalculation).toHaveBeenCalledWith(amountOfMoney, card);
            expect(result).toEqual(mockResponse);
        });
    });

    describe('getCurrencyConversionQuote', () => {
        it('should delegate to client service', async () => {
            const sdk = new OnlinePaymentSdk(sessionData, undefined, mockServiceFactory);
            const amountOfMoney = { amount: 1000, currencyCode: 'EUR' };
            const card = { partialCreditCardNumber: '424242' };

            const mockResponse = {} as any;
            vi.mocked(mockClientService.getCurrencyConversionQuote).mockResolvedValue(mockResponse);

            const result = await sdk.getCurrencyConversionQuote(amountOfMoney, card);

            expect(mockClientService.getCurrencyConversionQuote).toHaveBeenCalledWith(amountOfMoney, card);
            expect(result).toEqual(mockResponse);
        });
    });

    describe('getIinDetails', () => {
        it('should delegate to client service', async () => {
            const sdk = new OnlinePaymentSdk(sessionData, undefined, mockServiceFactory);
            const partialCardNumber = '424242';
            const paymentContext = {
                countryCode: 'NL',
                amountOfMoney: {
                    amount: 1000,
                    currencyCode: 'EUR',
                },
            };

            const mockResponse = {} as any;
            vi.mocked(mockClientService.getIinDetails).mockResolvedValue(mockResponse);

            const result = await sdk.getIinDetails(partialCardNumber, paymentContext);

            expect(mockClientService.getIinDetails).toHaveBeenCalledWith(partialCardNumber, paymentContext);
            expect(result).toEqual(mockResponse);
        });
    });

    describe('getPublicKey', () => {
        it('should delegate to encryption service', async () => {
            const sdk = new OnlinePaymentSdk(sessionData, undefined, mockServiceFactory);

            const mockKey = {} as any;
            vi.mocked(mockEncryptionService.getPublicKey).mockResolvedValue(mockKey);

            const result = await sdk.getPublicKey();

            expect(mockEncryptionService.getPublicKey).toHaveBeenCalled();
            expect(result).toEqual(mockKey);
        });
    });

    describe('encryptPaymentRequest', () => {
        it('should delegate to encryption service', async () => {
            const sdk = new OnlinePaymentSdk(sessionData, undefined, mockServiceFactory);
            const mockRequest = {} as any;
            const mockEncrypted = { encryptedCustomerInput: 'encrypted', encodedClientMetaInfo: 'meta' };

            vi.mocked(mockEncryptionService.encryptPaymentRequest).mockResolvedValue(mockEncrypted);

            const result = await sdk.encryptPaymentRequest(mockRequest);

            expect(mockEncryptionService.encryptPaymentRequest).toHaveBeenCalledWith(mockRequest);
            expect(result).toEqual(mockEncrypted);
        });
    });

    describe('encryptTokenRequest', () => {
        it('should delegate to encryption service', async () => {
            const sdk = new OnlinePaymentSdk(sessionData, undefined, mockServiceFactory);
            const mockRequest = {} as any;
            const mockEncrypted = { encryptedCustomerInput: 'encrypted', encodedClientMetaInfo: 'meta' };

            vi.mocked(mockEncryptionService.encryptTokenRequest).mockResolvedValue(mockEncrypted);

            const result = await sdk.encryptTokenRequest(mockRequest);

            expect(mockEncryptionService.encryptTokenRequest).toHaveBeenCalledWith(mockRequest);
            expect(result).toEqual(mockEncrypted);
        });
    });
});
