define("onlinepaymentssdk.PublicKeyResponse", ["onlinepaymentssdk.core"], function(onlinepaymentssdk) {

	var PublicKeyResponse = function(json) {
		this.json = json;
		this.keyId = json.keyId;
		this.publicKey = json.publicKey;
	};

	onlinepaymentssdk.PublicKeyResponse = PublicKeyResponse;
	return PublicKeyResponse;
});