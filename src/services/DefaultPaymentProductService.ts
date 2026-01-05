/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import type { PaymentProductFactory } from '../infrastructure/interfaces/PaymentProductFactory';
import type { PaymentProduct } from '../domain/paymentProduct/PaymentProduct';
import type { ApiClient } from '../infrastructure/interfaces/ApiClient';

import type { CacheManager } from '../infrastructure/utils/CacheManager';
import type { PaymentProductService } from './interfaces/PaymentProductService';
import { SupportedProductsUtil } from '../infrastructure/utils/SupportedProductsUtil';
import { BaseService } from './BaseService';
import { ApplePay } from './models/ApplePay';
import { BasicPaymentProducts, type PaymentContext, ResponseError } from '../domain';
import type { BasicPaymentProductsDto } from '../infrastructure/apiModels/paymentProduct/BasicPaymentProductsDto';
import type { PaymentProductDto } from '../infrastructure/apiModels/paymentProduct/PaymentProduct';
import type { PaymentProductNetworksResponse } from '../domain/paymentProduct/PaymentProductNetworksResponse';

export class DefaultPaymentProductService extends BaseService implements PaymentProductService {
    constructor(
        cacheManager: CacheManager,
        apiClient: ApiClient,
        private readonly paymentProductFactory: PaymentProductFactory,
    ) {
        super(cacheManager, apiClient);

        if (
            !ApplePay.isApplePayAvailable() &&
            !SupportedProductsUtil.browserUnsupportedProducts.includes(SupportedProductsUtil.applePayPaymentProductId)
        ) {
            SupportedProductsUtil.browserUnsupportedProducts.push(SupportedProductsUtil.applePayPaymentProductId);
        }
    }

    async getBasicPaymentProducts(context: PaymentContext): Promise<BasicPaymentProducts> {
        const cacheKey = this.cacheManager.createCacheKeyFromContext({ context, prefix: 'getPaymentProducts' });

        if (this.cacheManager.has(cacheKey)) {
            return this.cacheManager.get<BasicPaymentProducts>(cacheKey)!;
        }

        const response = await this.apiClient.getWithContext<BasicPaymentProductsDto>('products', context, {
            useCacheBuster: true,
            queryParams: { hide: 'fields' },
        });

        this.validateResponse(response, 'Error while trying to fetch payment products.');

        SupportedProductsUtil.filterOutBrowserUnsupportedProducts(response.data);
        SupportedProductsUtil.filterOutSdkUnsupportedProducts(response.data);

        if (response.data.paymentProducts.length === 0) {
            throw new ResponseError(SupportedProductsUtil.get404Error(), 404, 'No payment products available.');
        }

        const result = this.paymentProductFactory.createBasicPaymentProducts(response.data);
        this.cacheManager.set(cacheKey, result);

        return result;
    }

    async getPaymentProduct(paymentProductId: number, context: PaymentContext): Promise<PaymentProduct> {
        if (
            !SupportedProductsUtil.isSupportedInBrowser(paymentProductId) ||
            !SupportedProductsUtil.isSupportedInSdk(paymentProductId)
        ) {
            throw new ResponseError(SupportedProductsUtil.get404Error(), 404, 'Product not found or not available.');
        }

        const cacheKey = this.cacheManager.createCacheKeyFromContext({
            context,
            prefix: `getPaymentProduct-${paymentProductId}`,
        });

        if (this.cacheManager.has(cacheKey)) {
            return this.cacheManager.get<PaymentProduct>(cacheKey)!;
        }

        const response = await this.apiClient.getWithContext<PaymentProductDto>(
            `products/${paymentProductId}`,
            context,
            {
                useCacheBuster: true,
            },
        );

        this.validateResponse(response, `Error while trying to fetch the payment product ${paymentProductId}.`);

        const result = this.paymentProductFactory.createPaymentProduct(response.data);
        this.cacheManager.set(cacheKey, result);

        return result;
    }

    async getPaymentProductNetworks(
        paymentProductId: number,
        context: PaymentContext,
    ): Promise<PaymentProductNetworksResponse> {
        const cacheKey = this.cacheManager.createCacheKeyFromContext({
            prefix: `paymentProductNetworks-${paymentProductId}`,
            context,
        });

        if (this.cacheManager.has(cacheKey)) {
            return this.cacheManager.get<PaymentProductNetworksResponse>(cacheKey)!;
        }

        const response = await this.apiClient.getWithContext<PaymentProductNetworksResponse>(
            `products/${paymentProductId}/networks`,
            context,
        );

        this.validateResponse(response, 'Error while trying to fetch the payment product networks.');

        this.cacheManager.set(cacheKey, response.data);

        return response.data;
    }
}
