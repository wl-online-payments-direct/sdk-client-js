import type {
    AmountOfMoney,
    CurrencyConversionResponse,
    PartialCard,
    PaymentContextWithAmount,
    SurchargeCalculationResponse,
    Token,
} from '../../types';
import { IinDetailsResponse } from '../../dataModel';

export interface ClientService {
    getIinDetails(partialCreditCardNumber: string, context: PaymentContextWithAmount): Promise<IinDetailsResponse>;

    getCurrencyConversionQuote(
        amountOfMoney: AmountOfMoney,
        cardOrToken: PartialCard | Token,
    ): Promise<CurrencyConversionResponse>;

    getSurchargeCalculation(
        amountOfMoney: AmountOfMoney,
        cardOrToken: PartialCard | Token,
    ): Promise<SurchargeCalculationResponse>;
}
