/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import type { PaymentProduct } from '../../domain/paymentProduct/PaymentProduct';
import type { PaymentProductDto } from '../apiModels/paymentProduct/PaymentProduct';
import type { BasicPaymentProductsDto } from '../apiModels/paymentProduct/BasicPaymentProductsDto';
import { BasicPaymentProducts } from '../../domain';

export interface PaymentProductFactory {
    createBasicPaymentProducts(dto: BasicPaymentProductsDto): BasicPaymentProducts;

    createPaymentProduct(dto: PaymentProductDto): PaymentProduct;
}
