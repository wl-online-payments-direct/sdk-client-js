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

export interface ClickToPayMobileNumber {
    readonly countryCode: string;
    readonly phoneNumber: string;
}

export interface ClickToPayBillingAddress {
    readonly countryCode: string;
    readonly name: string;
    readonly city?: string;
    readonly state?: string;
    readonly zip?: string;
    readonly line1?: string;
    readonly line2?: string;
    readonly line3?: string;
}

export interface ClickToPayProfileDetails {
    readonly email: string;
    readonly country: string;
    readonly mobileNumber: ClickToPayMobileNumber;
    readonly firstName?: string;
    readonly lastName?: string;
    readonly fullName?: string;
    readonly languageCode?: string;
    readonly billingAddress?: ClickToPayBillingAddress;
}
