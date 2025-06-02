import type {
    ApplePayC2SCommunicator,
    ApplePayInitResult,
    ApplePayPaymentContext,
    ApplePayPaymentRequest,
} from '../types';

export class ApplePay {
    isApplePayAvailable(): boolean {
        return Object.hasOwn(window, 'ApplePaySession') && ApplePaySession.canMakePayments();
    }

    initPayment(
        context: ApplePayPaymentContext,
        c2SCommunicator: ApplePayC2SCommunicator,
    ): Promise<ApplePayInitResult> {
        return new Promise((resolve, reject) => {
            const countryCode = context.acquirerCountry ? context.acquirerCountry : context.countryCode;

            const payment: ApplePayPaymentRequest = {
                currencyCode: context.amountOfMoney.currencyCode,
                countryCode,
                total: {
                    label: context.displayName,
                    amount: (context.amountOfMoney.amount / 100).toString(),
                },
                supportedNetworks: context.networks,
                merchantCapabilities: ['supports3DS'],
            };

            const applePaySession = new ApplePaySession(1, payment);
            applePaySession.begin();

            const onError = (error: unknown) => {
                reject(error);
                applePaySession.abort();
            };

            applePaySession.onvalidatemerchant = (event) => {
                const sessionContext = {
                    displayName: context.displayName,
                    validationURL: event.validationURL,
                    domainName: window.location.hostname,
                };
                c2SCommunicator
                    .createPaymentProductSession(302, sessionContext)
                    .then(function ({ paymentProductSession302SpecificOutput }) {
                        try {
                            const merchantSession = JSON.parse(
                                paymentProductSession302SpecificOutput?.sessionObject as string,
                            );
                            applePaySession.completeMerchantValidation(merchantSession);
                        } catch (error) {
                            onError(error);
                        }
                    })
                    .catch(onError);
            };

            applePaySession.onpaymentauthorized = (event) => {
                const token = event.payment.token;
                const status = token ? ApplePaySession.STATUS_SUCCESS : ApplePaySession.STATUS_FAILURE;

                switch (status) {
                    case ApplePaySession.STATUS_SUCCESS:
                        resolve({ message: 'Payment authorized', data: token });
                        break;
                    case ApplePaySession.STATUS_FAILURE:
                        reject({ message: 'Error payment authorization' });
                        break;
                }

                applePaySession.completePayment(status);
            };
        });
    }
}
