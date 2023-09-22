import type { SurchargeCalculationResponseJSON } from '../../types';
import { getEnvVar } from '../integration/helper/env';

const productIdWithSurcharge = getEnvVar(
  'VITE_SURCHARGE_PRODUCT_ID_WITH_SURCHARGE',
);
const productIdWithoutSurcharge = getEnvVar(
  'VITE_SURCHARGE_PRODUCT_ID_WITHOUT_SURCHARGE',
);
const productTypeId = getEnvVar('VITE_SURCHARGE_PRODUCT_TYPE_ID');
const productTypeVersion = getEnvVar('VITE_SURCHARGE_PRODUCT_TYPE_VERSION');

export const withSurchargeCalculationResponseJson: SurchargeCalculationResponseJSON =
  {
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

export const withNoSurchargeCalculationResponseJson: SurchargeCalculationResponseJSON =
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
