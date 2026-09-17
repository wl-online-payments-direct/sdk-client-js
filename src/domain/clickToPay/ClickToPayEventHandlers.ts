/*
 * Do not remove or alter the notices in this preamble.
 *
 * This software is owned by Worldline and may not be be altered, copied, reproduced, republished, uploaded, posted, transmitted or distributed in any way, without the prior written consent of Worldline.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import type { SdkError } from '../errors/SdkError';
import type { ClickToPayCustomerStatus } from './ClickToPayCustomerStatus';
import type { ClickToPayPaymentResult } from './ClickToPayPaymentResult';
import type { ClickToPayCardSelection } from './ClickToPayCardSelection';

export interface ClickToPayEventHandlers {
    customerStatus: (status: ClickToPayCustomerStatus) => void;
    paymentSuccess: (result: ClickToPayPaymentResult) => void;
    paymentError: (error: SdkError) => void;
    cardSelection: (selection: ClickToPayCardSelection) => void;
    generalEvents: (event: string) => void;
    unbindCustomer: () => void;
}
