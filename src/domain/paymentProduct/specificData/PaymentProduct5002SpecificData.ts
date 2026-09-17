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

export interface MastercardAuthenticationOptions {
    readonly acquirerMerchantId: string;
    readonly acquirerBIN: string;
    readonly merchantCategoryCode: string;
    readonly merchantCountryCode: string;
}

export interface MastercardClickToPayCredentials {
    readonly srcInitiatorId: string;
    readonly srciDpaId: string;
    readonly authenticationOptions?: MastercardAuthenticationOptions;
}

export interface VisaAuthenticationOptions {
    readonly acquirerMerchantId: string;
    readonly acquirerBIN: string;
    readonly merchantName: string;
}

export interface VisaClickToPayCredentials {
    readonly srcInitiatorId: string;
    readonly srciDpaId: string;
    readonly encryptionKey: string;
    readonly nModulus: string;
    readonly authenticationOptions?: VisaAuthenticationOptions;
}

export interface PaymentProduct5002ApiParameters {
    readonly mastercard?: MastercardClickToPayCredentials;
    readonly visa?: VisaClickToPayCredentials;
}

export class PaymentProduct5002SpecificData {
    constructor(readonly apiParameters?: PaymentProduct5002ApiParameters) {}
}
