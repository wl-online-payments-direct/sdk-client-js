import { beforeEach, describe, expect, it } from 'vitest';

import { PaymentRequest } from '../../PaymentRequest';
import { Encryptor } from '../../Encryptor';
import { PaymentProduct } from '../../models/PaymentProduct';

import { cardPaymentProductJson } from '../__fixtures__/payment-products-json';
import { publicKeyResponse } from '../__fixtures__/public-key-response';
import { cardNumberFieldJson } from '../__fixtures__/payment-product-fields-json';
import { EncryptionError } from '../../models/errors/EncryptionError';
import { CreditCardTokenRequest } from '../../CreditCardTokenRequest';

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

    const encryptAndValidate = async (request: PaymentRequest) => {
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
    };

    it('should reject with correct response when invalid request is provided', async () => {
        request.setPaymentProduct(paymentProduct);
        request.setValue(cardNumberFieldJson.id, '4567350000427978');
        await expect(encryptor.encrypt(request)).rejects.toThrowError(
            new EncryptionError('Error encrypting payment request: the payment request is not valid.', ['luhn']),
        );
    });

    it('should resolve with correct response when valid request is provided', async () => {
        request.setPaymentProduct(paymentProduct);
        request.setValue(cardNumberFieldJson.id, '4567350000427977');

        await encryptAndValidate(request);
    });
});

describe('encryptTokenRequest', () => {
    let tokenRequest: CreditCardTokenRequest;
    beforeEach(() => {
        tokenRequest = new CreditCardTokenRequest();
    });

    const encryptAndValidate = async (tokenRequest: CreditCardTokenRequest) => {
        const encryptedString = await encryptor.encryptTokenRequest(tokenRequest);

        const parts = encryptedString.split('.');

        expect(parts.length).toBe(5);

        // the header can be checked at this point, the rest is binary data
        const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
        expect(header).toStrictEqual({
            alg: 'RSA-OAEP',
            enc: 'A256CBC-HS512',
            kid: publicKeyResponse.keyId,
        });
    };

    it('should reject with correct response when no paymentProductId is provided', async () => {
        tokenRequest.setCardholderName('Test');
        tokenRequest.setCardNumber('4242424242424242');
        tokenRequest.setExpiryDate('12/30');
        tokenRequest.setSecurityCode('123');

        await expect(encryptor.encryptTokenRequest(tokenRequest)).rejects.toThrowError(
            new EncryptionError('Error encrypting credit card token request: the payment product ID not set.', [
                'paymentProductId',
            ]),
        );
    });

    it('should resolve with correct response when token request is provided', async () => {
        tokenRequest.setCardholderName('Test');
        tokenRequest.setCardNumber('4242424242424242');
        tokenRequest.setExpiryDate('12/30');
        tokenRequest.setSecurityCode('123');
        tokenRequest.setProductPaymentId(paymentProduct.id);

        await encryptAndValidate(tokenRequest);
    });
});
