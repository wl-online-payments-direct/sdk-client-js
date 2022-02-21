define("onlinepaymentssdk.ApplePay", ["onlinepaymentssdk.core", "onlinepaymentssdk.promise", "onlinepaymentssdk.Util"], function (onlinepaymentssdk, Promise) {
  var _C2SCommunicator = null;
  var _context = null;

  var ApplePay = function () {
    this.isApplePayAvailable = function () {
      if (window.ApplePaySession) {
        if (ApplePaySession.canMakePayments()) {
          return true
        } else {
          return false
        }
      } else {
        return false
      };
    };
    this.initPayment = function (context, C2SCommunicator) {
      var promise = new Promise();
      _context = context;
      _C2SCommunicator = C2SCommunicator;

      var payment = {
        currencyCode: _context.currency,
        countryCode: _context.countryCode,
        total: {
          label: _context.displayName,
          amount: _context.totalAmount / 100,
        },
        supportedNetworks: _context.networks,
        merchantCapabilities: ['supports3DS'],
      };

      var applePaySession = new ApplePaySession(1, payment);
      applePaySession.begin();

      applePaySession.onvalidatemerchant = function (event) {
        _context.validationURL = event.validationURL;
        _context.domainName = window.location.hostname;
        _C2SCommunicator.createPaymentProductSession('302', _context).then(function (merchantSession) {
          try {
            applePaySession.completeMerchantValidation(JSON.parse(merchantSession.paymentProductSession302SpecificOutput.sessionObject));
          }
          catch{
            promise.reject({ message: 'Error completing merchant validation' });
            applePaySession.abort();
          }
        }, function () {
          promise.reject({ message: 'Error completing merchant validation' });
          applePaySession.abort();
        })
      };

      applePaySession.onpaymentauthorized = function (event) {
        if (!event.payment.token) {
          status = ApplePaySession.STATUS_FAILURE;
          promise.reject({ message: 'Error payment authorization' });
        }
        status = ApplePaySession.STATUS_SUCCESS;
        promise.resolve({ message: 'Payment authorized', data: event.payment.token });
        applePaySession.completePayment(status);
      };
      return promise;
    };
  }

  onlinepaymentssdk.ApplePay = ApplePay;
  return ApplePay;
});