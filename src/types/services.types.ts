import type { AmountOfMoneyJSON } from './payment-product.types';

export type IinDetailsStatus =
  | 'SUPPORTED'
  | 'EXISTING_BUT_NOT_ALLOWED'
  | 'UNSUPPORTED'
  | 'UNKNOWN'
  | 'NOT_ENOUGH_DIGITS';

// Surcharge / Currency Conversion request related
export interface PartialCard {
  partialCreditCardNumber: string;
  paymentProductId?: number;
}

export type Token = string;

// Surcharge request
export interface SurchargeRequestJSON {
  cardSource: { card: Card } | { token: Token };
  amountOfMoney: AmountOfMoneyJSON;
}

// Currency Conversion request
export interface CurrencyConversionRequest {
  cardSource: { card: Card } | { token: Token };
  transaction: TransactionAmount;
}

// Only for internal SDK use
interface Card {
  cardNumber: string;
  paymentProductId?: number;
}

interface TransactionAmount {
  amount: AmountOfMoneyJSON;
}

// Surcharge response related
export interface SurchargeCalculationResponse {
  surcharges: [SurchargeJSON];
}

export type SurchargeResult = 'OK' | 'NO_SURCHARGE';

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

// Currency Conversion response related
export interface CurrencyConversionResponse {
  docSessionId: string;
  result: CurrencyConversionResult;
  proposal: DccProposal;
}

export interface CurrencyConversionResult {
  result: ConversionResultType;
  resultReason?: string;
}

export const ConversionResultType = {
  Allowed: 'Allowed',
  InvalidCard: 'InvalidCard',
  InvalidMerchant: 'InvalidMerchant',
  NoRate: 'NoRate',
  NotAvailable: 'NotAvailable',
};

export type ConversionResultType =
  (typeof ConversionResultType)[keyof typeof ConversionResultType];

export interface DccProposal {
  baseAmount: AmountOfMoneyJSON;
  targetAmount: AmountOfMoneyJSON;
  rate: RateDetails;
  disclaimerReceipt?: string;
  disclaimerDisplay?: string;
}

export interface RateDetails {
  exchangeRate: number;
  invertedExchangeRate: number;
  markUpRate: number;
  quotationDateTime: string;
  source: string;
}
