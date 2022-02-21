define("onlinepaymentssdk.IinDetailsResponse", ["onlinepaymentssdk.core", "onlinepaymentssdk.promise"], function(onlinepaymentssdk, Promise) {

	var IinDetailsResponse = function () {
		this.status = '';
		this.countryCode = '';
		this.paymentProductId = '';
		this.isAllowedInContext = '';
		this.coBrands = [];
	};
	onlinepaymentssdk.IinDetailsResponse = IinDetailsResponse;
	return IinDetailsResponse;
});