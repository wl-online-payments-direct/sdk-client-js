import type { SurchargeRateJSON } from './types';

export class SurchargeRate {
  readonly surchargeProductTypeId: string;
  readonly surchargeProductTypeVersion: string;
  readonly adValoremRate: number;
  readonly specificRate: number;

  constructor(readonly json: SurchargeRateJSON) {
    this.surchargeProductTypeId = this.json.surchargeProductTypeId;
    this.surchargeProductTypeVersion = this.json.surchargeProductTypeVersion;
    this.adValoremRate = this.json.adValoremRate;
    this.specificRate = this.json.specificRate;
  }
}
