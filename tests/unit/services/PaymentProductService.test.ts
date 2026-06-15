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

import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { basePaymentProductJson } from '../../__fixtures__/base-payment-product-json';
import { cardPaymentProductJson } from '../../__fixtures__/payment-product-json';

import { DefaultPaymentProductService } from '../../../src/services/DefaultPaymentProductService';
import { PaymentProduct } from '../../../src';
import { UrlUtil } from '../../../src/infrastructure/utils/UrlUtil';
import { SupportedProductsUtil } from '../../../src/infrastructure/utils/SupportedProductsUtil';
import type { PaymentProductService } from '../../../src/services/interfaces/PaymentProductService';
import { CacheManager } from '../../../src/infrastructure/utils/CacheManager';
import { TestApiClient } from '../testUtils/TestApiClient';
import { DefaultPaymentProductFactory } from '../../../src/infrastructure/factories/DefaultPaymentProductFactory';
import { BasicPaymentProducts, type PaymentContext, ResponseError, type SdkResponse } from '../../../src';
import type { BasicPaymentProductsDto } from '../../../src/infrastructure/apiModels/paymentProduct/BasicPaymentProductsDto';
import type { PaymentProductNetworksResponse } from '../../../src/domain/paymentProduct/PaymentProductNetworksResponse';
import { ApplePay } from '../../../src/services/models/ApplePay';

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

const products = { paymentProducts: [basePaymentProductJson] } as BasicPaymentProductsDto;
const paymentProductDto = cardPaymentProductJson;
const paymentProduct = new DefaultPaymentProductFactory().createPaymentProduct(paymentProductDto);
const networks = { networks: ['network'] } as PaymentProductNetworksResponse;

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
        basicPaymentProducts = new DefaultPaymentProductFactory().createBasicPaymentProducts(products);
    });

    it('returns from cache if present', async () => {
        vi.spyOn(DefaultPaymentProductFactory.prototype, 'createBasicPaymentProducts').mockReturnValue(
            basicPaymentProducts,
        );

        const cacheHasSpy = vi.spyOn(CacheManager.prototype, 'has').mockReturnValue(true);
        const cacheGetSpy = vi.spyOn(CacheManager.prototype, 'get').mockReturnValue(basicPaymentProducts);
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
        const [path, , options] = apiSpy.mock.calls[0];
        expect(path).toBe('products');
        expect(options).toMatchObject({ useCacheBuster: true, queryParams: { hide: 'fields' } });
        expect(SupportedProductsUtil.filterOutBrowserUnsupportedProducts).toHaveBeenCalledWith(products);
        expect(SupportedProductsUtil.filterOutSdkUnsupportedProducts).toHaveBeenCalledWith(products);
        expect(cacheSetSpy).toHaveBeenCalledWith(cacheKey, basicPaymentProducts);
        expect(result.paymentProducts).toEqual(basicPaymentProducts.paymentProducts);
    });

    it('filters out Apple Pay product when Apple Pay is not available', async () => {
        vi.spyOn(ApplePay, 'isApplePayAvailable').mockReturnValue(false);

        const applePayProduct = { ...basePaymentProductJson, id: SupportedProductsUtil.applePayPaymentProductId };
        const productsWithApplePay: BasicPaymentProductsDto = {
            paymentProducts: [{ ...basePaymentProductJson }, applePayProduct],
        };

        getTestApiSpy('getWithContext', productsWithApplePay);

        const result = await service.getBasicPaymentProducts(paymentContext);

        const ids = result.paymentProducts.map((p) => p.id);
        expect(ids).not.toContain(SupportedProductsUtil.applePayPaymentProductId);
        expect(ids).toContain(basePaymentProductJson.id);
    });

    it('throws an error if response is not 2xx codes', async () => {
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
            'Error while trying to fetch payment products.',
        );

        expect(apiSpy).toHaveBeenCalledTimes(1);
    });

    it('throws ResponseError when all products are filtered out after unsupported filtering', async () => {
        const productsClone = { ...products, paymentProducts: [...products.paymentProducts] };
        getTestApiSpy('getWithContext', productsClone);

        vi.mocked(SupportedProductsUtil.filterOutBrowserUnsupportedProducts).mockImplementation((dto) => {
            if (dto.paymentProducts) dto.paymentProducts = [];
        });

        const promise = service.getBasicPaymentProducts(paymentContext);

        await expect(promise).rejects.toThrow(ResponseError);
        await expect(promise).rejects.toThrow('No payment products available.');
    });
});

describe('getPaymentProductNetworks', () => {
    it('returns from cache if present', async () => {
        const cacheHasSpy = vi.spyOn(CacheManager.prototype, 'has').mockReturnValue(true);
        const cacheGetSpy = vi.spyOn(CacheManager.prototype, 'get').mockReturnValue(networks);

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

    it('throws ResponseError when response is successful but has no data', async () => {
        getTestApiSpy('getWithContext', { success: true, status: 200, data: undefined }, true);

        const promise = service.getPaymentProductNetworks(1, paymentContext);

        await expect(promise).rejects.toThrow(ResponseError);
        await expect(promise).rejects.toThrow('Error while trying to fetch the payment product networks.');
    });

    it('throws ResponseError when API response is invalid', async () => {
        getTestApiSpy('getWithContext', { success: false, status: 400, data: undefined }, true);

        const promise = service.getPaymentProductNetworks(1, paymentContext);

        await expect(promise).rejects.toThrow(ResponseError);
        await expect(promise).rejects.toThrow('Error while trying to fetch the payment product networks.');
    });
});

describe('getPaymentProduct', () => {
    it('returns from cache if present', async () => {
        vi.spyOn(SupportedProductsUtil, 'isSupportedInBrowser').mockImplementation(() => true);
        vi.spyOn(SupportedProductsUtil, 'isSupportedInSdk').mockImplementation(() => true);

        const cacheHasSpy = vi.spyOn(CacheManager.prototype, 'has').mockReturnValue(true);
        const cacheGetSpy = vi.spyOn(CacheManager.prototype, 'get').mockReturnValue(paymentProduct);
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
        vi.spyOn(DefaultPaymentProductFactory.prototype, 'createPaymentProduct').mockReturnValue(paymentProduct);
        const apiSpy = getTestApiSpy('getWithContext', paymentProductDto);

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

    it('throws an error if Apple Pay is not available', async () => {
        vi.spyOn(SupportedProductsUtil, 'isSupportedInBrowser').mockReturnValue(true);
        vi.spyOn(SupportedProductsUtil, 'isSupportedInSdk').mockReturnValue(true);
        vi.spyOn(ApplePay, 'isApplePayAvailable').mockReturnValue(false);

        await expect(
            service.getPaymentProduct(SupportedProductsUtil.applePayPaymentProductId, paymentContext),
        ).rejects.toThrow('Product not found or not available.');
    });

    it('throws ResponseError when API response is invalid', async () => {
        vi.spyOn(SupportedProductsUtil, 'isSupportedInBrowser').mockReturnValue(true);
        vi.spyOn(SupportedProductsUtil, 'isSupportedInSdk').mockReturnValue(true);
        getTestApiSpy('getWithContext', { success: true, status: 200, data: undefined }, true);

        const promise = service.getPaymentProduct(1, paymentContext);

        await expect(promise).rejects.toThrow(ResponseError);
        await expect(promise).rejects.toThrow('Error while trying to fetch the payment product 1.');
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
