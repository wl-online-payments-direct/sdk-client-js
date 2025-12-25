import { IinDetailsResponse, InvalidArgumentError, ResponseError } from '../dataModel';
import type { ApiClient } from '../infrastructure/interfaces/ApiClient';
import {
    type AmountOfMoney,
    ApiVersion,
    type Card,
    type CurrencyConversionResponse,
    type GetIINDetailsRequestJson,
    type GetIINDetailsResponseJson,
    IinDetailsStatus,
    type PartialCard,
    type PaymentContext,
    type PaymentContextWithAmount,
    type SurchargeCalculationResponse,
    type SurchargeRequestJson,
    type Token,
} from '../types';
import type { CacheManager } from '../infrastructure/utils/CacheManager';
import type { ClientService } from './interfaces/ClientService';

export class DefaultClientService implements ClientService {
    constructor(
        private readonly cacheManager: CacheManager,
        private readonly apiClient: ApiClient,
    ) {}

    async getIinDetails(
        partialCreditCardNumber: string,
        context: PaymentContextWithAmount,
    ): Promise<IinDetailsResponse> {
        const cacheKey = `getIinDetails-${partialCreditCardNumber}`;

        // return a cached result if available
        if (this.cacheManager.has(cacheKey)) {
            return this.cacheManager.get<IinDetailsResponse>(cacheKey)!;
        }

        const number = this.formatPartialCreditCardNumber(partialCreditCardNumber);
        // validate if a credit card number has enough digits
        if (number.length < 6) {
            throw new InvalidArgumentError('Not enough digits in the credit card number. Minimum 6 digits required.', {
                data: new IinDetailsResponse(IinDetailsStatus.NOT_ENOUGH_DIGITS),
            });
        }

        const data = this.convertContextToIinDetailsContext(number, context);

        const response = await this.apiClient.post<GetIINDetailsResponseJson>('/getIINdetails', {
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new ResponseError(response, 'Error while trying to fetch IinDetails.');
        }

        const json = response.data;

        const iinDetailsResponse = new IinDetailsResponse(
            json.isAllowedInContext !== false ? IinDetailsStatus.SUPPORTED : IinDetailsStatus.EXISTING_BUT_NOT_ALLOWED,
            json,
        );
        this.cacheManager.set(cacheKey, iinDetailsResponse);

        return iinDetailsResponse;
    }

    async getSurchargeCalculation(
        amountOfMoney: AmountOfMoney,
        cardOrToken: PartialCard | Token,
    ): Promise<SurchargeCalculationResponse> {
        const cacheKeySuffix = this.getCacheKeySuffix(cardOrToken);
        const cacheKey = `getSurchargeCalculation-${amountOfMoney.amount}-${amountOfMoney.currencyCode}-${cacheKeySuffix}`;

        // return a cached result if available
        if (this.cacheManager.has(cacheKey)) {
            return this.cacheManager.get<SurchargeCalculationResponse>(cacheKey)!;
        }

        const cardSource = this.getCardSource(cardOrToken);

        // Create Surcharge Calculation Request POST body
        const requestJson: SurchargeRequestJson = {
            cardSource,
            amountOfMoney,
        };

        const response = await this.apiClient.post<SurchargeCalculationResponse>('services/surchargeCalculation', {
            body: JSON.stringify(requestJson),
        });

        if (!response.success) {
            throw new ResponseError(response, 'Something went wrong while trying to fetch surcharge calculations.');
        }

        this.cacheManager.set<SurchargeCalculationResponse>(cacheKey, response.data);

        return response.data;
    }

    async getCurrencyConversionQuote(
        amountOfMoney: AmountOfMoney,
        cardOrToken: PartialCard | Token,
    ): Promise<CurrencyConversionResponse> {
        const cacheKeySuffix = this.getCacheKeySuffix(cardOrToken);
        const cacheKey = `getCurrencyConversionQuote-${amountOfMoney.amount}-${amountOfMoney.currencyCode}-${cacheKeySuffix}`;

        // return a cached result if available
        if (this.cacheManager.has(cacheKey)) {
            return this.cacheManager.get<CurrencyConversionResponse>(cacheKey)!;
        }

        const cardSource = this.getCardSource(cardOrToken);

        const transaction = {
            amount: amountOfMoney,
        };

        const response = await this.apiClient.post<CurrencyConversionResponse>(
            'services/dccrate',
            {
                body: JSON.stringify({
                    cardSource,
                    transaction,
                }),
            },
            ApiVersion.V2,
        );

        if (!response.success) {
            throw new ResponseError(response, 'Something went wrong while trying to fetch currency conversion.');
        }

        this.cacheManager.set<CurrencyConversionResponse>(cacheKey, response.data);

        return response.data;
    }

    private convertContextToIinDetailsContext(
        partialCreditCardNumber: string,
        context: PaymentContext,
    ): GetIINDetailsRequestJson {
        return { bin: partialCreditCardNumber, paymentContext: context };
    }

    /**
     * Determines if the given object is a PartialCard.
     * Used for Surcharge Calculation & Currency Conversion.
     *
     * @param {PartialCard | Token} cardOrToken - The object to check, which can either be a PartialCard or a Token.
     * @return {boolean} - Returns true if the provided object is a PartialCard, otherwise false.
     */
    private isPartialCard(cardOrToken: PartialCard | Token): cardOrToken is PartialCard {
        return typeof cardOrToken === 'object';
    }

    private getCacheKeySuffix(cardOrToken: PartialCard | Token): string {
        return this.isPartialCard(cardOrToken) ? cardOrToken.partialCreditCardNumber : cardOrToken;
    }

    private formatPartialCreditCardNumber(partialCreditCardNumber: string): string {
        const result = partialCreditCardNumber.replace(/\s/g, '');

        return result.length >= 8 ? result.substring(0, 8) : result.substring(0, 6);
    }

    /**
     * Retrieves the source object for the given card or token. If the input is a partial card,
     * it returns an object containing card details. If the input is a token, it returns an object
     * containing the token.
     *
     * @param {PartialCard | Token} cardOrToken - The partial card or token to extract the source from.
     * @return {{ card: Card } | { token: Token }} An object containing either the card details or the token.
     */
    private getCardSource(cardOrToken: PartialCard | Token): { card: Card } | { token: Token } {
        return this.isPartialCard(cardOrToken)
            ? {
                  card: {
                      cardNumber: cardOrToken.partialCreditCardNumber,
                      paymentProductId: cardOrToken.paymentProductId,
                  },
              }
            : { token: cardOrToken };
    }
}
