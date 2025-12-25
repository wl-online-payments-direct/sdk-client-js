import type { AmountOfMoney } from './AmountOfMoney';

export interface PaymentContext {
    amountOfMoney: AmountOfMoney;
    countryCode: string;
    isRecurring?: boolean;
}

export type PaymentContextWithAmount = PaymentContext & {
    amountOfMoney: Omit<AmountOfMoney, 'amount'> & { amount: number };
};
