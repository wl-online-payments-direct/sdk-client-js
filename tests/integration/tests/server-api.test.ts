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

import { beforeEach, describe, expect, it } from 'vitest';

import { cardNumber } from '../../__fixtures__/card_number';
import { cardPaymentProductJson } from '../../__fixtures__/payment-product-json';
import { getConfiguration, getSessionDetails } from '../setup';
import { createPaymentFromSdk, getEnvVar, getSessionFromSdk } from '../utils';
import { init, OnlinePaymentSdk, PaymentProduct, PaymentRequest } from '../../../src';
import { DefaultPaymentProductFactory } from '../../../src/infrastructure/factories/DefaultPaymentProductFactory';

const SDK_MERCHANT_ID = getEnvVar('VITE_ONLINEPAYMENTS_SDK_MERCHANT_ID');

describe('Server Api', () => {
    let session: OnlinePaymentSdk;
    let paymentProduct: PaymentProduct;

    beforeEach(() => {
        session = init(getSessionDetails(), getConfiguration());
        paymentProduct = new DefaultPaymentProductFactory().createPaymentProduct(cardPaymentProductJson);
    });

    it('Server Api session', async () => {
        const sessionDetails = await getSessionFromSdk({
            merchantId: SDK_MERCHANT_ID,
        });

        expect(sessionDetails).toBeDefined();
        expect(sessionDetails.customerId).toBeDefined();
        expect(sessionDetails.assetUrl).toBeDefined();
        expect(sessionDetails.clientSessionId).toBeDefined();
        expect(sessionDetails.clientApiUrl).toBeDefined();

        expect(typeof sessionDetails.customerId).toBe('string');
        expect(typeof sessionDetails.assetUrl).toBe('string');
        expect(typeof sessionDetails.clientSessionId).toBe('string');
        expect(typeof sessionDetails.clientApiUrl).toBe('string');

        expect(sessionDetails.customerId.length).toBeGreaterThan(0);
        expect(sessionDetails.assetUrl.length).toBeGreaterThan(0);
        expect(sessionDetails.clientSessionId.length).toBeGreaterThan(0);
        expect(sessionDetails.clientApiUrl.length).toBeGreaterThan(0);
    });

    it('Server Api signature generation', async () => {
        const request = new PaymentRequest(paymentProduct);

        request.getField('cardNumber').setValue(cardNumber);
        request.getField('cardholderName').setValue('Test cardholder name');
        request.getField('cvv').setValue('123');
        request.getField('expiryDate').setValue('12/2036');

        const encryptedData = await session.encryptPaymentRequest(request);

        expect(encryptedData.encryptedCustomerInput).toBeDefined();
        expect(typeof encryptedData.encryptedCustomerInput).toBe('string');
        expect(encryptedData.encryptedCustomerInput.split('.')).toHaveLength(5);

        const result = await createPaymentFromSdk(SDK_MERCHANT_ID, {
            encryptedCustomerInput: encryptedData.encryptedCustomerInput,
        });

        expect(result).toBeDefined();
        expect(result.creationOutput).toBeDefined();
        expect(result.payment).toBeDefined();
        expect(result.payment?.id).toBeDefined();
        expect(typeof result.payment?.id).toBe('string');
        expect(result.payment?.id.length).toBeGreaterThan(0);
    });
});
