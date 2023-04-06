import type {
  ErrorResponseJSON,
  GetIINDetailsResponseJSON,
  IinDetailJSON,
  IinDetailsStatus,
} from './types';

export class IinDetailsResponse {
  readonly countryCode?: string;
  readonly paymentProductId?: number;
  readonly isAllowedInContext?: boolean;
  readonly coBrands?: IinDetailJSON[];

  constructor(
    readonly status: IinDetailsStatus,
    readonly json?: GetIINDetailsResponseJSON | ErrorResponseJSON,
  ) {
    if (!json) return;

    // If the JSON is actually an ErrorResponseJSON,
    // these properties don't exist and the fields will remain undefined
    this.json = json as GetIINDetailsResponseJSON;

    this.countryCode = this.json.countryCode;
    this.paymentProductId = this.json.paymentProductId;
    this.isAllowedInContext = this.json.isAllowedInContext;
    this.coBrands = this.json.coBrands;
  }
}
