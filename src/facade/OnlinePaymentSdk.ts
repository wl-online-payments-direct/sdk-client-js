import { type BasicPaymentProducts, PublicKeyResponse } from '../dataModel';
import type {
    AmountOfMoney,
    CurrencyConversionResponse,
    EncryptedRequest,
    PartialCard,
    PaymentContext,
    PaymentContextWithAmount,
    PaymentProductNetworksResponseJson,
    SdkConfiguration,
    SessionData,
    SurchargeCalculationResponse,
    Token,
} from '../types';
import type { ServiceFactory } from '../infrastructure/interfaces/ServiceFactory';
import { DefaultServiceFactory } from '../infrastructure/factories/DefaultServiceFactory';
import type { PaymentProduct } from '../domain/paymentProduct/PaymentProduct';
import { PaymentRequest } from '../domain/paymentRequest/PaymentRequest';
import type { CreditCardTokenRequest } from '../domain/paymentRequest/CreditCardTokenRequest';
import { normalize } from './SessionDataNormalizer';
import type { EncryptionService } from '../services/interfaces/EncryptionService';
import type { PaymentProductService } from '../services/interfaces/PaymentProductService';
import type { ClientService } from '../services/interfaces/ClientService';

export class OnlinePaymentSdk {
    private readonly encryptionService: EncryptionService;
    private readonly paymentProductService: PaymentProductService;
    private readonly clientService: ClientService;

    constructor(sessionData: SessionData, configuration?: SdkConfiguration, factory?: ServiceFactory) {
        const sessionDetails = normalize(sessionData);

        const serviceFactory =
            factory ??
            new DefaultServiceFactory({
                sessionData: sessionDetails,
                configuration,
            });

        this.encryptionService = serviceFactory.getEncryptionService();
        this.paymentProductService = serviceFactory.getPaymentProductService();
        this.clientService = serviceFactory.getClientService();
    }

    getBasicPaymentProducts(paymentContext: PaymentContext): Promise<BasicPaymentProducts> {
        return this.paymentProductService.getBasicPaymentProducts(paymentContext);
    }

    getPaymentProduct(paymentProductId: number, paymentContext: PaymentContext): Promise<PaymentProduct> {
        return this.paymentProductService.getPaymentProduct(paymentProductId, paymentContext);
    }

    getPaymentProductNetworks(
        paymentProductId: number,
        paymentContext: PaymentContext,
    ): Promise<PaymentProductNetworksResponseJson> {
        return this.paymentProductService.getPaymentProductNetworks(paymentProductId, paymentContext);
    }

    getSurchargeCalculation(
        amountOfMoney: AmountOfMoney,
        cardOrToken: PartialCard | Token,
    ): Promise<SurchargeCalculationResponse> {
        return this.clientService.getSurchargeCalculation(amountOfMoney, cardOrToken);
    }

    getCurrencyConversionQuote(
        amountOfMoney: AmountOfMoney,
        cardOrToken: PartialCard | Token,
    ): Promise<CurrencyConversionResponse> {
        return this.clientService.getCurrencyConversionQuote(amountOfMoney, cardOrToken);
    }

    getIinDetails(partialCreditCardNumber: string, paymentContext: PaymentContextWithAmount) {
        return this.clientService.getIinDetails(partialCreditCardNumber, paymentContext);
    }

    getPublicKey(): Promise<PublicKeyResponse> {
        return this.encryptionService?.getPublicKey();
    }

    encryptPaymentRequest(request: PaymentRequest): Promise<EncryptedRequest> {
        return this.encryptionService.encryptPaymentRequest(request);
    }

    encryptTokenRequest(request: CreditCardTokenRequest): Promise<EncryptedRequest> {
        return this.encryptionService.encryptTokenRequest(request);
    }
}
