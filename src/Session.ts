// noinspection JSUnusedGlobalSymbols

import type {
    AmountOfMoneyJSON,
    CurrencyConversionResponse,
    PartialCard,
    PaymentContext,
    PaymentContextWithAmount,
    PaymentProductGroupJSON,
    PaymentProductJSON,
    PaymentProductNetworksResponseJSON,
    SessionDetails,
    SurchargeCalculationResponse,
    Token,
} from './types';
import type { IinDetailsResponse } from './models/IinDetailsResponse';
import type { PublicKeyResponse } from './models/PublicKeyResponse';
import { PaymentProduct } from './models/PaymentProduct';
import { BasicPaymentProducts } from './models/BasicPaymentProducts';
import { BasicPaymentItems } from './models/BasicPaymentItems';
import { Encryptor } from './Encryptor';
import { C2SCommunicator } from './utils/C2SCommunicator';
import { SessionConfiguration } from './utils/SessionConfiguration';

export class Session {
    readonly #sessionConfiguration: SessionConfiguration;
    readonly #c2sCommunicator: C2SCommunicator;

    #paymentProduct?: PaymentProduct;
    #paymentContext?: PaymentContext;

    /**
     * Constructs a new instance using session details and optional payment product information.
     *
     * @param {SessionDetails} sessionDetails - The session details required to initialize the session configuration.
     * @param {PaymentProductJSON|PaymentProductGroupJSON} [paymentProduct] - Optional payment product or payment
     *     product group information. If provided, this product (group) will always be used.
     */
    constructor(sessionDetails: SessionDetails, paymentProduct?: PaymentProductJSON | PaymentProductGroupJSON) {
        this.#sessionConfiguration = new SessionConfiguration(sessionDetails);
        this.#c2sCommunicator = new C2SCommunicator(this.#sessionConfiguration, paymentProduct);
    }

    /**
     * Fetches a list of basic payment products available for a given payment context.
     * The returned payment products are filtered based on the payment context details.
     *
     * @param {PaymentContext} paymentContext - An object containing payment-specific information
     * such as country code, currency, and amount for filtering applicable payment products.
     *
     * @return {Promise<BasicPaymentProducts>} A promise that resolves to a `BasicPaymentProducts` instance,
     * representing the available payment products for the provided context.
     */
    public async getBasicPaymentProducts(paymentContext: PaymentContext): Promise<BasicPaymentProducts> {
        const json = await this.#c2sCommunicator.getBasicPaymentProducts(paymentContext);

        this.#paymentContext = paymentContext;

        return new BasicPaymentProducts(json);
    }

    /**
     * Retrieve details of the payment products that are
     * configured for your account.
     *
     * @param {PaymentContext} paymentContext - The payment context
     */
    public async getBasicPaymentItems(paymentContext: PaymentContext): Promise<BasicPaymentItems> {
        const products = await this.getBasicPaymentProducts(paymentContext);

        return new BasicPaymentItems(products);
    }

    /**
     * Retrieve details of the payment products that are configured for your account.
     *
     * @param {number} paymentProductId The payment product id
     * @param {PaymentContext?} paymentContext The payment context
     * @return {Promise<PaymentProduct>} The requested payment product instance.
     * @throws {ResponseError} Throws a ResponseError when the specified payment product is not available.
     * @throws {Error} Throws an Error when the payment context is not provided here or in previous calls to other
     *      session methods.
     */
    public async getPaymentProduct(paymentProductId: number, paymentContext?: PaymentContext): Promise<PaymentProduct> {
        const context = this.#paymentContext || paymentContext;
        if (!context) {
            throw new Error('PaymentContext is not provided');
        }

        try {
            const response = await this.#c2sCommunicator.getPaymentProduct(paymentProductId, context);
            this.#paymentProduct = new PaymentProduct(response);

            return this.#paymentProduct;
        } catch (err) {
            this.#paymentProduct = undefined;
            throw err;
        }
    }

    /**
     * Returns verified data that we can process a card from a certain Issuer
     * (by looking up the first 6 or more digits) and what the
     * best card type would be, based on your configuration
     *
     * @param {string} partialCreditCardNumber The partial credit card number
     * @param {PaymentContextWithAmount | null} paymentContext The payment context
     * @return {Promise<IinDetailsResponse>} A promise resolving to an IinDetailsResponse object indicating the
     *      determination status and payment product details.
     * @throws {ResponseError} Throws a ResponseError when the specified payment product is not available or the request
     *      failed.
     */
    public async getIinDetails(
        partialCreditCardNumber: string,
        paymentContext?: PaymentContextWithAmount | null,
    ): Promise<IinDetailsResponse> {
        const context = this.#paymentContext || paymentContext;
        if (!context) {
            throw new Error('PaymentContext is not provided');
        }

        return this.#c2sCommunicator.getPaymentProductIdByCreditCardNumber(
            this.#_formatPartialCreditCardNumber(partialCreditCardNumber),
            context,
        );
    }

    /**
     * Retrieves the public key from the server.
     *
     * @return {Promise<PublicKeyResponse>}
     * @throws {ResponseError} Throws a ResponseError when the request failed.
     */
    public async getPublicKey(): Promise<PublicKeyResponse> {
        return this.#c2sCommunicator.getPublicKey();
    }

    /**
     * Returns lists of all the networks that can be used in the current payment context for a given payment product.
     *
     * @param {number} paymentProductId - The payment product id
     * @param {PaymentContext} paymentContext - The payment context
     * @return {Promise<PaymentProductNetworksResponseJSON>} A promise that resolves to a JSON object containing the list
     *     of networks that can be used in the current payment context for the specified payment product.
     * @throws {ResponseError} Throws a ResponseError when the request failed.
     */
    public async getPaymentProductNetworks(
        paymentProductId: number,
        paymentContext: PaymentContext,
    ): Promise<PaymentProductNetworksResponseJSON> {
        const paymentProductNetworks = await this.#c2sCommunicator.getPaymentProductNetworks(
            paymentProductId,
            paymentContext,
        );

        this.#paymentContext = paymentContext;

        return paymentProductNetworks;
    }

    /**
     * Returns the encryptor instance to encrypt data with a public key and session id.
     *
     * @return {Encryptor}
     */
    public getEncryptor(): Encryptor {
        return new Encryptor(this.#c2sCommunicator.getPublicKey(), this.#sessionConfiguration.clientSessionId);
    }

    /**
     * Returns the Surcharge Calculation for the provided amount of money and card
     *
     * @param {AmountOfMoneyJSON} amountOfMoney - Contains the amount and currency code for which the Surcharge should
     *   be calculated
     * @param {PartialCard | Token} cardOrToken - A {@link PartialCard} or a {@link Token} for which the Surcharge
     *     should be calculated
     * @return {Promise<SurchargeCalculationResponse>}
     * @throws {ResponseError} Throws a ResponseError when the request failed.
     */
    public async getSurchargeCalculation(
        amountOfMoney: AmountOfMoneyJSON,
        cardOrToken: PartialCard | Token,
    ): Promise<SurchargeCalculationResponse> {
        return this.#c2sCommunicator.getSurchargeCalculation(amountOfMoney, cardOrToken);
    }

    /**
     * Returns the Currency Conversion for the provided amount of money and card
     *
     * @param {AmountOfMoneyJSON} amountOfMoney - Contains the amount and currency code for which the Currency
     *   Conversion should be calculated
     * @param {PartialCard | Token} cardOrToken - A {@link PartialCard} or a {@link Token} for which the Currency
     *     Conversion should be calculated
     * @return {Promise<CurrencyConversionResponse>}
     * @throws {ResponseError} Throws a ResponseError when the request failed.
     */
    public async getCurrencyConversionQuote(
        amountOfMoney: AmountOfMoneyJSON,
        cardOrToken: PartialCard | Token,
    ): Promise<CurrencyConversionResponse> {
        return this.#c2sCommunicator.getCurrencyConversionQuote(amountOfMoney, cardOrToken);
    }

    /**
     * Formats a partial credit card number by removing spaces and limiting its length.
     *
     * @param {string} partialCreditCardNumber - The partial credit card number to format.
     * @return {string} The formatted partial credit card number with no spaces and a fixed length.
     */
    #_formatPartialCreditCardNumber(partialCreditCardNumber: string): string {
        const removeSpaces = (str: string) => str.replace(/\s/g, '');
        const toFixedLength = (str: string) => (str.length >= 8 ? str.substring(0, 8) : str.substring(0, 6));

        return toFixedLength(removeSpaces(partialCreditCardNumber));
    }
}
