/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

function _fillBuffer(index: number, offset: number, buffer: string[], tempMask: string[], valuec: string[]) {
    if (!(index + offset < valuec.length && index < tempMask.length)) {
        return;
    }

    const maskChar = tempMask[index];
    const valueChar = valuec[index + offset];

    if (
        // Handle '9' - accepts digits OR 'X' (for masked values)
        (maskChar === '9' && (Number(valueChar) > -1 || valueChar === 'X') && valueChar !== ' ') ||
        // Handle '*' - accepts any character
        maskChar === '*'
    ) {
        buffer.push(valueChar);
    } else if (valueChar === maskChar) {
        // Value matches the literal mask character
        buffer.push(valueChar);
    } else if (maskChar !== '9' && maskChar !== '*') {
        // Insert literal mask character
        buffer.push(maskChar);
        offset--;
    } else {
        // Remove invalid character and retry
        valuec.splice(index + offset, 1);
        index--;
    }

    _fillBuffer(index + 1, offset, buffer, tempMask, valuec);
}

// noinspection JSUnusedGlobalSymbols
export class Formatter {
    static applyMask(mask: string | undefined, newValue?: string): string | undefined {
        const buffer: string[] = [];
        if (!newValue) {
            return undefined;
        }
        const valueChars = newValue.split('');

        if (mask) {
            // the char '{' and '}' should ALWAYS be ignored
            const maskChars = mask.split('').filter((c) => !['{', '}'].includes(c));

            // `maskChars` now contains the replaceable chars and the non-replaceable masks at the correct index
            _fillBuffer(0, 0, buffer, maskChars, valueChars);
        } else {
            // send back as is
            buffer.push(...valueChars);
        }

        newValue = buffer.join('');
        return newValue;
    }

    static getMaxLengthBasedOnMask(mask?: string): number {
        if (!mask) {
            return -1;
        }

        const numberOfReplaceableChars = mask.match(/[{}]/g)?.length ?? 0;

        return mask.length - 1 - numberOfReplaceableChars;
    }

    static removeMask(mask?: string, value?: string) {
        if (!mask) {
            // send back as is
            return (value ?? '').trim();
        }

        const buffer: string[] = [];
        const valueChars = value?.split('') ?? [];
        let valueIndex = -1;
        let inMask = false;

        for (const char of mask.split('')) {
            valueIndex++;

            // the char '{' and '}' should ALWAYS be ignored
            if (['{', '}'].includes(char)) {
                valueIndex--;
                inMask = char === '{';
                continue;
            }

            const valueChar = valueChars[valueIndex];
            if (inMask && valueChar) {
                buffer.push(valueChar);
            }
        }

        return buffer.join('').trim();
    }
}
