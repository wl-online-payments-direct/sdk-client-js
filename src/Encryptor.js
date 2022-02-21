define("onlinepaymentssdk.Encryptor", ["onlinepaymentssdk.core", "onlinepaymentssdk.promise", "onlinepaymentssdk.JOSEEncryptor", "onlinepaymentssdk.Util"], function(onlinepaymentssdk, Promise, JOSEEncryptor, Util) {

	var _util = Util.getInstance();

	var Encryptor = function(publicKeyResponsePromise) {
		this.encrypt = function(paymentRequest) {
			var promise = new Promise();
			var encryptedString = '';
			publicKeyResponsePromise.then(function (publicKeyResponse) {
				if (paymentRequest.isValid()) {

					var blob = {
					   clientSessionId: paymentRequest.getClientSessionID()
					   ,nonce: forge.util.bytesToHex(forge.random.getBytesSync(16))
					   ,paymentProductId: paymentRequest.getPaymentProduct().id
                       ,tokenize: paymentRequest.getTokenize()
                    };

					if (paymentRequest.getAccountOnFile()) {
                        blob["accountOnFileId"] = paymentRequest.getAccountOnFile().id;
                    }

                    var paymentValues = [], values = paymentRequest.getUnmaskedValues();
                    var ownValues = Object.getOwnPropertyNames(values);
					for (var i = 0; i < ownValues.length; i++) {
						var propertyName = ownValues[i];
						if (propertyName !== "length") {
							paymentValues.push({
								key: propertyName,
								value: values[propertyName]
							})
						}
					}
                    blob["paymentValues"] = paymentValues;

					blob["collectedDeviceInformation"] = _util.collectDeviceInformation();

					// use blob to encrypt
					var joseEncryptor = new JOSEEncryptor();
					encryptedString = joseEncryptor.encrypt(blob, publicKeyResponse);
					promise.resolve(encryptedString);
				} else {
					promise.reject(paymentRequest.getErrorMessageIds());
				}
			}, function (error) {
				promise.reject(error);
			});
			return promise;
		};
	};

	onlinepaymentssdk.Encryptor = Encryptor;
	return Encryptor;
});
