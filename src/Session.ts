import type {
  AmountOfMoneyJSON,
  PartialCard,
  Token,
  PaymentContext,
  PaymentProductGroupJSON,
  PaymentProductJSON,
  PaymentProductNetworksResponseJSON,
  SessionDetails,
} from './types';
import type { IinDetailsResponse } from './IinDetailsResponse';
import type { PublicKeyResponse } from './PublicKeyResponse';

import { C2SCommunicatorConfiguration } from './C2SCommunicatorConfiguration';
import { PaymentProduct } from './PaymentProduct';
import { BasicPaymentProducts } from './BasicPaymentProducts';
import { BasicPaymentItems } from './BasicPaymentItems';
import { Encryptor } from './Encryptor';
import { C2SCommunicator } from './C2SCommunicator';
import type { SurchargeCalculationResponse } from './SurchargeCalculationResponse';

const API_VERSION = 'client/v1';

export class Session {
  readonly #_c2SCommunicatorConfiguration: C2SCommunicatorConfiguration;
  readonly #_c2sCommunicator: C2SCommunicator;
  #_paymentProduct?: PaymentProduct;
  #_paymentContext?: PaymentContext;

  readonly clientApiUrl: C2SCommunicatorConfiguration['clientApiUrl'];
  readonly assetUrl: C2SCommunicatorConfiguration['assetUrl'];

  constructor(
    sessionDetails: SessionDetails,
    paymentProduct?: PaymentProductJSON | PaymentProductGroupJSON,
  ) {
    this.#_c2SCommunicatorConfiguration = new C2SCommunicatorConfiguration(
      sessionDetails,
      API_VERSION,
    );
    this.#_c2sCommunicator = new C2SCommunicator(
      this.#_c2SCommunicatorConfiguration,
      paymentProduct,
    );
    this.clientApiUrl = this.#_c2SCommunicatorConfiguration.clientApiUrl;
    this.assetUrl = this.#_c2SCommunicatorConfiguration.assetUrl;
  }

  async getBasicPaymentProducts(
    paymentContext: PaymentContext,
  ): Promise<BasicPaymentProducts> {
    const json = await this.#_c2sCommunicator.getBasicPaymentProducts(
      paymentContext,
    );
    this.#_paymentContext = paymentContext;
    return new BasicPaymentProducts(json);
  }

  /**
   * Retrieve details of the payment products that are
   * configured for your account.
   *
   * @param paymentContext - The payment context
   */
  async getBasicPaymentItems(
    paymentContext: PaymentContext,
  ): Promise<BasicPaymentItems> {
    const products = await this.getBasicPaymentProducts(paymentContext);
    return new BasicPaymentItems(products);
  }

  /**
   * Retrieve details of the payment products that are
   * configured for your account.
   *
   * @param paymentProductId - The payment product id
   * @param paymentContext - The payment context
   */
  async getPaymentProduct(
    paymentProductId: number,
    paymentContext?: PaymentContext,
  ): Promise<PaymentProduct> {
    const _paymentContext = this.#_paymentContext || paymentContext;
    if (!_paymentContext) {
      throw new Error('PaymentContext is not provided');
    }

    try {
      const response = await this.#_c2sCommunicator.getPaymentProduct(
        paymentProductId,
        _paymentContext,
      );
      this.#_paymentProduct = new PaymentProduct(response);
      return this.#_paymentProduct;
    } catch (err) {
      this.#_paymentProduct = undefined;
      throw err;
    }
  }

  #_formatPartialCreditCardNumber(partialCreditCardNumber: string): string {
    const removeSpaces = (str: string) => str.replace(/\s/g, '');
    const toFixedLength = (str: string) =>
      str.length >= 8 ? str.substring(0, 8) : str.substring(0, 6);

    return toFixedLength(removeSpaces(partialCreditCardNumber));
  }

  /**
   * Returns verified data that we can process a card from a certain Issuer
   * (by looking up the first 6 or more digits) and what the
   * best card type would be, based on your configuration
   *
   * @param partialCreditCardNumber - The partial credit card number
   * @param paymentContext - The payment context
   */
  async getIinDetails(
    partialCreditCardNumber: string,
    paymentContext?: PaymentContext | null,
  ): Promise<IinDetailsResponse> {
    const _paymentContext = this.#_paymentContext || paymentContext;
    if (!_paymentContext) {
      throw new Error('PaymentContext is not provided');
    }

    return this.#_c2sCommunicator.getPaymentProductIdByCreditCardNumber(
      this.#_formatPartialCreditCardNumber(partialCreditCardNumber),
      _paymentContext,
    );
  }

  async getPublicKey(): Promise<PublicKeyResponse> {
    return this.#_c2sCommunicator.getPublicKey();
  }

  /**
   * Returns a lists of all the networks that can be used in
   * the current payment context for given payment product
   *
   * @param paymentProductId - The payment product id
   * @param paymentContext - The payment context
   */
  async getPaymentProductNetworks(
    paymentProductId: number,
    paymentContext: PaymentContext,
  ): Promise<PaymentProductNetworksResponseJSON> {
    const paymentProductNetworks =
      await this.#_c2sCommunicator.getPaymentProductNetworks(
        paymentProductId,
        paymentContext,
      );

    this.#_paymentContext = paymentContext;
    return paymentProductNetworks;
  }

  /**
   * Returns the encryptor instance to encrypt data
   * with public key and session id
   */
  getEncryptor(): Encryptor {
    return new Encryptor(
      this.#_c2sCommunicator.getPublicKey(),
      this.#_c2SCommunicatorConfiguration.clientSessionId,
    );
  }

  /**
   * Returns the Surcharge Calculation for the provided amount of money and card
   *
   * @param amountOfMoney - Contains the amount and currency code for which the Surcharge should be calculated
   * @param cardSource - A {@link Card} or a {@link Token} for which the Surcharge should be calculated
   */
  async getSurchargeCalculation(
    amountOfMoney: AmountOfMoneyJSON,
    cardOrToken: PartialCard | Token,
  ): Promise<SurchargeCalculationResponse> {
    return this.#_c2sCommunicator.getSurchargeCalculation(
      amountOfMoney,
      cardOrToken,
    );
  }
}
