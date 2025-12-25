import { PaymentProduct } from '../paymentProduct/PaymentProduct';
import { PaymentRequestField } from './PaymentRequestField';
import { InvalidArgumentError, type ValidationErrorMessage, ValidationResult } from '../../dataModel';
import type { AccountOnFile } from '../paymentProduct/AccountOnFile';
import type { PaymentProductField } from '../paymentProduct/PaymentProductField';

export class PaymentRequest {
    private readonly paymentProduct: PaymentProduct;
    private accountOnFile?: AccountOnFile;
    private readonly fields: Record<string, PaymentRequestField>;

    constructor(
        paymentProduct: PaymentProduct,
        accountOnFile?: AccountOnFile,
        private tokenize = false,
    ) {
        this.paymentProduct = paymentProduct;
        this.accountOnFile = accountOnFile;
        this.fields = {};
    }

    getField(fieldId: string): PaymentRequestField {
        let readOnly = false;
        if (this.accountOnFile) {
            readOnly = !this.accountOnFile.isWritable(fieldId);
        }

        if (!this.fields[fieldId]) {
            const definition = this.paymentProduct.getField(fieldId);
            if (!definition) {
                throw new InvalidArgumentError(`Field ${fieldId} not found`);
            }

            this.fields[fieldId] = new PaymentRequestField(definition, readOnly);
        }

        return this.fields[fieldId];
    }

    getValues(): Record<string, string> {
        const result: Record<string, string> = {};

        for (const key in this.fields) {
            const field = this.fields[key];

            if (!field) {
                continue;
            }

            const value = field.getValue();

            if (value) {
                result[key] = value;
            }
        }

        return result;
    }

    getPaymentProductId(): number {
        return this.paymentProduct.id;
    }

    setAccountOnFile(accountOnFile?: AccountOnFile) {
        if (!accountOnFile) {
            return;
        }

        Object.values(this.fields).forEach((field) => {
            if (!accountOnFile.isWritable(field.getId())) {
                delete this.fields[field.getId()];
            }
        });

        this.accountOnFile = accountOnFile;
    }

    getAccountOnFile(): AccountOnFile | undefined {
        return this.accountOnFile;
    }

    getTokenize(): boolean {
        return this.tokenize;
    }

    setTokenize(tokenize: boolean) {
        this.tokenize = tokenize;
    }

    validate(): ValidationResult {
        const allErrors: ValidationErrorMessage[] = [];

        if (this.accountOnFile && this.accountOnFile.getRequiredAttributes().length > 0) {
            const requiredAttributes = this.accountOnFile.getRequiredAttributes();

            const requiredFields = this.paymentProduct
                .getFields()
                .filter((a) => requiredAttributes.some((b) => a.id === b.key));

            this.validateFields(requiredFields, allErrors);
        } else {
            this.validateFields(this.paymentProduct.getFields(), allErrors);
        }

        return new ValidationResult(allErrors.length === 0, allErrors);
    }

    getValue(fieldId: string): string | undefined {
        return this.fields[fieldId]?.getValue();
    }

    setValue(fieldId: string, value: string) {
        this.getField(fieldId).setValue(value);
    }

    validateFields = (fields: readonly PaymentProductField[], errors: ValidationErrorMessage[]) => {
        if (!fields || fields.length === 0) {
            return;
        }

        fields.forEach((fieldDefinition) => {
            const field = this.getField(fieldDefinition.id);
            errors.push(...field.validate().errors);
        });
    };
}
