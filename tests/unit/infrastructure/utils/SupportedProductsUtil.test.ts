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

import { afterEach, describe, expect, it } from 'vitest';
import { SupportedProductsUtil } from '../../../../src/infrastructure/utils/SupportedProductsUtil';
import { basePaymentProductJson } from '../../../__fixtures__/base-payment-product-json';

const supportedProduct = { ...basePaymentProductJson, id: 1 };
const browserUnsupportedProduct = { ...basePaymentProductJson, id: 302 };
const sdkUnsupportedProduct = { ...basePaymentProductJson, id: 117 };

afterEach(() => {
    SupportedProductsUtil.browserUnsupportedProducts = [];
});

describe('isSupportedInBrowser', () => {
    it('returns true when the product id is not in the browser unsupported list', () => {
        expect(SupportedProductsUtil.isSupportedInBrowser(1)).toBe(true);
    });

    it('returns false when the product id is in the browser unsupported list', () => {
        SupportedProductsUtil.browserUnsupportedProducts = [302];

        expect(SupportedProductsUtil.isSupportedInBrowser(302)).toBe(false);
    });
});

describe('isSupportedInSdk', () => {
    it('returns true when the product id is not in the sdk unsupported list', () => {
        expect(SupportedProductsUtil.isSupportedInSdk(1)).toBe(true);
    });

    it('returns false for known SDK-unsupported product ids', () => {
        expect(SupportedProductsUtil.isSupportedInSdk(117)).toBe(false);
        expect(SupportedProductsUtil.isSupportedInSdk(5700)).toBe(false);
        expect(SupportedProductsUtil.isSupportedInSdk(5772)).toBe(false);
        expect(SupportedProductsUtil.isSupportedInSdk(5784)).toBe(false);
    });
});

describe('filterOutBrowserUnsupportedProducts', () => {
    it('removes products from the dto whose id is in the browser unsupported list', () => {
        SupportedProductsUtil.browserUnsupportedProducts = [302];
        const dto = { paymentProducts: [browserUnsupportedProduct, supportedProduct] };

        SupportedProductsUtil.filterOutBrowserUnsupportedProducts(dto);

        expect(dto.paymentProducts).toHaveLength(1);
        expect(dto.paymentProducts[0].id).toBe(1);
    });

    it('does nothing when the dto has no paymentProducts array', () => {
        const dto: { paymentProducts?: (typeof supportedProduct)[] } = {};

        expect(() => SupportedProductsUtil.filterOutBrowserUnsupportedProducts(dto)).not.toThrow();
        expect(dto.paymentProducts).toBeUndefined();
    });
});

describe('filterOutSdkUnsupportedProducts', () => {
    it('removes products from the dto whose id is in the sdk unsupported list', () => {
        const dto = { paymentProducts: [sdkUnsupportedProduct, supportedProduct] };

        SupportedProductsUtil.filterOutSdkUnsupportedProducts(dto);

        expect(dto.paymentProducts).toHaveLength(1);
        expect(dto.paymentProducts[0].id).toBe(1);
    });

    it('does nothing when the dto has no paymentProducts array', () => {
        const dto: { paymentProducts?: (typeof supportedProduct)[] } = {};

        expect(() => SupportedProductsUtil.filterOutSdkUnsupportedProducts(dto)).not.toThrow();
        expect(dto.paymentProducts).toBeUndefined();
    });
});

describe('get404Error', () => {
    it('returns an ErrorResponse with status 404, error code 1007, and property name productId', () => {
        const error = SupportedProductsUtil.get404Error();

        expect(error.errors[0].httpStatusCode).toBe(404);
        expect(error.errors[0].errorCode).toBe('1007');
        expect(error.errors[0].propertyName).toBe('productId');
    });
});
