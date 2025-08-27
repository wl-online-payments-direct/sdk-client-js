import { SessionConfiguration } from './SessionConfiguration';
import type {
    AmountOfMoneyJSON,
    Card,
    CurrencyConversionRequest,
    CurrencyConversionResponse,
    GetIINDetailsRequestJSON,
    GetIINDetailsResponseJSON,
    PartialCard,
    PaymentContext,
    PaymentProductGroupJSON,
    PaymentProductJSON,
    PaymentProductNetworksResponseJSON,
    PaymentProductsJSON,
    PublicKeyJSON,
    SurchargeCalculationResponse,
    SurchargeRequestJSON,
    Token,
} from '../types';

import { ApplePay } from '../models/ApplePay';
import { Util } from './Util';
import { Net } from './Net';
import { IinDetailsResponse } from '../models/IinDetailsResponse';
import { PublicKeyResponse } from '../models/PublicKeyResponse';
import { ResponseError } from '../models/ResponseError';
import { ApiVersion } from '../types/api-version.types';

type ApiVersionString = (typeof ApiVersion)[keyof typeof ApiVersion];

export class C2SCommunicator<
    PaymentProduct extends PaymentProductJSON | PaymentProductGroupJSON = PaymentProductJSON | PaymentProductGroupJSON,
> {
    #cache: Map<string, unknown>;
    #applePay: ApplePay;

    readonly #sessionConfiguration: SessionConfiguration;

    /**
     * Initializes a new instance of the class with the given session configuration and optional provided payment
     * product.
     *
     * @param {SessionConfiguration} sessionConfiguration - The configuration details for a session.
     * @param {PaymentProduct} [providedPaymentProduct] - An optional payment product that can be provided for
     *     customization.
     */
    constructor(
        sessionConfiguration: SessionConfiguration,
        readonly providedPaymentProduct?: PaymentProduct,
    ) {
        this.#sessionConfiguration = sessionConfiguration;
        this.#cache = new Map();
        this.#applePay = new ApplePay();

        if (this.providedPaymentProduct) {
            this.providedPaymentProduct = this.transformPaymentProductJSON(this.providedPaymentProduct);
        }
    }

    /**
     * Retrieves the list of basic payment products available for the provided payment context.
     *
     * @param {PaymentContext} context - The payment context containing details such as currency and amount.
     * @return {Promise<PaymentProductsJSON>} A promise that resolves to a JSON object containing the list of payment
     *     products.
     * @throws {ResponseError} If the retrieval of basic payment products fails or no payment products are available.
     */
    public async getBasicPaymentProducts(context: PaymentContext): Promise<PaymentProductsJSON> {
        const cacheKey = this.#createCacheKeyFromContext({
            context,
            prefix: 'getPaymentProducts',
        });

        if (this.#cache.has(cacheKey)) {
            return this.#cache.get(cacheKey) as PaymentProductsJSON;
        }

        const url = this.#getUrlFromContext({
            path: 'products',
            apiVersion: ApiVersion.V1,
            context,
            useCacheBuster: true,
            queryParams: { hide: 'fields' },
        });

        const response = await Net.get<PaymentProductsJSON>(url, {
            headers: this.#getRequestHeaders(),
        });

        if (!response.success) {
            throw new ResponseError(response, 'failed to retrieve Basic Payment Products');
        }

        const json = this.#sortProducts(response.data);
        Util.filterOutProductsThatAreNotSupportedInThisBrowser(json);
        if (json.paymentProducts.length === 0) {
            throw new ResponseError(response, 'No payment products available');
        }

        this.#cache.set(cacheKey, json); // store result as in-memory cache
        this.#filterApplePay(json);

        return json;
    }

    /**
     * Retrieves a payment product based on the given payment product ID and payment context.
     *
     * @param {number} paymentProductId - The unique identifier of the payment product to retrieve.
     * @param {PaymentContext} context - The context of the payment, including information such as currency.
     * @return {Promise<PaymentProductJSON>} A promise that resolves to the payment product data in JSON format.
     * @throws {Object} Throws an error when the specified payment product is not supported in the browser,
     *      including an error object with details such as code, propertyName, message, and HTTP status code.
     */
    public async getPaymentProduct(paymentProductId: number, context: PaymentContext): Promise<PaymentProductJSON> {
        if (!Util.isSupportedPaymentProductInBrowser(paymentProductId)) {
            throw {
                errorId: '48b78d2d-1b35-4f8b-92cb-57cc2638e901',
                errors: [
                    {
                        code: '1007',
                        propertyName: 'productId',
                        message: 'UNKNOWN_PRODUCT_ID',
                        httpStatusCode: 404,
                    },
                ],
            };
        }

        const cacheKey = this.#createCacheKeyFromContext({
            context,
            prefix: `getPaymentProduct-${paymentProductId}`,
        });

        // check if a payment product is provided by the constructor
        if (this.providedPaymentProduct?.id === paymentProductId) {
            if (!this.#cache.has(cacheKey)) {
                this.#cache.set(cacheKey, this.providedPaymentProduct);
            }

            return this.providedPaymentProduct as PaymentProductJSON;
        }

        // check if the product is in-memory cache
        if (this.#cache.has(cacheKey)) {
            return this.#cache.get(cacheKey) as PaymentProductJSON;
        }

        const url = this.#getUrlFromContext({
            path: `products/${paymentProductId}`,
            apiVersion: ApiVersion.V1,
            context,
            useCacheBuster: true,
        });

        const response = await Net.get<PaymentProductJSON & Partial<PaymentProductsJSON>>(url, {
            headers: this.#getRequestHeaders(),
        });

        if (!response.success) {
            throw new ResponseError(response, `Failed to retrieve Payment Product ${paymentProductId}`);
        }

        const paymentProduct = this.transformPaymentProductJSON(response.data);
        this.#cache.set(cacheKey, paymentProduct); // store result as in-memory cache
        this.#filterApplePay(paymentProduct);

        return paymentProduct;
    }

    /**
     * Retrieves the payment product ID associated with a credit card number.
     *
     * @param {string} partialCreditCardNumber - The partial credit card number (minimum 6 digits required) used for
     *     identifying the payment product.
     * @param {PaymentContext} context - The context containing payment information and configuration details.
     * @return {Promise<IinDetailsResponse>} A promise resolving to an IinDetailsResponse object indicating the
     *     determination status and payment product details.
     */
    public async getPaymentProductIdByCreditCardNumber(
        partialCreditCardNumber: string,
        context: PaymentContext,
    ): Promise<IinDetailsResponse> {
        const cacheKey = `getPaymentProductIdByCreditCardNumber-${partialCreditCardNumber}`;

        // return a cached result if available
        if (this.#cache.has(cacheKey)) {
            return this.#cache.get(cacheKey) as IinDetailsResponse;
        }

        // validate if a credit card number has enough digits
        if (partialCreditCardNumber.length < 6) {
            throw new IinDetailsResponse('NOT_ENOUGH_DIGITS');
        }

        const url = this.#getBasePath('services/getIINdetails', ApiVersion.V1);
        const data = this.convertContextToIinDetailsContext(partialCreditCardNumber, context);

        const { success, data: json } = await Net.post<GetIINDetailsResponseJSON>(url, {
            headers: this.#getRequestHeaders(),
            body: JSON.stringify(data),
        });

        if (!success) {
            throw new IinDetailsResponse('UNKNOWN', json);
        }

        // check if this card is supported
        // if isAllowedInContext is available in the response set status and resolve
        if (Object.hasOwn(json, 'isAllowedInContext')) {
            const iinDetailsResponse = new IinDetailsResponse(
                json.isAllowedInContext !== false ? 'SUPPORTED' : 'EXISTING_BUT_NOT_ALLOWED',
                json,
            );
            this.#cache.set(cacheKey, iinDetailsResponse);

            return iinDetailsResponse;
        }

        // if `isAllowedInContext` is not available, get the payment product
        // again to determine status and resolve
        try {
            const paymentProduct = await this.getPaymentProduct(json.paymentProductId, context);
            const iinDetailsResponse = new IinDetailsResponse(paymentProduct ? 'SUPPORTED' : 'UNSUPPORTED', json);
            this.#cache.set(cacheKey, iinDetailsResponse);

            return iinDetailsResponse;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            throw new IinDetailsResponse('UNKNOWN', json);
        }
    }

    /**
     * Converts the provided partial credit card number and payment context
     * into an IIN (Issuer Identification Number) details request context.
     *
     * @param {string} partialCreditCardNumber - The partial credit card number used for identifying the card issuer.
     * @param {PaymentContext} context - The payment context containing details about the payment.
     * @return {GetIINDetailsRequestJSON} An object containing the IIN details request data.
     */
    public convertContextToIinDetailsContext(
        partialCreditCardNumber: string,
        context: PaymentContext,
    ): GetIINDetailsRequestJSON {
        return { bin: partialCreditCardNumber, paymentContext: context };
    }

    /**
     * Retrieves the public key from the server. If the public key is available in the cache, it will be returned.
     * Otherwise, the method fetches the public key from the API, caches the result, and then returns it.
     *
     * @return {Promise<PublicKeyResponse>} A promise that resolves to a PublicKeyResponse object containing the public
     *     key data.
     * @throws {Error} Throws an error if the API request fails.
     */
    public async getPublicKey(): Promise<PublicKeyResponse> {
        const cacheKey = 'publicKey';
        if (this.#cache.has(cacheKey)) {
            return this.#cache.get(cacheKey) as PublicKeyResponse;
        }

        const url = this.#getBasePath('/crypto/publickey', ApiVersion.V1);
        const { success, data } = await Net.get<PublicKeyJSON>(url, {
            headers: this.#getRequestHeaders(),
        });

        if (!success) {
            throw data;
        }

        const publicKeyResponse = new PublicKeyResponse(data);
        this.#cache.set(cacheKey, publicKeyResponse);

        return publicKeyResponse;
    }

    /**
     * Fetches the payment product networks for a given payment product ID and context.
     *
     * @param {number} paymentProductId - The ID of the payment product for which the networks are to be retrieved.
     * @param {PaymentContext} context - The context containing additional information required for the request, such
     *     as country.
     * @return {Promise<PaymentProductNetworksResponseJSON>} A promise that resolves to the payment product networks
     *     response.
     * @throws Error Will throw an error if the request fails.
     */
    public async getPaymentProductNetworks(
        paymentProductId: number,
        context: PaymentContext,
    ): Promise<PaymentProductNetworksResponseJSON> {
        const cacheKey = this.#createCacheKeyFromContext({
            prefix: `paymentProductNetworks-${paymentProductId}`,
            context,
        });

        if (this.#cache.has(cacheKey)) {
            return this.#cache.get(cacheKey) as PaymentProductNetworksResponseJSON;
        }

        const url = this.#getUrlFromContext({
            path: `products/${paymentProductId}/networks`,
            apiVersion: ApiVersion.V1,
            context,
        });

        const { success, data } = await Net.get<PaymentProductNetworksResponseJSON>(url, {
            headers: this.#getRequestHeaders(),
        });

        if (!success) {
            throw data;
        }

        this.#cache.set(cacheKey, data);

        return data;
    }

    /**
     * Transforms the provided payment product JSON or payment product group JSON
     * by cleaning it and ensuring it references the proper asset URL.
     *
     * @param {PaymentProductJSON|PaymentProductGroupJSON} json - The payment product JSON or payment product group
     *     JSON to be transformed.
     * @return {PaymentProductJSON|PaymentProductGroupJSON} The transformed JSON object.
     */
    public transformPaymentProductJSON<Json extends PaymentProductJSON | PaymentProductGroupJSON>(json: Json): Json {
        return this.#cleanJSON(json);
    }

    /**
     * Calculates the surcharge for a given amount and payment source (card or token).
     *
     * @param {AmountOfMoneyJSON} amountOfMoney - The amount of money including currency code to calculate the
     *     surcharge for.
     * @param {PartialCard | Token} cardOrToken - The card details or token for the payment source.
     * @return {Promise<SurchargeCalculationResponse>} A promise resolving to the surcharge calculation response.
     */
    public async getSurchargeCalculation(
        amountOfMoney: AmountOfMoneyJSON,
        cardOrToken: PartialCard | Token,
    ): Promise<SurchargeCalculationResponse> {
        const cacheKeySuffix = this.#getCacheKeySuffix(cardOrToken);
        const cacheKey = `getSurchargeCalculation-${amountOfMoney.amount}-${amountOfMoney.currencyCode}-${cacheKeySuffix}`;

        // return a cached result if available
        if (this.#cache.has(cacheKey)) {
            return this.#cache.get(cacheKey) as SurchargeCalculationResponse;
        }

        const cardSource = this.#getCardSource(cardOrToken);

        const url = this.#getBasePath('services/surchargeCalculation', ApiVersion.V1);
        // Create Surcharge Calculation Request POST body
        const requestJson: SurchargeRequestJSON = {
            cardSource,
            amountOfMoney,
        };

        const { success, data } = await Net.post<SurchargeCalculationResponse>(url, {
            headers: this.#getRequestHeaders(),
            body: JSON.stringify(requestJson),
        });
        if (!success) {
            throw data;
        }

        this.#cache.set(cacheKey, data);

        return data;
    }

    /**
     * Fetches a currency conversion quote for a specified amount and card/token details.
     *
     * @param {AmountOfMoneyJSON} amountOfMoney - An object representing the amount of money to be converted, including
     *     the amount and currency code.
     * @param {PartialCard | Token} cardOrToken - A partial card or token object that provides the source for the
     *     currency conversion.
     * @return {Promise<CurrencyConversionResponse>} A promise that resolves to the currency conversion response,
     *     containing the converted amount and relevant details.
     */
    public async getCurrencyConversionQuote(
        amountOfMoney: AmountOfMoneyJSON,
        cardOrToken: PartialCard | Token,
    ): Promise<CurrencyConversionResponse> {
        const cacheKeySuffix = this.#getCacheKeySuffix(cardOrToken);
        const cacheKey = `getCurrencyConversionQuote-${amountOfMoney.amount}-${amountOfMoney.currencyCode}-${cacheKeySuffix}`;

        // return a cached result if available
        if (this.#cache.has(cacheKey)) {
            return this.#cache.get(cacheKey) as CurrencyConversionResponse;
        }

        const cardSource = this.#getCardSource(cardOrToken);

        const url = this.#getBasePath('services/dccrate', ApiVersion.V2);
        const transaction = {
            amount: amountOfMoney,
        };
        // Create Currency Conversion Request POST body
        const request: CurrencyConversionRequest = {
            cardSource,
            transaction,
        };

        const { success, data } = await Net.post<CurrencyConversionResponse>(url, {
            headers: this.#getRequestHeaders(),
            body: JSON.stringify(request),
        });

        if (!success) {
            throw data;
        }

        this.#cache.set(cacheKey, data);

        return data;
    }

    /**
     * Creates a unique cache key based on the given context and optional parameters.
     *
     * @param {Object} params - Parameters used to create the cache key.
     * @param {string} params.prefix - The prefix to prepend to the cache key.
     * @param {string} [params.suffix] - Optional suffix to append to the cache key.
     * @param {PaymentContext} params.context - The payment context providing data for the cache key generation.
     * @return {string} The generated cache key.
     */
    #createCacheKeyFromContext({
        prefix,
        suffix,
        context,
    }: {
        context: PaymentContext;
        prefix: string;
        suffix?: string;
    }): string {
        const {
            countryCode,
            isRecurring,
            amountOfMoney: { amount, currencyCode },
        } = context;

        return `${prefix}-${[amount, countryCode, isRecurring, currencyCode, suffix].filter(Boolean).join('_')}`;
    }

    /**
     * Retrieves the request headers required for making authorized API calls.
     *
     * @return {HeadersInit} An object containing the request headers, including 'X-GCS-ClientMetaInfo' and
     *     'Authorization'.
     */
    #getRequestHeaders(): HeadersInit {
        const metadata = Util.getMetadata();

        return {
            'X-GCS-ClientMetaInfo': window.btoa(JSON.stringify(metadata)),
            Authorization: `GCS v1Client:${this.#sessionConfiguration.clientSessionId}`,
        };
    }

    /**
     * Cleans and modifies a JSON object containing payment product or payment product group data,
     * adjusting field types, validators, masks, and sort order based on display hints.
     *
     * @param {PaymentProductJSON | PaymentProductGroupJSON} json - The JSON object to be cleaned, which must conform
     *     to the type PaymentProductJSON or PaymentProductGroupJSON.
     * @return {PaymentProductJSON | PaymentProductGroupJSON} - The modified JSON object after cleaning and adjustments
     *     have been applied.
     */
    #cleanJSON<Json extends PaymentProductJSON | PaymentProductGroupJSON>(json: Json): Json {
        if (!json.fields) {
            return json;
        }

        const typeMap = new Map([
            ['expirydate', 'tel'],
            ['string', 'text'],
            ['numericstring', 'tel'],
            ['integer', 'number'],
            ['expirationDate', 'tel'],
        ]);

        for (const field of json.fields) {
            field.type = field.displayHints?.obfuscate ? 'password' : (typeMap.get(field.type) ?? 'text');

            // Helper code for templating tools like Handlebars
            field.validators ??= [];
            field.validators.push(...Object.keys(field.dataRestrictions.validators ?? {}));
            if (field.displayHints?.formElement?.type === 'list') {
                field.displayHints.formElement.list = true;
            }

            // Fix mask and type on field displayHints id expiry date
            if (field.id === 'expiryDate') {
                if (field.displayHints?.formElement.type === 'list') {
                    field.displayHints.formElement.type = 'string';
                    field.displayHints.formElement.list = false;
                }

                if (field.displayHints && !field.displayHints?.mask) {
                    field.displayHints.mask = '{{99}}/{{99}}';
                }
            }

            // Fix card number masks
            if (field.id === 'cardNumber' && field.displayHints && !field.displayHints?.mask) {
                field.displayHints.mask =
                    json.id === '2' ? '{{9999}} {{999999}} {{99999}}' : '{{9999}} {{9999}} {{9999}} {{9999}}';
            }
        }

        // The server orders differently, so we apply the sort order
        json.fields.sort((a, b) => {
            const _a = a.displayHints?.displayOrder;
            const _b = b.displayHints?.displayOrder;
            if (_a === undefined || _b === undefined) {
                return 0;
            }

            return _a < _b ? -1 : 1;
        });

        return json;
    }

    /**
     * Sorts the payment products within the provided JSON object based on the `displayOrder`
     * property of the first item in their `displayHintsList` array.
     *
     * If `displayOrder` is not defined for any of the products, their relative order remains unchanged.
     *
     * @param {PaymentProductsJSON} json - The JSON object containing payment products to be sorted.
     * @return {PaymentProductsJSON} The same JSON object with the payment products sorted.
     */
    #sortProducts(json: PaymentProductsJSON): PaymentProductsJSON {
        json.paymentProducts.sort((a, b) => {
            const [_a, _b] = [a, b].map(({ displayHintsList }) => displayHintsList?.[0]?.displayOrder);
            if (_a === undefined || _b === undefined) {
                return 0;
            }

            return _a - _b;
        });

        return json;
    }

    /**
     * Filters out Apple Pay from the provided payment products JSON if Apple Pay is not available.
     *
     * @param {Partial<PaymentProductsJSON>} json - A partial JSON object containing payment products to be filtered.
     */
    #filterApplePay(json: Partial<PaymentProductsJSON>) {
        if (this.#applePay.isApplePayAvailable()) {
            return;
        }

        Util.paymentProductsThatAreNotSupportedInThisBrowser.push(Util.applePayPaymentProductId);
        Util.filterOutProductsThatAreNotSupportedInThisBrowser(json);
    }

    /**
     * Constructs and returns the base path by combining the client API URL, API version, customer ID, and a provided
     * path.
     *
     * @param {string} path - The specific path or endpoint to append.
     * @param {ApiVersionString} apiVersion - The API version to include in the path.
     * @return {string} The constructed base path as a string.
     */
    #getBasePath(path: string, apiVersion: ApiVersionString): string {
        const { clientApiUrl, customerId } = this.#sessionConfiguration;

        return Util.url.segmentsToPath([clientApiUrl, apiVersion, customerId, path]);
    }

    /**
     * Constructs a URL with query parameters derived from the provided context.
     * @TODO: in the future; this needs to be replaced with auto generated code from the API spec
     *
     * @param {Object} params - The parameters for constructing the URL.
     * @param {string} params.path - The base path for the URL.
     * @param {ApiVersionString} params.apiVersion - The API version to use in the URL.
     * @param {PaymentContext} params.context - The payment context containing details for the query parameters.
     * @param {Record<string, string | number | undefined>} [params.queryParams={}] - Additional query parameters to
     *     include in the URL.
     * @param {boolean} [params.useCacheBuster=false] - Whether to include a cache-busting query parameter.
     * @returns {string} The constructed URL with the query parameters.
     */
    #getUrlFromContext({
        path,
        apiVersion,
        context,
        queryParams = {},
        useCacheBuster = false,
    }: {
        path: string;
        apiVersion: ApiVersionString;
        context: PaymentContext;
        queryParams?: Record<string, string | number | undefined>;
        useCacheBuster?: boolean;
    }): string {
        return Util.url.urlWithQueryString(this.#getBasePath(path, apiVersion), {
            countryCode: context.countryCode,
            isRecurring: context.isRecurring?.toString(),
            ...(context.amountOfMoney.amount ? { amount: context.amountOfMoney.amount.toString() } : {}),
            currencyCode: context.amountOfMoney.currencyCode,
            cacheBust: useCacheBuster ? new Date().getTime().toString() : undefined,
            ...queryParams,
        });
    }

    /**
     * Determines if the given object is a PartialCard.
     * Used for Surcharge Calculation & Currency Conversion.
     *
     * @param {PartialCard | Token} cardOrToken - The object to check, which can either be a PartialCard or a Token.
     * @return {boolean} - Returns true if the provided object is a PartialCard, otherwise false.
     */
    #isPartialCard(cardOrToken: PartialCard | Token): cardOrToken is PartialCard {
        return typeof cardOrToken === 'object';
    }

    /**
     * Generates a cache key suffix based on the provided card or token object.
     *
     * @param {PartialCard | Token} cardOrToken - The input object, which can be a PartialCard or Token.
     *     If it is a PartialCard, the partialCreditCardNumber property is used to generate the suffix;
     *     otherwise, the token itself is returned.
     * @return {string} The computed cache key suffix derived from either the partialCreditCardNumber of the
     *     PartialCard or the Token object.
     */
    #getCacheKeySuffix(cardOrToken: PartialCard | Token): string {
        return this.#isPartialCard(cardOrToken) ? cardOrToken.partialCreditCardNumber : cardOrToken;
    }

    /**
     * Retrieves the source object for the given card or token. If the input is a partial card,
     * it returns an object containing card details. If the input is a token, it returns an object
     * containing the token.
     *
     * @param {PartialCard | Token} cardOrToken - The partial card or token to extract the source from.
     * @return {{ card: Card } | { token: Token }} An object containing either the card details or the token.
     */
    #getCardSource(cardOrToken: PartialCard | Token): { card: Card } | { token: Token } {
        return this.#isPartialCard(cardOrToken)
            ? {
                  card: {
                      cardNumber: cardOrToken.partialCreditCardNumber,
                      paymentProductId: cardOrToken.paymentProductId,
                  },
              }
            : { token: cardOrToken };
    }
}
