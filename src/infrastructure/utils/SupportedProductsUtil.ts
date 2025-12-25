import type { PaymentProductsJson } from '../../types';

const applePayPaymentProductId = 302;
const maestroPaymentProductId = 117;
const intersolvePaymentProductId = 5700;
const sodexoSportAndCulturePaymentProductId = 5772;
const vvvGiftCardPaymentProductId = 5784;

export const SupportedProductsUtil = {
    applePayPaymentProductId: applePayPaymentProductId,
    browserUnsupportedProducts: [] as number[],
    sdkUnsupportedProducts: [
        maestroPaymentProductId,
        intersolvePaymentProductId,
        sodexoSportAndCulturePaymentProductId,
        vvvGiftCardPaymentProductId,
    ],

    isSupportedInBrowser(id: number): boolean {
        return !this.browserUnsupportedProducts.includes(id);
    },

    isSupportedInSdk(id: number): boolean {
        return !this.sdkUnsupportedProducts.includes(id);
    },

    filterOutBrowserUnsupportedProducts<Json extends Partial<PaymentProductsJson>>(json: Json) {
        if (!json.paymentProducts) {
            return;
        }

        json.paymentProducts = json.paymentProducts.filter(({ id }) => this.isSupportedInBrowser(id));
    },

    filterOutSdkUnsupportedProducts<Json extends Partial<PaymentProductsJson>>(json: Json) {
        if (!json.paymentProducts) {
            return;
        }

        json.paymentProducts = json.paymentProducts.filter(({ id }) => this.isSupportedInSdk(id));
    },

    get404Error() {
        return {
            errorId: '48b78d2d-1b35-4f8b-92cb-57cc2638e901',
            errors: [
                {
                    code: '1007',
                    propertyName: 'productId',
                    message: 'UNKNOWN_PRODUCT_ID',
                    httpStatusCode: 404,
                },
            ],
        };
    },
};
