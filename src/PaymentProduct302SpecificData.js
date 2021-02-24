define("directsdk.PaymentProduct302SpecificData", ["directsdk.core"], function(directsdk) {

	var PaymentProduct302SpecificData = function (json) {
		this.json = json;
		this.networks = json.networks;
	};

	directsdk.PaymentProduct302SpecificData = PaymentProduct302SpecificData;
	return PaymentProduct302SpecificData;
});