import type { ErrorResponseJson, GetIINDetailsResponseJson, IinDetailJson, IinDetailsStatus } from '../../types';

export class IinDetailsResponse {
    readonly countryCode?: string;
    readonly paymentProductId?: number;
    readonly isAllowedInContext?: boolean;
    readonly coBrands?: IinDetailJson[];
    readonly status: IinDetailsStatus;

    constructor(status: IinDetailsStatus, Json?: GetIINDetailsResponseJson | ErrorResponseJson) {
        this.status = status;

        if (!Json) {
            return;
        }

        const parsed = Json as GetIINDetailsResponseJson;

        this.countryCode = parsed.countryCode;
        this.paymentProductId = parsed.paymentProductId;
        this.isAllowedInContext = parsed.isAllowedInContext;
        this.coBrands = parsed.coBrands;
    }
}
