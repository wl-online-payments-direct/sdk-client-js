export {};

declare global {
    const ApplePaySession: {
        canMakePayments(): boolean;
        canMakePaymentsWithActiveCard(merchantId: string): Promise<boolean>;
        supportsVersion(version: number): boolean;
    };
}
