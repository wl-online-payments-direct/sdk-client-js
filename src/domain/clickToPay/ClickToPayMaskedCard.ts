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

import type { ClickToPayMaskedCardAddress } from './ClickToPayMaskedCardAddress';
import type { ClickToPayMaskedCardDcf } from './ClickToPayMaskedCardDcf';
import type { ClickToPayDigitalCardData } from './ClickToPayDigitalCardData';

export interface ClickToPayMaskedCard {
    srcDigitalCardId: string;
    panBin: string;
    panLastFour: string;
    panExpirationMonth?: string;
    panExpirationYear?: string;
    tokenBinRange?: string;
    tokenLastFour?: string;
    tokenId?: string;
    paymentCardType?: string | string[];
    paymentCardDescriptor?: string;
    paymentAccountReference?: string;
    srcPaymentCardId?: string;
    serviceId?: string;
    countryCode?: string;
    dateOfCardCreated: string;
    dateOfCardLastUsed?: string;
    maskedBillingAddress?: ClickToPayMaskedCardAddress;
    dcf?: ClickToPayMaskedCardDcf;
    digitalCardData: ClickToPayDigitalCardData;
}
