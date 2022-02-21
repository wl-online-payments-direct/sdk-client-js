define("onlinepaymentssdk.PaymentProductDisplayHints", ["onlinepaymentssdk.core"], function(onlinepaymentssdk) {

	var PaymentProductDisplayHints = function (json) {
		this.json = json;
		this.displayOrder = json.displayOrder;
		this.label = json.label;
		this.logo = json.logo;
	};

	onlinepaymentssdk.PaymentProductDisplayHints = PaymentProductDisplayHints;
	return PaymentProductDisplayHints;
});