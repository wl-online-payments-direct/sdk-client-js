import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cardPaymentProductJson } from '../../../__fixtures__/payment-product-json';
import { cardNumberFieldJson } from '../../../__fixtures__/payment-product-field-json';
import { publicKeyResponse } from '../../../__fixtures__/public-key-response';
import { PaymentProduct } from '../../../../src/domain/paymentProduct/PaymentProduct';
import { PaymentRequest } from '../../../../src/domain/paymentRequest/PaymentRequest';
import { CreditCardTokenRequest } from '../../../../src/domain/paymentRequest/CreditCardTokenRequest';
import { Encryptor } from '../../../../src/infrastructure/encryption/Encryptor';

const paymentProduct = new PaymentProduct({
    ...cardPaymentProductJson,
    fields: [cardNumberFieldJson],
});

const encryptor = new Encryptor('sessionId');

afterEach(() => {
    vi.restoreAllMocks();
});

describe('encrypt', () => {
    let request: PaymentRequest;
    beforeEach(() => {
        request = new PaymentRequest(paymentProduct);
    });

    const encryptAndValidate = (request: PaymentRequest) => {
        const encryptedString = encryptor.encrypt(publicKeyResponse, request);

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

    it('should resolve with correct response when valid request is provided', () => {
        request.setValue(cardNumberFieldJson.id, '4567350000427977');

        encryptAndValidate(request);
    });
});

describe('encryptTokenRequest', () => {
    let tokenRequest: CreditCardTokenRequest;
    beforeEach(() => {
        tokenRequest = new CreditCardTokenRequest();
    });

    const encryptAndValidate = (tokenRequest: CreditCardTokenRequest) => {
        const encryptedString = encryptor.encryptTokenRequest(publicKeyResponse, tokenRequest);

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

    it('should resolve with correct response when token request is provided', () => {
        tokenRequest.setCardholderName('Darwin Núñez');
        tokenRequest.setCardNumber('4242424242424242');
        tokenRequest.setExpiryDate('1230');
        tokenRequest.setSecurityCode('123');
        tokenRequest.setProductPaymentId(paymentProduct.id);

        encryptAndValidate(tokenRequest);
    });
});
