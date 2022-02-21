define("onlinepaymentssdk.BasicPaymentProduct", ["onlinepaymentssdk.core", "onlinepaymentssdk.AccountOnFile", "onlinepaymentssdk.PaymentProductDisplayHints", "onlinepaymentssdk.PaymentProduct302SpecificData"], function(onlinepaymentssdk, AccountOnFile, PaymentProductDisplayHints, PaymentProduct302SpecificData) {

	var _parseJSON = function (_json, _paymentProduct, _accountsOnFile, _accountOnFileById) {
		if (_json.accountsOnFile) {
			for (var i = 0, il = _json.accountsOnFile.length; i < il; i++) {
				var accountOnFile = new AccountOnFile(_json.accountsOnFile[i]);
				_accountsOnFile.push(accountOnFile);
				_accountOnFileById[accountOnFile.id] = accountOnFile;
			}
		}
		if (_json.paymentProduct302SpecificData) {
			_paymentProduct.paymentProduct302SpecificData = new PaymentProduct302SpecificData(_json.paymentProduct302SpecificData);
		}

		if(_json.displayHintsList){
			for (var i = 0, il = _json.displayHintsList.length; i < il; i++) {
				var displayHints = new PaymentProductDisplayHints(_json.displayHintsList[i]);
				_paymentProduct.displayHintsList.push(displayHints);
			}
		}
	};

	var BasicPaymentProduct = function (json) {
		this.json = json;
		this.json.type = "product";
		this.accountsOnFile = [];
		this.accountOnFileById = {};
		this.allowsRecurring = json.allowsRecurring;
		this.allowsTokenization = json.allowsTokenization;
		this.displayHints = new PaymentProductDisplayHints(json.displayHints);
		this.displayHintsList = [];
		this.id = json.id;
		this.maxAmount = json.maxAmount;
		this.minAmount = json.minAmount;
		this.paymentMethod = json.paymentMethod;
		this.mobileIntegrationLevel = json.mobileIntegrationLevel;
		this.usesRedirectionTo3rdParty = json.usesRedirectionTo3rdParty;

		_parseJSON(json, this, this.accountsOnFile, this.accountOnFileById);
	};

	onlinepaymentssdk.BasicPaymentProduct = BasicPaymentProduct;
	return BasicPaymentProduct;
});