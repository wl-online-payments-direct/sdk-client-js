import type { BasicPaymentProduct } from './BasicPaymentProduct';

export type BasicPaymentItem = BasicPaymentProduct;
export type BasicPaymentItemByIdMap = Record<string | number, BasicPaymentItem>;
