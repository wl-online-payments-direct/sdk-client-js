import { ApplePay, type BasicPaymentProducts, ResponseError } from '../dataModel';
import type { PaymentProductFactory } from '../infrastructure/interfaces/PaymentProductFactory';
import type { PaymentProduct } from '../domain/paymentProduct/PaymentProduct';
import type { ApiClient } from '../infrastructure/interfaces/ApiClient';
import {
    type PaymentContext,
    type PaymentProductJson,
    type PaymentProductNetworksResponseJson,
    type PaymentProductsJson,
} from '../types';
import type { CacheManager } from '../infrastructure/utils/CacheManager';
import type { PaymentProductService } from './interfaces/PaymentProductService';
import { SupportedProductsUtil } from '../infrastructure/utils/SupportedProductsUtil';

export class DefaultPaymentProductService implements PaymentProductService {
    constructor(
        private readonly cacheManager: CacheManager,
        private readonly apiClient: ApiClient,
        private readonly paymentProductFactory: PaymentProductFactory,
    ) {}

    async getBasicPaymentProducts(context: PaymentContext): Promise<BasicPaymentProducts> {
        const cacheKey = this.cacheManager.createCacheKeyFromContext({ context, prefix: 'getPaymentProducts' });

        if (this.cacheManager.has(cacheKey)) {
            return this.paymentProductFactory.createBasicPaymentProducts(this.cacheManager.get(cacheKey)!);
        }

        const response = await this.apiClient.getWithContext<PaymentProductsJson>('products', context, {
            useCacheBuster: true,
            queryParams: { hide: 'fields' },
        });

        if (!response.success) {
            throw new ResponseError(response, 'Could not fetch BasicPaymentProducts.');
        }

        SupportedProductsUtil.filterOutBrowserUnsupportedProducts(response.data);
        SupportedProductsUtil.filterOutSdkUnsupportedProducts(response.data);

        if (response.data.paymentProducts.length === 0) {
            throw new ResponseError({ status: 404, data: [], success: false }, 'No payment products available.');
        }

        this.cacheManager.set(cacheKey, response.data);
        this.filterApplePay(response.data);

        return this.paymentProductFactory.createBasicPaymentProducts(response.data);
    }

    async getPaymentProduct(paymentProductId: number, context: PaymentContext): Promise<PaymentProduct> {
        if (
            !SupportedProductsUtil.isSupportedInBrowser(paymentProductId) ||
            !SupportedProductsUtil.isSupportedInSdk(paymentProductId)
        ) {
            throw new ResponseError(
                { status: 404, data: SupportedProductsUtil.get404Error(), success: false },
                'Product not found or not available.',
            );
        }

        const cacheKey = this.cacheManager.createCacheKeyFromContext({
            context,
            prefix: `getPaymentProduct-${paymentProductId}`,
        });

        if (this.cacheManager.has(cacheKey)) {
            return this.paymentProductFactory.createPaymentProduct(this.cacheManager.get(cacheKey)!);
        }

        const response = await this.apiClient.getWithContext<PaymentProductJson & Partial<PaymentProductsJson>>(
            `products/${paymentProductId}`,
            context,
            {
                useCacheBuster: true,
            },
        );

        if (!response.success) {
            throw new ResponseError(response, `Failed to retrieve payment product ${paymentProductId}.`);
        }

        this.cacheManager.set(cacheKey, response.data);
        this.filterApplePay(response.data);

        return this.paymentProductFactory.createPaymentProduct(response.data);
    }

    async getPaymentProductNetworks(
        paymentProductId: number,
        context: PaymentContext,
    ): Promise<PaymentProductNetworksResponseJson> {
        const cacheKey = this.cacheManager.createCacheKeyFromContext({
            prefix: `paymentProductNetworks-${paymentProductId}`,
            context,
        });

        if (this.cacheManager.has(cacheKey)) {
            return this.cacheManager.get(cacheKey)!;
        }

        const response = await this.apiClient.getWithContext<PaymentProductNetworksResponseJson>(
            `products/${paymentProductId}/networks`,
            context,
        );

        if (!response.success) {
            throw new ResponseError(response, 'The input data provided is incorrect.');
        }

        this.cacheManager.set(cacheKey, response.data);

        return response.data;
    }

    private filterApplePay(json: Partial<PaymentProductsJson>) {
        if (ApplePay.isApplePayAvailable()) {
            return;
        }

        SupportedProductsUtil.browserUnsupportedProducts.push(SupportedProductsUtil.applePayPaymentProductId);
        SupportedProductsUtil.filterOutBrowserUnsupportedProducts(json);
    }
}
