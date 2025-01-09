import { beforeEach, describe, expect, it } from 'vitest';

import { PaymentRequest } from '../../PaymentRequest';
import { Encryptor } from '../../Encryptor';
import { PaymentProduct } from '../../models/PaymentProduct';

import { cardPaymentProductJson } from '../__fixtures__/payment-products-json';
import { publicKeyResponse } from '../__fixtures__/public-key-response';
import { cardNumberFieldJson } from '../__fixtures__/payment-product-fields-json';

const paymentProduct = new PaymentProduct({
    ...cardPaymentProductJson,
    fields: [cardNumberFieldJson],
});

const encryptor = new Encryptor(Promise.resolve(publicKeyResponse), 'sessionId');

describe('encrypt', () => {
    let request: PaymentRequest;
    beforeEach(() => {
        request = new PaymentRequest();
    });

    it('should reject with correct response when no product is provided', async () => {
        await expect(encryptor.encrypt(request)).rejects.toThrow('No `paymentProduct` set');
    });

    it('should reject with correct response when invalid request is provided', async () => {
        request.setPaymentProduct(paymentProduct);
        request.setValue(cardNumberFieldJson.id, '4567350000427978');
        await expect(encryptor.encrypt(request)).rejects.toEqual(['luhn']);
    });

    it('should resolve with correct response when valid request is provided', async () => {
        request.setPaymentProduct(paymentProduct);
        request.setValue(cardNumberFieldJson.id, '4567350000427977');

        const encryptedString = await encryptor.encrypt(request);
        const parts = encryptedString.split('.');
        expect(parts.length).toBe(5);

        // the header can be checked at this point, the rest is binary data
        const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
        expect(header).toStrictEqual({
            alg: 'RSA-OAEP',
            enc: 'A256CBC-HS512',
            kid: publicKeyResponse.keyId,
        });
    });
});
