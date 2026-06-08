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

export class ProductFieldDisplayHints {
    readonly wildcardMask: string;

    constructor(
        readonly label: string,
        readonly mask: string,
        readonly obfuscate: boolean,
        readonly displayOrder?: number,
        readonly placeholderLabel?: string,
        readonly preferredInputType?: string,
        readonly alwaysShow = true,
        readonly tooltipLabel?: string,
        readonly formElementType?: string,
    ) {
        this.wildcardMask = mask ? mask.replace(/9/g, '*') : '';
    }
}
