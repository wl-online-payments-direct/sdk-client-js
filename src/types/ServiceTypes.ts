import type { AmountOfMoney } from './context/AmountOfMoney';

export enum IinDetailsStatus {
    SUPPORTED = 'SUPPORTED',
    EXISTING_BUT_NOT_ALLOWED = 'EXISTING_BUT_NOT_ALLOWED',
    UNSUPPORTED = 'UNSUPPORTED',
    NOT_ENOUGH_DIGITS = 'NOT_ENOUGH_DIGITS',
    UNKNOWN = 'UNKNOWN',
}
// Surcharge / Currency Conversion request related
export interface PartialCard {
    partialCreditCardNumber: string;
    paymentProductId?: number;
}

export type Token = string;

// Surcharge request
export interface SurchargeRequestJson {
    cardSource: { card: Card } | { token: Token };
    amountOfMoney: AmountOfMoney;
}

// Currency Conversion request
export interface CurrencyConversionRequest {
    cardSource: { card: Card } | { token: Token };
    transaction: TransactionAmount;
}

export interface Card {
    cardNumber: string;
    paymentProductId?: number;
}

interface TransactionAmount {
    amount: AmountOfMoney;
}

// Surcharge response related
export interface SurchargeCalculationResponse {
    surcharges: [SurchargeJson];
}

export type SurchargeResult = 'OK' | 'NO_SURCHARGE';

export interface SurchargeJson {
    paymentProductId: number;
    result: SurchargeResult;
    netAmount: AmountOfMoney;
    surchargeAmount: AmountOfMoney;
    totalAmount: AmountOfMoney;
    surchargeRate?: SurchargeRateJson;
}

export interface SurchargeRateJson {
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

export type ConversionResultType = (typeof ConversionResultType)[keyof typeof ConversionResultType];

export interface DccProposal {
    baseAmount: AmountOfMoney;
    targetAmount: AmountOfMoney;
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
