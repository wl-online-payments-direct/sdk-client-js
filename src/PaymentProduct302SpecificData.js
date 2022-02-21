define("onlinepaymentssdk.PaymentProduct302SpecificData", ["onlinepaymentssdk.core"], function(onlinepaymentssdk) {

	var PaymentProduct302SpecificData = function (json) {
		this.json = json;
		this.networks = json.networks;
	};

	onlinepaymentssdk.PaymentProduct302SpecificData = PaymentProduct302SpecificData;
	return PaymentProduct302SpecificData;
});