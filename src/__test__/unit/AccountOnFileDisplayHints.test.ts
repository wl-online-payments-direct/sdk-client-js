import type { LabelTemplateElementJSON } from '../../types';

import { expect, it } from 'vitest';
import { AccountOnFileDisplayHints } from '../../models/AccountOnFileDisplayHints';
import { LabelTemplateElement } from '../../models/LabelTemplateElement';

const labelTemplate: LabelTemplateElementJSON[] = [
    { attributeKey: 'cardNumber', mask: '****' },
    {
        attributeKey: 'cardHolderName',
        mask: '****',
    },
];

const accountOnFileDisplayHints = new AccountOnFileDisplayHints({
    logo: '',
    labelTemplate,
});

it('should parse to `labelTemplate`', () => {
    const { labelTemplate } = accountOnFileDisplayHints;
    expect(labelTemplate).toHaveLength(2);
    expect(labelTemplate).toEqual(expect.arrayContaining([expect.any(LabelTemplateElement)]));
});

it('should parse to `labelTemplateElementByAttributeKey`', () => {
    const { labelTemplateElementByAttributeKey } = accountOnFileDisplayHints;
    expect(labelTemplateElementByAttributeKey).toEqual({
        cardNumber: expect.any(LabelTemplateElement),
        cardHolderName: expect.any(LabelTemplateElement),
    });
});
