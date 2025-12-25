import { AccountOnFile } from './AccountOnFile';
import type { BasicPaymentProductJson } from '../../types';
import { PaymentProduct302SpecificData } from '../../dataModel/paymentProductSpecificData/PaymentProduct302SpecificData';
import { PaymentProduct320SpecificData } from '../../dataModel/paymentProductSpecificData/PaymentProduct320SpecificData';

export class BasicPaymentProduct {
    readonly label?: string;
    readonly logo?: string;
    readonly allowsRecurring?: boolean;
    readonly allowsTokenization?: boolean;
    readonly displayOrder?: number;
    readonly id: number;
    readonly maxAmount?: number;
    readonly minAmount?: number;
    readonly paymentMethod: string;
    readonly usesRedirectionTo3rdParty?: boolean;
    readonly paymentProduct302SpecificData?: PaymentProduct302SpecificData;
    readonly paymentProduct320SpecificData?: PaymentProduct320SpecificData;
    readonly accountsOnFile: AccountOnFile[];

    constructor(json: BasicPaymentProductJson) {
        this.accountsOnFile = [];
        this.allowsRecurring = json.allowsRecurring;
        this.allowsTokenization = json.allowsTokenization;
        this.id = json.id;
        this.maxAmount = json.maxAmount;
        this.minAmount = json.minAmount;
        this.paymentMethod = json.paymentMethod;
        this.usesRedirectionTo3rdParty = json.usesRedirectionTo3rdParty;
        this.label = json.displayHints.label;
        this.logo = json.displayHints.logo;
        this.displayOrder = json.displayHints.displayOrder;

        if (json.paymentProduct302SpecificData) {
            this.paymentProduct302SpecificData = new PaymentProduct302SpecificData(json.paymentProduct302SpecificData);
        }

        if (json.paymentProduct320SpecificData) {
            this.paymentProduct320SpecificData = new PaymentProduct320SpecificData(json.paymentProduct320SpecificData);
        }

        BasicPaymentProduct.parseJson(json, this.accountsOnFile);
    }

    getAccountOnFile(id: string): AccountOnFile | undefined {
        return this.accountsOnFile.find((acc) => acc.id === id);
    }

    private static parseJson(json: BasicPaymentProductJson, accountsOnFile: AccountOnFile[]) {
        if (!json.accountsOnFile) {
            return;
        }

        json.accountsOnFile.forEach((aof) => {
            if (aof.paymentProductId === json.id) {
                const accountOnFile = new AccountOnFile(aof);
                accountsOnFile.push(accountOnFile);
            }
        });
    }
}
