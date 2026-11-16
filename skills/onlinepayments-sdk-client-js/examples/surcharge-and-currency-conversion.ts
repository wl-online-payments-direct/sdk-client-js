import {
    ConversionResultType,
    SurchargeResult,
    type AccountOnFile,
    type AmountOfMoney,
    type DccProposal,
    type OnlinePaymentSdk,
    type PaymentContextWithAmount,
} from 'onlinepayments-sdk-client-js';
import type { CurrencyConversionChoice } from './merchant-backend';

// [START surcharge-calculation]
// Call once the card is known: either the digits entered so far plus the detected product id,
// or the selected account on file. Only the first 8 digits are sent: never send the complete card
// number, because this request is not encrypted and the first digits identify the brand and issuer.
export async function getSurcharge(
    sdk: OnlinePaymentSdk,
    paymentContext: PaymentContextWithAmount,
    card: { digits: string; paymentProductId: number } | { accountOnFile: AccountOnFile },
): Promise<{ surchargeAmount: AmountOfMoney; totalAmount: AmountOfMoney } | undefined> {
    const cardOrToken =
        'accountOnFile' in card
            ? card.accountOnFile.id // the token
            : { partialCreditCardNumber: card.digits.slice(0, 8), paymentProductId: card.paymentProductId };

    const response = await sdk.getSurchargeCalculation(paymentContext.amountOfMoney, cardOrToken);
    const surcharge = response.surcharges[0];

    if (surcharge.result === SurchargeResult.NO_SURCHARGE) {
        return undefined;
    }

    // Show both amounts to the customer before they pay.
    return { surchargeAmount: surcharge.surchargeAmount, totalAmount: surcharge.totalAmount };
}
// [END surcharge-calculation]

// [START currency-conversion]
export interface CurrencyConversionOffer {
    dccSessionId: string;
    proposal: DccProposal;
}

export async function getCurrencyConversionOffer(
    sdk: OnlinePaymentSdk,
    amountToPay: AmountOfMoney, // the order amount, or the surcharge's totalAmount when a surcharge applies
    card: { digits: string; paymentProductId: number } | { accountOnFile: AccountOnFile },
): Promise<CurrencyConversionOffer | undefined> {
    const cardOrToken =
        'accountOnFile' in card
            ? card.accountOnFile.id
            : { partialCreditCardNumber: card.digits.slice(0, 8), paymentProductId: card.paymentProductId };

    const response = await sdk.getCurrencyConversionQuote(amountToPay, cardOrToken);

    if (response.result.result !== ConversionResultType.Allowed) {
        return undefined; // no offer: pay in your currency, send no currency conversion data
    }

    // Show two options with the same size, colour and font: proposal.baseAmount (your currency) and
    // proposal.targetAmount (the card's currency), with proposal.rate (exchange rate and mark-up) and
    // proposal.disclaimerDisplay. Preselect neither option and do not ask a yes/no question: the
    // customer must actively choose one.
    return { dccSessionId: response.dccSessionId, proposal: response.proposal };
}
// [END currency-conversion]

// [START currency-conversion-choice]
// Call when the customer actively selects one of the two options. Pass the result to
// submitEncryptedPayment, also when the customer chose your currency. Once the customer chose your
// currency, do not offer the conversion again in this checkout.
export function chooseCurrency(offer: CurrencyConversionOffer, payInCardCurrency: boolean): CurrencyConversionChoice {
    return { dccSessionId: offer.dccSessionId, acceptedByUser: payInCardCurrency };
}
// [END currency-conversion-choice]
