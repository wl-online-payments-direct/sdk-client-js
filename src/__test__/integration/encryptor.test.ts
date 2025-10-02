import { beforeEach, describe, expect, it } from 'vitest';

import { Session } from '../../Session';
import { Encryptor } from '../../Encryptor';
import { PaymentRequest } from '../../PaymentRequest';
import { paymentContextWithAmount } from '../__fixtures__/payment-context';
import { cardNumber } from '../__fixtures__/card-number';
import { getSessionDetails } from './setup';
import { createPaymentFromSdk, getEnvVar, getNetSpyMock } from './utils';
import { iinDetailsResponse } from '../__fixtures__/iin-details';
import { cardPaymentProductJson } from '../__fixtures__/payment-products-json';
import type {
    CreatePaymentResponse,
    PaymentErrorResponse,
} from 'onlinepayments-sdk-nodejs/lib/esm/src/generated/model/domain';

async function createEncryptedPayload(
    session: Session,
    { cardNumber, expiryDate }: { cardNumber: string; expiryDate: string },
) {
    const spy = getNetSpyMock('post', iinDetailsResponse);
    const { paymentProductId } = await session.getIinDetails(cardNumber, paymentContextWithAmount);
    spy.mockRestore();

    if (!paymentProductId) {
        throw new Error(`Can not get payment product id with card number "${cardNumber}"`);
    }

    const spyGet = getNetSpyMock('get', cardPaymentProductJson);
    const paymentProduct = await session.getPaymentProduct(paymentProductId, paymentContextWithAmount);
    spyGet.mockRestore();

    const paymentRequest = new PaymentRequest();
    paymentRequest.setPaymentProduct(paymentProduct);
    paymentRequest.setValue('cardNumber', cardNumber);
    paymentRequest.setValue('cardholderName', 'John Do');
    paymentRequest.setValue('cvv', '123');
    paymentRequest.setValue('expiryDate', expiryDate);

    if (!paymentRequest.isValid()) {
        throw new Error(`Errors found in ${paymentRequest.getErrorMessageIds()}`);
    }

    return await session.getEncryptor().encrypt(paymentRequest);
}

describe('session.getEncryptor', () => {
    let session: Session;
    beforeEach(() => {
        session = new Session(getSessionDetails());
    });

    it('should return an instance of `Encryptor`', () => {
        expect(session.getEncryptor()).toBeInstanceOf(Encryptor);
    });

    it('test can create payment with valid encrypted request', async () => {
        const expiryDate = Intl.DateTimeFormat('en-US', {
            month: '2-digit',
            year: 'numeric',
        }).format(new Date());
        const expectedDate = Intl.DateTimeFormat('en-US', {
            month: '2-digit',
            year: '2-digit',
        }).format(new Date());

        const encryptedCustomerInput = await createEncryptedPayload(session, {
            cardNumber,
            expiryDate,
        });

        const postData = {
            encryptedCustomerInput,
            order: {
                amountOfMoney: { amount: 1000, currencyCode: 'EUR' },
                customer: { billingAddress: { countryCode: 'BE' } },
            },
        };

        const response: CreatePaymentResponse | PaymentErrorResponse = await createPaymentFromSdk({
            merchantId: getEnvVar('VITE_ONLINEPAYMENTS_SDK_MERCHANT_ID'),
            postData,
        });

        const responseCard = response.payment?.paymentOutput?.cardPaymentMethodSpecificOutput?.card;

        expect(responseCard?.expiryDate).toBe(expectedDate.replace('/', ''));
        expect(responseCard?.cardNumber).toMatch(new RegExp(`${cardNumber.replace(/\s/g, '').slice(-4)}$`));
    });
});
