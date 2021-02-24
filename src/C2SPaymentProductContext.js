define("directsdk.C2SPaymentProductContext", ["directsdk.core"], function(directsdk) {

    var C2SPaymentProductContext = function (payload) {
        this.totalAmount = typeof payload.totalAmount !== 'undefined' ? payload.totalAmount : '';
        this.countryCode = payload.countryCode;
        this.currency = payload.currency;

        if (typeof payload.locale !== 'undefined') {
            this.locale = payload.locale;
        }

        if (typeof payload.accountOnFileId !== 'undefined') {
            this.accountOnFileId = parseInt(payload.accountOnFileId);
        }
    };

  directsdk.C2SPaymentProductContext = C2SPaymentProductContext;
  return C2SPaymentProductContext;
});
