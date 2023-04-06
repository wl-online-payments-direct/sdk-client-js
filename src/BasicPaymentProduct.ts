import type { BasicPaymentProductJSON, MapById } from './types';

import { AccountOnFile } from './AccountOnFile';
import { PaymentProductDisplayHints } from './PaymentProductDisplayHints';
import { PaymentProduct302SpecificData } from './PaymentProduct302SpecificData';

function _parseJSON(
  _json: BasicPaymentProductJSON,
  _accountsOnFile: AccountOnFile[],
  _accountOnFileById: MapById<AccountOnFile>,
) {
  if (!_json.accountsOnFile) return;
  for (const aof of _json.accountsOnFile) {
    const accountOnFile = new AccountOnFile(aof);
    _accountsOnFile.push(accountOnFile);
    _accountOnFileById[accountOnFile.id] = accountOnFile;
  }
}

export class BasicPaymentProduct {
  readonly accountsOnFile: AccountOnFile[];
  readonly accountOnFileById: MapById<AccountOnFile>;
  readonly allowsRecurring: boolean;
  readonly allowsTokenization: boolean;
  readonly displayHints: PaymentProductDisplayHints;
  readonly displayHintsList: PaymentProductDisplayHints[];
  readonly id: number;
  readonly maxAmount?: number;
  readonly minAmount?: number;
  readonly paymentMethod: string;
  readonly mobileIntegrationLevel: string;
  readonly usesRedirectionTo3rdParty: boolean;
  readonly paymentProduct302SpecificData?: PaymentProduct302SpecificData;

  constructor(readonly json: BasicPaymentProductJSON) {
    this.json.type = 'product';
    this.accountsOnFile = [];
    this.accountOnFileById = {};
    this.allowsRecurring = json.allowsRecurring;
    this.allowsTokenization = json.allowsTokenization;
    this.displayHints = new PaymentProductDisplayHints(json.displayHints);
    this.displayHintsList = [];
    this.id = json.id;
    this.maxAmount = json.maxAmount;
    this.minAmount = json.minAmount;
    this.paymentMethod = json.paymentMethod;
    this.mobileIntegrationLevel = json.mobileIntegrationLevel;
    this.usesRedirectionTo3rdParty = json.usesRedirectionTo3rdParty;

    if (json.paymentProduct302SpecificData) {
      this.paymentProduct302SpecificData = new PaymentProduct302SpecificData(
        json.paymentProduct302SpecificData,
      );
    }

    if (json.displayHintsList) {
      for (const displayHints of json.displayHintsList) {
        this.displayHintsList.push(
          new PaymentProductDisplayHints(displayHints),
        );
      }
    }

    _parseJSON(json, this.accountsOnFile, this.accountOnFileById);
  }

  copy(): BasicPaymentProduct {
    return new BasicPaymentProduct(
      JSON.parse(JSON.stringify(this.json)) as BasicPaymentProductJSON,
    );
  }
}
