import { MaskedString } from './models/MaskedString';

function _fillBuffer(index: number, offset: number, buffer: string[], tempMask: string[], valuec: string[]) {
    if (!(index + offset < valuec.length && index < tempMask.length)) {
        return;
    }

    if (
        (tempMask[index] === '9' && Number(valuec[index + offset]) > -1 && valuec[index + offset] !== ' ') ||
        tempMask[index] === '*'
    ) {
        buffer.push(valuec[index + offset]);
    } else if (valuec[index + offset] === tempMask[index]) {
        buffer.push(valuec[index + offset]);
    } else if (tempMask[index] !== '9' && tempMask[index] !== '*') {
        buffer.push(tempMask[index]);
        offset--;
    } else {
        // offset++;
        valuec.splice(index + offset, 1);
        index--;
    }

    _fillBuffer(index + 1, offset, buffer, tempMask, valuec);
}

// noinspection JSUnusedGlobalSymbols
export class MaskingUtil {
    applyMask(mask: string | undefined, newValue: string, oldValue?: string) {
        const buffer: string[] = [];
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
        let cursor = 1;

        // calculate the cursor index
        if (oldValue) {
            const tester = oldValue.split('');
            for (let i = 0, il = buffer.length; i < il; i++) {
                if (buffer[i] !== tester[i]) {
                    cursor = i + 1;
                    break;
                }
            }
        }

        if (newValue.substring(0, newValue.length - 1) === oldValue) {
            cursor = newValue.length + 1;
        }

        return new MaskedString(newValue, cursor);
    }

    getMaxLengthBasedOnMask(mask?: string): number {
        if (!mask) {
            return -1;
        }

        const numberOfReplaceableChars = mask.match(/[{}]/g)?.length ?? 0;

        return mask.length - 1 - numberOfReplaceableChars;
    }

    removeMask(mask?: string, value?: string) {
        if (!mask) {
            // send back as is
            return (value || '').trim();
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
