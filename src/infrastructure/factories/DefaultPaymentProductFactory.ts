/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import { PaymentProduct } from '../../domain/paymentProduct/PaymentProduct';
import type { PaymentProductFactory } from '../interfaces/PaymentProductFactory';
import { BasicPaymentProduct } from '../../domain/paymentProduct/BasicPaymentProduct';
import type { PaymentProductDto } from '../apiModels/paymentProduct/PaymentProduct';
import type { BasicPaymentProductDto } from '../apiModels/paymentProduct/BasicPaymentProductDto';
import type { BasicPaymentProductsDto } from '../apiModels/paymentProduct/BasicPaymentProductsDto';
import {
    AccountOnFile,
    AccountOnFileAttribute,
    BasicPaymentProducts,
    PaymentProductField,
    ProductFieldDisplayHints,
} from '../../domain';
import type { AccountOnFileDto } from '../apiModels/accountOnFile/AccountOnFile';
import { Formatter } from '../utils/Formatter';
import type { PaymentProductFieldDto } from '../apiModels/paymentProduct/PaymentProductFieldDto';
import { DataRestrictions } from '../../domain/paymentProduct/productField/DataRestrictions';
import type { ProductFieldDisplayHintsDto } from '../apiModels/paymentProduct/displayHints/ProductFieldDisplayHintsDto';
import type { DataRestrictionsDto } from '../apiModels/paymentProduct/DataRestrictionsDto';
import { ValidationRuleFactory } from './ValidationRuleFactory';

export class DefaultPaymentProductFactory implements PaymentProductFactory {
    createBasicPaymentProducts(dto: BasicPaymentProductsDto) {
        const products = dto.paymentProducts.map((product) => this.createBasicPaymentProduct(product));

        const accountsOnFile: AccountOnFile[] = [];
        dto.paymentProducts.forEach((product) => {
            product.accountsOnFile?.forEach((aof) => {
                if (!accountsOnFile.find((a) => a.id === aof.id)) {
                    accountsOnFile.push(this.createAccountOnFile(aof));
                }
            });
        });

        return new BasicPaymentProducts(products, accountsOnFile);
    }

    createBasicPaymentProduct(dto: BasicPaymentProductDto): BasicPaymentProduct {
        return new BasicPaymentProduct(
            dto.id,
            dto.paymentMethod,
            dto.displayHints.label,
            dto.displayHints.logo,
            dto.allowsRecurring,
            dto.allowsTokenization,
            dto.displayHints.displayOrder,
            dto.maxAmount,
            dto.minAmount,
            dto.usesRedirectionTo3rdParty,
            dto.paymentProduct302SpecificData,
            dto.paymentProduct320SpecificData,
            (dto.accountsOnFile ?? []).map((aof) => this.createAccountOnFile(aof)),
        );
    }

    createPaymentProduct(dto: PaymentProductDto): PaymentProduct {
        return new PaymentProduct(
            dto.id,
            dto.paymentMethod,
            dto.displayHints.label,
            dto.displayHints.logo,
            dto.allowsRecurring,
            dto.allowsTokenization,
            dto.displayHints.displayOrder,
            dto.maxAmount,
            dto.minAmount,
            dto.usesRedirectionTo3rdParty,
            dto.paymentProduct302SpecificData,
            dto.paymentProduct320SpecificData,
            (dto.accountsOnFile ?? []).map((aof) => this.createAccountOnFile(aof)),
            dto.fields
                .map((field) => this.createPaymentProductField(field))
                .sort((a, b) => a.getDisplayOrder() - b.getDisplayOrder()),
        );
    }

    createAccountOnFile(dto: AccountOnFileDto): AccountOnFile {
        const alias = dto.attributes.find((a) => a.key === 'alias')?.value;
        const mask = dto.displayHints?.labelTemplate?.find((t) => t.attributeKey === 'alias')?.mask;

        return new AccountOnFile(
            dto.id,
            dto.paymentProductId,
            Formatter.applyMask(mask, alias) ?? alias,
            dto.attributes.map((a) => new AccountOnFileAttribute(a.key, a.value, a.status)),
        );
    }

    createPaymentProductField(dto: PaymentProductFieldDto): PaymentProductField {
        return new PaymentProductField(
            dto.id,
            dto.type,
            this.createDataRestrictions(dto.dataRestrictions),
            this.createDisplayHintsForField(dto.displayHints),
        );
    }

    createDisplayHintsForField(dto?: ProductFieldDisplayHintsDto): ProductFieldDisplayHints {
        return new ProductFieldDisplayHints(
            dto?.label ?? '',
            dto?.mask ?? '',
            dto?.obfuscate ?? false,
            dto?.displayOrder ?? Number.MAX_VALUE,
            dto?.placeholderLabel,
            dto?.preferredInputType,
            dto?.alwaysShow,
            dto?.tooltip?.label,
            dto?.formElement?.type?.toString(),
        );
    }

    createDataRestrictions(dto: DataRestrictionsDto): DataRestrictions {
        return new DataRestrictions(dto.isRequired ?? false, new ValidationRuleFactory().createRules(dto.validators));
    }
}
