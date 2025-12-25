import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { basePaymentProductJson } from '../../__fixtures__/base-payment-product-json';
import { cardPaymentProductJson } from '../../__fixtures__/payment-product-json';
import type {
    PaymentContext,
    PaymentProductNetworksResponseJson,
    PaymentProductsJson,
    SdkResponse,
} from '../../../src/types';
import { BasicPaymentProducts } from '../../../src/dataModel';
import { DefaultPaymentProductService } from '../../../src/services/DefaultPaymentProductService';
import { PaymentProduct } from '../../../src/domain/paymentProduct/PaymentProduct';
import { UrlUtil } from '../../../src/infrastructure/utils/UrlUtil';
import { SupportedProductsUtil } from '../../../src/infrastructure/utils/SupportedProductsUtil';
import type { PaymentProductService } from '../../../src/services/interfaces/PaymentProductService';
import { CacheManager } from '../../../src/infrastructure/utils/CacheManager';
import { TestApiClient } from '../testUtils/TestApiClient';
import { DefaultPaymentProductFactory } from '../../../src/infrastructure/factories/DefaultPaymentProductFactory';

let service: PaymentProductService;

const paymentContext = {
    countryCode: 'NL',
    isRecurring: true,
    amountOfMoney: {
        amount: 100,
        currencyCode: 'EUR',
    },
} as PaymentContext;

const cacheKey = 'cache-key';

const products = { paymentProducts: [basePaymentProductJson] } as PaymentProductsJson;
const paymentProduct = cardPaymentProductJson;
const networks = { networks: ['network'] } as PaymentProductNetworksResponseJson;

let cacheSpy: Mock<
    ({ prefix, suffix, context }: { context: PaymentContext; prefix: string; suffix?: string }) => string
>;

beforeEach(() => {
    service = new DefaultPaymentProductService(
        new CacheManager(),
        new TestApiClient(),
        new DefaultPaymentProductFactory(),
    );

    vi.spyOn(UrlUtil, 'urlWithQueryString').mockReturnValue('https://mocked-url');
    cacheSpy = vi.spyOn(CacheManager.prototype, 'createCacheKeyFromContext').mockReturnValue(cacheKey);
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('getBasicPaymentProducts', () => {
    let basicPaymentProducts: BasicPaymentProducts;
    beforeEach(() => {
        vi.spyOn(SupportedProductsUtil, 'filterOutBrowserUnsupportedProducts').mockImplementation(() => {});
        vi.spyOn(SupportedProductsUtil, 'filterOutSdkUnsupportedProducts').mockImplementation(() => {});
        basicPaymentProducts = new BasicPaymentProducts(products);
    });

    it('returns from cache if present', async () => {
        vi.spyOn(DefaultPaymentProductFactory.prototype, 'createBasicPaymentProducts').mockReturnValue(
            basicPaymentProducts,
        );

        const cacheHasSpy = vi.spyOn(CacheManager.prototype, 'has').mockResolvedValue(true);
        const cacheGetSpy = vi.spyOn(CacheManager.prototype, 'get').mockResolvedValue(products);
        const result = await service.getBasicPaymentProducts(paymentContext);

        expect(cacheSpy).toHaveBeenCalledWith({
            context: paymentContext,
            prefix: 'getPaymentProducts',
        });

        expect(cacheHasSpy).toHaveBeenCalledWith(cacheKey);
        expect(cacheGetSpy).toHaveBeenCalledWith(cacheKey);
        expect(result.paymentProducts).toEqual(basicPaymentProducts.paymentProducts);
    });

    it('calls api, filters data, caches, and returns on cache miss', async () => {
        const cacheSetSpy = vi.spyOn(CacheManager.prototype, 'set');
        const apiSpy = getTestApiSpy('getWithContext', products);

        const result = await service.getBasicPaymentProducts(paymentContext);

        expect(apiSpy).toHaveBeenCalledTimes(1);
        expect(SupportedProductsUtil.filterOutBrowserUnsupportedProducts).toHaveBeenCalledWith(products);
        expect(SupportedProductsUtil.filterOutSdkUnsupportedProducts).toHaveBeenCalledWith(products);
        expect(cacheSetSpy).toHaveBeenCalledWith(cacheKey, products);
        expect(result.paymentProducts).toEqual(basicPaymentProducts.paymentProducts);
    });

    it('throws and error if response is not 2xx codes', async () => {
        const apiSpy = getTestApiSpy(
            'getWithContext',
            {
                success: false,
                data: {
                    errorId: '15eabcd5-30b3-479b-ae03-67bb351c07e6-00000092',
                    errors: [
                        {
                            errorCode: 50001130,
                            category: 'PAYMENT_PLATFORM_ERROR',
                            code: 50001130,
                            httpStatusCode: 404,
                            id: 'UNKNOWN_PAYMENT_ID',
                            message: 'Authorisation declined',
                            propertyName: 'paymentId',
                            retriable: true,
                        },
                    ],
                },
                status: 400,
            },
            true,
        );

        await expect(service.getBasicPaymentProducts(paymentContext)).rejects.toThrow(
            'Could not fetch BasicPaymentProducts.',
        );

        expect(apiSpy).toHaveBeenCalledTimes(1);
    });
});

describe('getPaymentProductNetworks', () => {
    it('returns from cache if present', async () => {
        cacheSpy = vi.spyOn(CacheManager.prototype, 'createCacheKeyFromContext');
        const cacheHasSpy = vi.spyOn(CacheManager.prototype, 'has').mockResolvedValue(true);
        const cacheGetSpy = vi.spyOn(CacheManager.prototype, 'get').mockResolvedValue(networks);

        const apiSpy = getTestApiSpy('getWithContext', {});
        const result = await service.getPaymentProductNetworks(1, paymentContext);

        expect(cacheSpy).toHaveBeenCalledWith({
            context: paymentContext,
            prefix: 'paymentProductNetworks-1',
        });

        expect(cacheHasSpy).toHaveBeenCalledWith(cacheKey);
        expect(cacheGetSpy).toHaveBeenCalledWith(cacheKey);
        expect(apiSpy).not.toHaveBeenCalled();
        expect(result).toBe(networks);
    });

    it('calls api, filters data, caches, and returns on cache miss', async () => {
        const cacheSetSpy = vi.spyOn(CacheManager.prototype, 'set');
        const apiSpy = getTestApiSpy('getWithContext', networks);

        const result = await service.getPaymentProductNetworks(1, paymentContext);

        expect(apiSpy).toHaveBeenCalledTimes(1);
        expect(cacheSetSpy).toHaveBeenCalledWith(cacheKey, networks);
        expect(result).toBe(networks);
    });
});

describe('getPaymentProduct', () => {
    it('returns from cache if present', async () => {
        vi.spyOn(SupportedProductsUtil, 'isSupportedInBrowser').mockImplementation(() => true);
        vi.spyOn(SupportedProductsUtil, 'isSupportedInSdk').mockImplementation(() => true);
        vi.spyOn(DefaultPaymentProductFactory.prototype, 'createPaymentProduct').mockReturnValue(
            new PaymentProduct(paymentProduct),
        );

        const cacheHasSpy = vi.spyOn(CacheManager.prototype, 'has').mockResolvedValue(true);
        const cacheGetSpy = vi.spyOn(CacheManager.prototype, 'get').mockResolvedValue(paymentProduct);
        const apiSpy = getTestApiSpy('getWithContext', {});

        const result = await service.getPaymentProduct(1, paymentContext);

        expect(cacheSpy).toHaveBeenCalledWith({
            context: paymentContext,
            prefix: 'getPaymentProduct-1',
        });

        expect(cacheHasSpy).toHaveBeenCalledWith(cacheKey);
        expect(cacheGetSpy).toHaveBeenCalledWith(cacheKey);
        expect(apiSpy).not.toHaveBeenCalled();

        expect(result).toBeInstanceOf(PaymentProduct);
        expect(result.id).toBe(1);
        expect(result.getFields().length).toBe(4);
    });

    it('calls api, filters data, caches, and returns on cache miss for payment product', async () => {
        vi.spyOn(SupportedProductsUtil, 'isSupportedInBrowser');
        vi.spyOn(SupportedProductsUtil, 'isSupportedInSdk');
        const cacheSetSpy = vi.spyOn(CacheManager.prototype, 'set');
        vi.spyOn(DefaultPaymentProductFactory.prototype, 'createPaymentProduct').mockReturnValue(
            new PaymentProduct(paymentProduct),
        );
        const apiSpy = getTestApiSpy('getWithContext', paymentProduct);

        const result = await service.getPaymentProduct(1, paymentContext);

        expect(apiSpy).toHaveBeenCalledTimes(1);
        expect(SupportedProductsUtil.isSupportedInBrowser).toHaveBeenCalledWith(1);
        expect(SupportedProductsUtil.isSupportedInSdk).toHaveBeenCalledWith(1);
        expect(cacheSetSpy).toHaveBeenCalledWith(cacheKey, paymentProduct);
        expect(result).toBeInstanceOf(PaymentProduct);
        expect(result.id).toBe(1);
    });

    it('throws an error if product is not supported', async () => {
        vi.spyOn(SupportedProductsUtil, 'isSupportedInBrowser').mockImplementation(() => false);
        vi.spyOn(SupportedProductsUtil, 'isSupportedInSdk').mockImplementation(() => false);

        await expect(service.getPaymentProduct(1, paymentContext)).rejects.toThrow(
            'Product not found or not available.',
        );
    });
});

function getTestApiSpy<T>(method: 'get' | 'getWithContext', response: T | SdkResponse<T>, fullResponse = false) {
    return vi
        .spyOn(TestApiClient.prototype, method)
        .mockReturnValue(
            Promise.resolve(
                fullResponse ? (response as SdkResponse<T>) : { success: true, status: 200, data: response },
            ),
        );
}
