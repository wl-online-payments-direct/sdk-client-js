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
import { BasicPaymentProducts, type PaymentContext } from '../../domain';
import type { PaymentProductNetworksResponse } from '../../domain/paymentProduct/PaymentProductNetworksResponse';

export interface PaymentProductService {
    getBasicPaymentProducts(context: PaymentContext): Promise<BasicPaymentProducts>;

    getPaymentProduct(paymentProductId: number, context: PaymentContext): Promise<PaymentProduct>;

    getPaymentProductNetworks(
        paymentProductId: number,
        context: PaymentContext,
    ): Promise<PaymentProductNetworksResponse>;
}
