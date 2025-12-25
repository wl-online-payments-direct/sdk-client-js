import { beforeEach, describe, expect, it } from 'vitest';
import { CreditCardTokenRequest } from '../../../../src';

describe('getValues', () => {
    let tokenRequest: CreditCardTokenRequest;
    beforeEach(() => {
        tokenRequest = new CreditCardTokenRequest();
    });

    it('should return empty object when no values are set', () => {
        expect(tokenRequest.getValues()).toEqual({});
    });

    it('should return all values', () => {
        tokenRequest.setCardNumber('4567350000427977');
        tokenRequest.setCardholderName('John Doe');
        tokenRequest.setExpiryDate('12/2030');
        tokenRequest.setSecurityCode('123');
        expect(tokenRequest.getValues()).toEqual({
            cardNumber: '4567350000427977',
            cardholderName: 'John Doe',
            expiryDate: '12/2030',
            cvv: '123',
        });
    });

    it('should include undefined values', () => {
        tokenRequest.setCardNumber('4567350000427977');
        tokenRequest.setExpiryDate(undefined);
        expect(tokenRequest.getValues()).toEqual({
            cardNumber: '4567350000427977',
            expiryDate: undefined,
        });
    });
});

describe('sets and gets individual fields', () => {
    let tokenRequest: CreditCardTokenRequest;
    beforeEach(() => {
        tokenRequest = new CreditCardTokenRequest();
    });

    it('should set card number', () => {
        tokenRequest.setCardNumber('4567350000427977');
        expect(tokenRequest.getCardNumber()).toEqual('4567350000427977');
    });

    it('should set cardholder name', () => {
        tokenRequest.setCardholderName('Test cardholder name');
        expect(tokenRequest.getCardholderName()).toEqual('Test cardholder name');
    });

    it('should set expiry date', () => {
        tokenRequest.setExpiryDate('12/2030');
        expect(tokenRequest.getExpiryDate()).toEqual('12/2030');
    });

    it('should set payment product ID', () => {
        tokenRequest.setProductPaymentId(1);
        expect(tokenRequest.getPaymentProductId()).toEqual(1);
    });

    it('should set security code', () => {
        tokenRequest.setSecurityCode('123');
        expect(tokenRequest.getSecurityCode()).toEqual('123');
    });
});
