import type {
  AmountOfMoneyJSON,
  SurchargeJSON,
  SurchargeRateJSON,
  SurchargeResult,
} from './types';

export class Surcharge {
  readonly paymentProductId: number;
  readonly result: SurchargeResult;
  readonly netAmount: AmountOfMoneyJSON;
  readonly surchargeAmount: AmountOfMoneyJSON;
  readonly totalAmount: AmountOfMoneyJSON;
  readonly surchargeRate?: SurchargeRateJSON;

  constructor(readonly json: SurchargeJSON) {
    this.paymentProductId = this.json.paymentProductId;
    this.result = this.json.result;
    this.netAmount = this.json.netAmount;
    this.surchargeAmount = this.json.surchargeAmount;
    this.totalAmount = this.json.totalAmount;
    this.surchargeRate = this.json.surchargeRate;
  }
}
