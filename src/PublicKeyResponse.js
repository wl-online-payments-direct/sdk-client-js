define("directsdk.PublicKeyResponse", ["directsdk.core"], function(directsdk) {

	var PublicKeyResponse = function(json) {
		this.json = json;
		this.keyId = json.keyId;
		this.publicKey = json.publicKey;
	};

	directsdk.PublicKeyResponse = PublicKeyResponse;
	return PublicKeyResponse;
});