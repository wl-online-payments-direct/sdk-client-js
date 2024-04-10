import type { SurchargeCalculationResponse } from '../../types';
import { getEnvVar } from '../integration/utils';

const productIdWithSurcharge = getEnvVar(
  'VITE_PRODUCT_ID_WITH_SURCHARGE_CURRENCY_CONVERSION',
);
const productIdWithoutSurcharge = getEnvVar(
  'VITE_PRODUCT_ID_WITHOUT_SURCHARGE_CURRENCY_CONVERSION',
);
const productTypeId = getEnvVar(
  'VITE_PRODUCT_TYPE_ID_SURCHARGE_CURRENCY_CONVERSION',
);
const productTypeVersion = getEnvVar(
  'VITE_PRODUCT_TYPE_VERSION_SURCHARGE_CURRENCY_CONVERSION',
);

export const withSurchargeCalculationResponse: SurchargeCalculationResponse = {
  surcharges: [
    {
      paymentProductId: parseInt(productIdWithSurcharge),
      result: 'OK',
      netAmount: {
        amount: 1000,
        currencyCode: 'EUR',
      },
      surchargeAmount: {
        amount: 366,
        currencyCode: 'EUR',
      },
      totalAmount: {
        amount: 1366,
        currencyCode: 'EUR',
      },
      surchargeRate: {
        surchargeProductTypeId: productTypeId,
        surchargeProductTypeVersion: productTypeVersion,
        adValoremRate: 3.3,
        specificRate: 333,
      },
    },
  ],
};

export const withNoSurchargeCalculationResponse: SurchargeCalculationResponse =
  {
    surcharges: [
      {
        paymentProductId: parseInt(productIdWithoutSurcharge),
        result: 'NO_SURCHARGE',
        netAmount: {
          amount: 1000,
          currencyCode: 'EUR',
        },
        surchargeAmount: {
          amount: 0,
          currencyCode: 'EUR',
        },
        totalAmount: {
          amount: 1000,
          currencyCode: 'EUR',
        },
      },
    ],
  };
