export class ApplePay {
    static isApplePayAvailable(): boolean {
        return Object.hasOwn(window, 'ApplePaySession') && ApplePaySession.canMakePayments();
    }
}
