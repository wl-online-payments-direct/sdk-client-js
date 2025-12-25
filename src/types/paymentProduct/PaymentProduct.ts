import type {
    PaymentProduct302SpecificDataJson,
    PaymentProduct320SpecificDataJson,
} from './PaymentProductSpecificData';
import type { AccountOnFileJson } from '../AccountOnFile';
import type { PaymentProductDisplayHintsJson, PaymentProductFieldDisplayHintsJson } from './DisplayHints';
import type { PaymentProductFieldDataRestrictionsJson } from './DataRestrictions';
import type { PaymentContext } from '../context/PaymentContext';

export interface PaymentProductsJson {
    paymentProducts: BasicPaymentProductJson[];
}

export interface GetIINDetailsRequestJson {
    bin: string;
    paymentContext?: PaymentContext;
}

export interface GetIINDetailsResponseJson {
    coBrands?: IinDetailJson[];
    countryCode: string;
    isAllowedInContext?: boolean;
    paymentProductId: number;
}

export interface IinDetailJson {
    isAllowedInContext: boolean;
    paymentProductId: number;
}

export interface APIErrorJson {
    errorCode: string;
    category?: string;
    httpStatusCode?: number;
    id?: string;
    message?: string;
    propertyName?: string;
    retriable?: boolean;
}

export interface ErrorResponseJson {
    errorId: string;
    errors: APIErrorJson[];
}

export interface PaymentProductNetworksResponseJson {
    networks: string[];
}

export type PaymentProductJson = BasicPaymentProductJson & {
    fields: PaymentProductFieldJson[];
    fieldsWarning?: string;
};

export interface BasicPaymentProductJson {
    accountsOnFile?: AccountOnFileJson[];
    displayHintsList?: PaymentProductDisplayHintsJson[];
    allowsInstallments?: boolean;
    allowsRecurring?: boolean;
    allowsTokenization?: boolean;
    displayHints: PaymentProductDisplayHintsJson;
    id: number;
    isJavaScriptRequired?: boolean;
    maxAmount?: number;
    minAmount?: number;
    paymentMethod: string;
    paymentProduct302SpecificData?: PaymentProduct302SpecificDataJson;
    paymentProduct320SpecificData?: PaymentProduct320SpecificDataJson;
    paymentProductGroup?: string;
    usesRedirectionTo3rdParty?: boolean;
    allowsAuthentication?: boolean;
}

export interface PaymentProductFieldJson {
    displayHints?: PaymentProductFieldDisplayHintsJson;
    id: string;
    type: PaymentProductFieldType;
    usedForLookup?: boolean;
    dataRestrictions: PaymentProductFieldDataRestrictionsJson;
}

export type PaymentProductFieldType = 'numericstring' | 'date' | 'string' | 'expirydate' | 'integer' | 'boolean';
