/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import type { FormElementDto } from './FormElementDto';
import type { TooltipDto } from './TooltipDto';

export interface ProductFieldDisplayHintsDto {
    alwaysShow: boolean;
    displayOrder: number;
    formElement: FormElementDto;
    label?: string;
    link?: string;
    mask?: string;
    obfuscate: boolean;
    placeholderLabel?: string;
    preferredInputType?: string;
    tooltip?: TooltipDto;
}
