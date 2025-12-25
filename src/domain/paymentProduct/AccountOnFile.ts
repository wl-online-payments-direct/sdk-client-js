import { Formatter } from '../../infrastructure/utils/Formatter';
import { AccountOnFileAttributeStatus, type AccountOnFileJson } from '../../types';
import { Attribute } from '../../dataModel/Attribute';

export class AccountOnFile {
    readonly id: string;
    readonly paymentProductId: number;
    readonly label?: string;
    private readonly attributes: Attribute[];
    private readonly attributeByKey: Record<string, Attribute | undefined>;

    constructor(json: AccountOnFileJson) {
        this.attributes = [];
        this.attributeByKey = {};
        this.id = json.id;
        this.paymentProductId = json.paymentProductId;

        AccountOnFile.parseJson(json, this.attributes, this.attributeByKey);

        const alias = this.attributeByKey.alias?.value;
        const mask = json.displayHints?.labelTemplate?.find((t) => t.attributeKey === 'alias')?.mask;
        this.label = Formatter.applyMask(mask, alias) ?? alias;
    }

    getValue(fieldId: string): string | undefined {
        return this.attributeByKey[fieldId]?.value;
    }

    getRequiredAttributes(): Attribute[] {
        return this.attributes.filter((attribute) => attribute.status === AccountOnFileAttributeStatus.MUST_WRITE);
    }

    isWritable(fieldId: string): boolean {
        return this.attributeByKey[fieldId]?.status !== AccountOnFileAttributeStatus.READ_ONLY;
    }

    private static parseJson(
        json: AccountOnFileJson,
        attributes: Attribute[],
        attributeByKey: Record<string, Attribute | undefined>,
    ): void {
        if (json.attributes) {
            for (const attr of json.attributes) {
                const attribute = new Attribute(attr);
                attributes.push(attribute);
                attributeByKey[attribute.key] = attribute;
            }
        }
    }
}
