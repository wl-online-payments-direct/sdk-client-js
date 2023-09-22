import type { AmountOfMoneyJSON } from './payment-product.types';

export type IinDetailsStatus =
  | 'SUPPORTED'
  | 'EXISTING_BUT_NOT_ALLOWED'
  | 'UNSUPPORTED'
  | 'UNKNOWN'
  | 'NOT_ENOUGH_DIGITS';

// Surcharge request related
export interface PartialCard {
  partialCreditCardNumber: string;
  paymentProductId?: number;
}

// TODO Token? AccountOnFile? AccountOnFileToken?
export type Token = string;

// Surcharge response related
export type SurchargeResult = 'OK' | 'NO_SURCHARGE';

// Only for internal SDK use
interface Card {
  cardNumber: string;
  paymentProductId?: number;
}

export interface SurchargeCalculationRequestJSON {
  cardSource: { card: Card } | { token: Token };
  amountOfMoney: AmountOfMoneyJSON;
}

export interface SurchargeCalculationResponseJSON {
  surcharges: SurchargeJSON[];
}

export interface SurchargeJSON {
  paymentProductId: number;
  result: SurchargeResult;
  netAmount: AmountOfMoneyJSON;
  surchargeAmount: AmountOfMoneyJSON;
  totalAmount: AmountOfMoneyJSON;
  surchargeRate?: SurchargeRateJSON;
}

export interface SurchargeRateJSON {
  surchargeProductTypeId: string;
  surchargeProductTypeVersion: string;
  adValoremRate: number;
  specificRate: number;
}
