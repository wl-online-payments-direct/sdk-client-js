export class ApplePay {
    isApplePayAvailable(): boolean {
        return Object.hasOwn(window, 'ApplePaySession') && ApplePaySession.canMakePayments();
    }
}
