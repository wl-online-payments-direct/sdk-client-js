import type { C2SCommunicatorConfiguration } from './C2SCommunicatorConfiguration';
import type {
  GetIINDetailsRequestJSON,
  GetIINDetailsResponseJSON,
  PaymentContext,
  PaymentProductGroupJSON,
  PaymentProductJSON,
  PaymentProductNetworksResponseJSON,
  PaymentProductsJSON,
  PublicKeyJSON,
} from './types';

import { ApplePay } from './ApplePay';
import { Util } from './Util';
import { Net } from './Net';
import { IinDetailsResponse } from './IinDetailsResponse';
import { PublicKeyResponse } from './PublicKeyResponse';
import { ResponseError } from './ResponseError';

export class C2SCommunicator<
  PaymentProduct extends PaymentProductJSON | PaymentProductGroupJSON =
    | PaymentProductJSON
    | PaymentProductGroupJSON,
> {
  #_cache: Map<string, unknown>;
  #_applePay: ApplePay;
  readonly #_c2SCommunicatorConfiguration: C2SCommunicatorConfiguration;

  constructor(
    _c2SCommunicatorConfiguration: C2SCommunicatorConfiguration,
    readonly _providedPaymentProduct?: PaymentProduct,
  ) {
    this.#_c2SCommunicatorConfiguration = _c2SCommunicatorConfiguration;
    this.#_cache = new Map();
    this.#_applePay = new ApplePay();

    if (this._providedPaymentProduct) {
      this._providedPaymentProduct = this.transformPaymentProductJSON(
        this._providedPaymentProduct,
      );
    }
  }

  #_createCacheKeyFromContext({
    prefix,
    suffix,
    context,
    includeLocale,
  }: {
    context: PaymentContext;
    prefix: string;
    suffix?: string;
    includeLocale?: boolean;
  }) {
    const {
      locale,
      countryCode,
      isRecurring,
      amountOfMoney: { amount, currencyCode },
    } = context;

    const cacheKeyLocale = includeLocale ? locale : '';
    return `${prefix}-${[
      amount,
      countryCode,
      cacheKeyLocale,
      isRecurring,
      currencyCode,
      suffix,
    ]
      .filter(Boolean)
      .join('_')}`;
  }

  #_getRequestHeaders() {
    const metadata = Util.getMetadata();
    return {
      'X-GCS-ClientMetaInfo': window.btoa(JSON.stringify(metadata)),
      Authorization: `GCS v1Client:${
        this.#_c2SCommunicatorConfiguration.clientSessionId
      }`,
    };
  }

  #_cleanJSON<Json extends PaymentProductJSON | PaymentProductGroupJSON>(
    json: Json,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _url: string,
  ): Json {
    if (!json.fields) return json;

    const typeMap = new Map([
      ['expirydate', 'tel'],
      ['string', 'text'],
      ['numericstring', 'tel'],
      ['integer', 'number'],
      ['expirationDate', 'tel'],
    ]);

    for (const field of json.fields) {
      field.type = field.displayHints?.obfuscate
        ? 'password'
        : typeMap.get(field.type) ?? 'text';

      // Helper code for templating tools like Handlebars
      field.validators ??= [];
      field.validators.push(
        ...Object.keys(field.dataRestrictions.validators ?? {}),
      );
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
      if (
        field.id === 'cardNumber' &&
        field.displayHints &&
        !field.displayHints?.mask
      ) {
        field.displayHints.mask =
          json.id === '2'
            ? '{{9999}} {{999999}} {{99999}}'
            : '{{9999}} {{9999}} {{9999}} {{9999}}';
      }
    }

    // The server orders in a different way, so we apply the sort order
    json.fields.sort((a, b) => {
      const _a = a.displayHints?.displayOrder;
      const _b = b.displayHints?.displayOrder;
      if (_a === undefined || _b === undefined) return 0;
      return _a < _b ? -1 : 1;
    });

    return json;
  }

  #_sortProducts<Json extends PaymentProductsJSON>(json: Json): Json {
    json.paymentProducts.sort((a, b) => {
      const [_a, _b] = [a, b].map(
        ({ displayHintsList }) => displayHintsList?.[0]?.displayOrder,
      );
      if (_a === undefined || _b === undefined) return 0;
      return _a - _b;
    });
    return json;
  }

  #_isApplePayAvailable<Json extends Partial<PaymentProductsJSON>>(json: Json) {
    if (this.#_applePay.isApplePayAvailable()) return false;
    Util.paymentProductsThatAreNotSupportedInThisBrowser.push(
      Util.applePayPaymentProductId,
    );
    Util.filterOutProductsThatAreNotSupportedInThisBrowser(json);
  }

  #_getBasePath(path: string): string {
    const { clientApiUrl, customerId } = this.#_c2SCommunicatorConfiguration;
    return Util.url.segmentsToPath([clientApiUrl, customerId, path]);
  }

  // @todo: in the future; this needs to be replaced with auto generated code from the API spec
  #_getUrlFromContext({
    path,
    context: {
      countryCode,
      amountOfMoney: { amount, currencyCode },
      locale,
      isRecurring,
    },
    includeLocale = true,
    queryParams = {},
    useCacheBuster = false,
  }: {
    path: string;
    context: PaymentContext;
    includeLocale?: boolean;
    queryParams?: Record<string, string | number | undefined>;
    useCacheBuster?: boolean;
  }) {
    return Util.url.urlWithQueryString(this.#_getBasePath(path), {
      countryCode,
      isRecurring: isRecurring?.toString(),
      amount: amount.toString(),
      currencyCode,
      locale: includeLocale ? locale : undefined,
      cacheBust: useCacheBuster ? new Date().getTime().toString() : undefined,
      ...queryParams,
    });
  }

  async getBasicPaymentProducts(
    context: PaymentContext,
  ): Promise<PaymentProductsJSON> {
    const cacheKey = this.#_createCacheKeyFromContext({
      context,
      prefix: 'getPaymentProducts',
      includeLocale: true,
    });

    if (this.#_cache.has(cacheKey)) {
      return this.#_cache.get(cacheKey) as PaymentProductsJSON;
    }

    const url = this.#_getUrlFromContext({
      path: 'products',
      context,
      useCacheBuster: true,
      queryParams: { hide: 'fields' },
    });

    const response = await Net.get<PaymentProductsJSON>(url, {
      headers: this.#_getRequestHeaders(),
    });

    if (!response.success) {
      throw new ResponseError(
        response,
        'failed to retrieve Basic Payment Products',
      );
    }

    const json = this.#_sortProducts(response.data);
    Util.filterOutProductsThatAreNotSupportedInThisBrowser(json);
    if (json.paymentProducts.length === 0) {
      throw new ResponseError(response, 'No payment products available');
    }

    this.#_cache.set(cacheKey, json); // store result as in-memory cache
    this.#_isApplePayAvailable(json);
    return json;
  }

  async getPaymentProduct(
    paymentProductId: number,
    context: PaymentContext,
  ): Promise<PaymentProductJSON> {
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

    const cacheKey = this.#_createCacheKeyFromContext({
      context,
      prefix: `getPaymentProduct-${paymentProductId}`,
      includeLocale: true,
    });

    // check if payment product is provided by the constructor
    if (this._providedPaymentProduct?.id === paymentProductId) {
      if (!this.#_cache.has(cacheKey)) {
        this.#_cache.set(cacheKey, this._providedPaymentProduct);
      }
      return this._providedPaymentProduct as PaymentProductJSON;
    }

    // check if product is in-memory cache
    if (this.#_cache.has(cacheKey)) {
      return this.#_cache.get(cacheKey) as PaymentProductJSON;
    }

    const url = this.#_getUrlFromContext({
      path: `products/${paymentProductId}`,
      context,
      useCacheBuster: true,
    });

    const response = await Net.get<
      PaymentProductJSON & Partial<PaymentProductsJSON>
    >(url, { headers: this.#_getRequestHeaders() });

    if (!response.success) {
      throw new ResponseError(response, 'failed to retrieve Payment Product');
    }

    const paymentProduct = this.transformPaymentProductJSON(response.data);
    this.#_cache.set(cacheKey, paymentProduct); // store result as in-memory cache
    this.#_isApplePayAvailable(paymentProduct);
    return paymentProduct;
  }

  async getPaymentProductIdByCreditCardNumber(
    partialCreditCardNumber: string,
    context: PaymentContext,
  ): Promise<IinDetailsResponse> {
    const cacheKey = `getPaymentProductIdByCreditCardNumber-${partialCreditCardNumber}`;

    // return cached result if available
    if (this.#_cache.has(cacheKey)) {
      return this.#_cache.get(cacheKey) as IinDetailsResponse;
    }

    // validate if credit card number is has enough digits
    if (partialCreditCardNumber.length < 6) {
      throw new IinDetailsResponse('NOT_ENOUGH_DIGITS');
    }

    const url = this.#_getBasePath('services/getIINdetails');
    const data = this.convertContextToIinDetailsContext(
      partialCreditCardNumber,
      context,
    );

    const { success, data: json } = await Net.post<GetIINDetailsResponseJSON>(
      url,
      { headers: this.#_getRequestHeaders(), body: JSON.stringify(data) },
    );
    if (!success) throw new IinDetailsResponse('UNKNOWN', json);

    // check if this card is supported
    // if isAllowedInContext is available in the response set status and resolve
    if (Object.hasOwn(json, 'isAllowedInContext')) {
      const iinDetailsResponse = new IinDetailsResponse(
        json.isAllowedInContext !== false
          ? 'SUPPORTED'
          : 'EXISTING_BUT_NOT_ALLOWED',
        json,
      );
      this.#_cache.set(cacheKey, iinDetailsResponse);
      return iinDetailsResponse;
    }

    // if `isAllowedInContext` is not available get the payment product
    // again to determine status and resolve
    try {
      const paymentProduct = await this.getPaymentProduct(
        json.paymentProductId,
        context,
      );
      const iinDetailsResponse = new IinDetailsResponse(
        paymentProduct ? 'SUPPORTED' : 'UNSUPPORTED',
        json,
      );
      this.#_cache.set(cacheKey, iinDetailsResponse);
      return iinDetailsResponse;
    } catch (err) {
      throw new IinDetailsResponse('UNKNOWN', json);
    }
  }

  convertContextToIinDetailsContext(
    partialCreditCardNumber: string,
    context: PaymentContext,
  ): GetIINDetailsRequestJSON {
    return { bin: partialCreditCardNumber, paymentContext: context };
  }

  async getPublicKey(): Promise<PublicKeyResponse> {
    const cacheKey = 'publicKey';
    if (this.#_cache.has(cacheKey)) {
      return this.#_cache.get(cacheKey) as PublicKeyResponse;
    }

    const url = this.#_getBasePath('/crypto/publickey');
    const { success, data } = await Net.get<PublicKeyJSON>(url, {
      headers: this.#_getRequestHeaders(),
    });

    if (!success) throw data;
    const publicKeyResponse = new PublicKeyResponse(data);
    this.#_cache.set(cacheKey, publicKeyResponse);
    return publicKeyResponse;
  }

  async getPaymentProductNetworks(
    paymentProductId: number,
    context: PaymentContext,
  ): Promise<PaymentProductNetworksResponseJSON> {
    const cacheKey = this.#_createCacheKeyFromContext({
      prefix: `paymentProductNetworks-${paymentProductId}`,
      context,
    });

    if (this.#_cache.has(cacheKey)) {
      return this.#_cache.get(cacheKey) as PaymentProductNetworksResponseJSON;
    }

    const url = this.#_getUrlFromContext({
      path: `products/${paymentProductId}/networks`,
      context,
    });

    const { success, data } = await Net.get<PaymentProductNetworksResponseJSON>(
      url,
      { headers: this.#_getRequestHeaders() },
    );

    if (!success) throw data;
    this.#_cache.set(cacheKey, data);
    return data;
  }

  transformPaymentProductJSON<
    Json extends PaymentProductJSON | PaymentProductGroupJSON,
  >(json: Json): Json {
    return this.#_cleanJSON(json, this.#_c2SCommunicatorConfiguration.assetUrl);
  }
}
