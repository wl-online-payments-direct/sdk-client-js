import type {
  ErrorResponseJSON,
  SurchargeCalculationResponseJSON,
  SurchargeJSON,
} from './types';

export class SurchargeCalculationResponse {
  readonly surcharges: SurchargeJSON[] = [];

  constructor(
    readonly json?: SurchargeCalculationResponseJSON | ErrorResponseJSON,
  ) {
    if (!json) return;

    // If the JSON is actually an ErrorResponseJSON,
    // these properties don't exist and the fields will remain undefined
    this.json = json as SurchargeCalculationResponseJSON;

    this.surcharges = this.json.surcharges;
  }
}
