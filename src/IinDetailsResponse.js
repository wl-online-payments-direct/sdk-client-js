define("directsdk.IinDetailsResponse", ["directsdk.core", "directsdk.promise"], function(directsdk, Promise) {

	var IinDetailsResponse = function () {
		this.status = '';
		this.countryCode = '';
		this.paymentProductId = '';
		this.isAllowedInContext = '';
		this.coBrands = [];
	};
	directsdk.IinDetailsResponse = IinDetailsResponse;
	return IinDetailsResponse;
});