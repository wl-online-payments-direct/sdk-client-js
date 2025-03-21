import { describe, expect, it } from 'vitest';
import { MaskingUtil } from '../../MaskingUtil';

const util = new MaskingUtil();

const maskExpiryDate = '{{99}}-{{99}}';
const maskCardNumber = '{{9999}} {{9999}} {{9999}} {{9999}} {{999}}';
const maskUndefined = undefined;

describe('apply mask', () => {
    describe('expiry date', () => {
        it.each([
            ['1', '1'],
            ['12', '12'],
            ['123', '12-3'],
            ['1234', '12-34'],
            ['12345', '12-34'],
        ])('should convert raw value `%s` masked value `%s`', (value, expected) => {
            const result = util.applyMask(maskExpiryDate, value, '');
            expect(result.formattedValue).toBe(expected);
        });
    });
    describe('card number', () => {
        it.each([
            ['1', '1'],
            ['12', '12'],
            ['123', '123'],
            ['1234', '1234'],
            ['12345', '1234 5'],
            ['123456', '1234 56'],
            ['1234567', '1234 567'],
            ['12345678', '1234 5678'],
            ['123456789', '1234 5678 9'],
            ['1234567890', '1234 5678 90'],
            ['12345678901', '1234 5678 901'],
            ['123456789012', '1234 5678 9012'],
            ['1234567890123', '1234 5678 9012 3'],
            ['12345678901234', '1234 5678 9012 34'],
            ['123456789012345', '1234 5678 9012 345'],
            ['1234567890123456', '1234 5678 9012 3456'],
            ['12345678901234567', '1234 5678 9012 3456 7'],
            ['123456789012345678', '1234 5678 9012 3456 78'],
            ['1234567890123456789', '1234 5678 9012 3456 789'],
            ['12345678901234567890', '1234 5678 9012 3456 789'],
        ])('should convert raw value `%s` masked value `%s`', (value, expected) => {
            const result = util.applyMask(maskCardNumber, value, '');
            expect(result.formattedValue).toBe(expected);
        });
    });
    describe('no mask', () => {
        it.each([
            ['1', '1'],
            ['12', '12'],
            ['123', '123'],
            ['1234', '1234'],
            ['12345', '12345'],
        ])('should convert raw value `%s` masked value `%s`', (value, expected) => {
            const result = util.applyMask(maskUndefined, value, '');
            expect(result.formattedValue).toBe(expected);
        });
    });
});

describe('remove mask', () => {
    describe('expiry date', () => {
        it.each([
            ['1', '1'],
            ['12', '12'],
            ['12-3', '123'],
            ['12-34', '1234'],
            ['12-345', '1234'],
        ])('should convert masked value `%s` to unmasked value `%s`', (value, expected) => {
            const result = util.removeMask(maskExpiryDate, value);
            expect(result).toBe(expected);
        });
    });
    describe('card number', () => {
        it.each([
            ['1', '1'],
            ['12', '12'],
            ['123', '123'],
            ['1234', '1234'],
            ['1234 5', '12345'],
            ['1234 56', '123456'],
            ['1234 567', '1234567'],
            ['1234 5678', '12345678'],
            ['1234 5678 9', '123456789'],
            ['1234 5678 90', '1234567890'],
            ['1234 5678 901', '12345678901'],
            ['1234 5678 9012', '123456789012'],
            ['1234 5678 9012 3', '1234567890123'],
            ['1234 5678 9012 34', '12345678901234'],
            ['1234 5678 9012 345', '123456789012345'],
            ['1234 5678 9012 3456', '1234567890123456'],
            ['1234 5678 9012 3456 7', '12345678901234567'],
            ['1234 5678 9012 3456 78', '123456789012345678'],
            ['1234 5678 9012 3456 789', '1234567890123456789'],
            ['1234 5678 9012 3456 7890', '1234567890123456789'],
        ])('should convert masked value `%s` to unmasked value `%s`', (value, expected) => {
            const result = util.removeMask(maskCardNumber, value);
            expect(result).toBe(expected);
        });
    });
    describe('no mask', () => {
        it.each([
            ['1', '1'],
            ['12', '12'],
            ['12-3', '12-3'],
            ['12-34', '12-34'],
            ['12-345', '12-345'],
        ])('should convert masked value `%s` to unmasked value `%s`', (value, expected) => {
            const result = util.removeMask(maskUndefined, value);
            expect(result).toBe(expected);
        });
    });
});
