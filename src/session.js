define("onlinepaymentssdk.Session", ["onlinepaymentssdk.core", "onlinepaymentssdk.C2SCommunicator", "onlinepaymentssdk.C2SCommunicatorConfiguration", "onlinepaymentssdk.promise", "onlinepaymentssdk.C2SPaymentProductContext", "onlinepaymentssdk.BasicPaymentProducts", "onlinepaymentssdk.PaymentProduct", "onlinepaymentssdk.BasicPaymentItems", "onlinepaymentssdk.PaymentRequest", "onlinepaymentssdk.Encryptor"], function (onlinepaymentssdk, C2SCommunicator, C2SCommunicatorConfiguration, Promise, C2SPaymentProductContext, BasicPaymentProducts, PaymentProduct, BasicPaymentItems, PaymentRequest, Encryptor) {
	var APIVERSION = "client/v1";
	var session = function (sessionDetails, paymentProduct) {

		var _c2SCommunicatorConfiguration = new C2SCommunicatorConfiguration(sessionDetails, APIVERSION),
			_c2sCommunicator = new C2SCommunicator(_c2SCommunicatorConfiguration, paymentProduct),
			_session = this,
			_paymentProductId, _paymentProduct, _paymentRequestPayload, _paymentRequest;
		this.clientApiUrl = _c2SCommunicatorConfiguration.clientApiUrl;
		this.assetUrl = _c2SCommunicatorConfiguration.assetUrl;

		this.getBasicPaymentProducts = function (paymentRequestPayload, paymentProductSpecificInputs) {
			var promise = new Promise();
			var c2SPaymentProductContext = new C2SPaymentProductContext(paymentRequestPayload);
			_c2sCommunicator.getBasicPaymentProducts(c2SPaymentProductContext, paymentProductSpecificInputs).then(function (json) {
				_paymentRequestPayload = paymentRequestPayload;
				var paymentProducts = new BasicPaymentProducts(json);
				promise.resolve(paymentProducts);
			}, function () {
				promise.reject();
			});
			return promise;
		};

		this.getBasicPaymentItems = function (paymentRequestPayload, useGroups, paymentProductSpecificInputs) {
			var promise = new Promise();
			_session.getBasicPaymentProducts(paymentRequestPayload, paymentProductSpecificInputs).then(function (products) {
				var basicPaymentItems = new BasicPaymentItems(products, null);
				promise.resolve(basicPaymentItems);
			}, function () {
				promise.reject();
			});
			return promise;
		};

		this.getPaymentProduct = function (paymentProductId, paymentRequestPayload, paymentProductSpecificInputs) {
			var promise = new Promise();
			_paymentProductId = paymentProductId;
			var c2SPaymentProductContext = new C2SPaymentProductContext(_paymentRequestPayload || paymentRequestPayload);
			_c2sCommunicator.getPaymentProduct(paymentProductId, c2SPaymentProductContext, paymentProductSpecificInputs).then(function (response) {
				_paymentProduct = new PaymentProduct(response);
				promise.resolve(_paymentProduct);
			}, function () {
				_paymentProduct = null;
				promise.reject();
			});
			return promise;
		};

		this.getIinDetails = function (partialCreditCardNumber, paymentRequestPayload) {
			partialCreditCardNumber = partialCreditCardNumber.replace(/ /g, '');
			if (partialCreditCardNumber.length >= 8) {
				partialCreditCardNumber = partialCreditCardNumber.substring(0, 8);
			} else {
				partialCreditCardNumber = partialCreditCardNumber.substring(0, 6);
			}

			var c2SPaymentProductContext = new C2SPaymentProductContext(_paymentRequestPayload || paymentRequestPayload);
			return _c2sCommunicator.getPaymentProductIdByCreditCardNumber(partialCreditCardNumber, c2SPaymentProductContext);
		};

		this.getPublicKey = function () {
			return _c2sCommunicator.getPublicKey();
		};

		this.getPaymentProductNetworks = function (paymentProductId, paymentRequestPayload) {
			var promise = new Promise();
			var c2SPaymentProductContext = new C2SPaymentProductContext(paymentRequestPayload);
			_c2sCommunicator.getPaymentProductNetworks(paymentProductId, c2SPaymentProductContext).then(function (response) {
				_paymentRequestPayload = paymentRequestPayload;
				promise.resolve(response);
			}, function () {
				promise.reject();
			});
			return promise;
		};

		this.getPaymentRequest = function () {
			if (!_paymentRequest) {
				_paymentRequest = new PaymentRequest(_c2SCommunicatorConfiguration.clientSessionId);
			}
			return _paymentRequest;
		};

		this.getEncryptor = function () {
			var publicKeyResponsePromise = _c2sCommunicator.getPublicKey();
			return new Encryptor(publicKeyResponsePromise);
		};

		this.createPaymentProductSession = function (paymentProductId, paymentRequestPayload) {
			return _c2sCommunicator.createPaymentProductSession(paymentProductId, paymentRequestPayload);
		};

		this.createApplePayPayment = function (context, paymentProductSpecificInputs, networks) {
			var promise = new Promise();
			_c2sCommunicator.initApplePayPayment(context, paymentProductSpecificInputs, networks).then(function (res) {
				promise.resolve(res)
			}, function (res) {
				promise.reject(res);
			});
			return promise;
		}

		/* In case a full JSON representation of a payment product is already available in context,
			 this method can be used instead of getPaymentProduct for the same (but synchronous) result. */
		this.transformPaymentProductJSON = function (json) {
			return new PaymentProduct(_c2sCommunicator.transformPaymentProductJSON(json))
		};
	};
	onlinepaymentssdk.Session = session;
	return session;
});
