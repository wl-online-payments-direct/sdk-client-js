/// <reference types="vite/client" />

export interface ImportMetaEnv {
    readonly VITE_ONLINEPAYMENTS_SDK_HOST?: string;
    readonly VITE_ONLINEPAYMENTS_SDK_API_ID?: string;
    readonly VITE_ONLINEPAYMENTS_SDK_API_SECRET?: string;
    readonly VITE_ONLINEPAYMENTS_SDK_MERCHANT_ID?: string;

    // the following environment variables are used in surcharge-calculation.test.ts and currency-conversion.test.ts
    // @fixme: Once the default demo merchant has been configured to support surcharge and currency conversion, these
    // environment variables can be removed
    readonly VITE_MERCHANT_SURCHARGE_CURRENCY_CONVERSION?: string;
    readonly VITE_MERCHANT_KEY_SURCHARGE_CURRENCY_CONVERSION?: string;
    readonly VITE_MERCHANT_SECRET_KEY_SURCHARGE_CURRENCY_CONVERSION?: string;
    readonly VITE_PARTIAL_CREDIT_CARD_NUMBER_WITH_SURCHARGE_CURRENCY_CONVERSION?: string;
    readonly VITE_CARD_TOKEN_WITH_SURCHARGE_CURRENCY_CONVERSION?: string;
    readonly VITE_PRODUCT_ID_WITH_SURCHARGE_CURRENCY_CONVERSION?: string;
    readonly VITE_PARTIAL_CREDIT_CARD_NUMBER_WITHOUT_SURCHARGE_CURRENCY_CONVERSION?: string;
    readonly VITE_PRODUCT_ID_WITHOUT_SURCHARGE_CURRENCY_CONVERSION?: string;
    readonly VITE_PRODUCT_TYPE_ID_SURCHARGE_CURRENCY_CONVERSION?: string;
    readonly VITE_PRODUCT_TYPE_VERSION_SURCHARGE_CURRENCY_CONVERSION?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
