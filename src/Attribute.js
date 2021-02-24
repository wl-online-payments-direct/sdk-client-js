define("directsdk.Attribute", ["directsdk.core"], function(directsdk) {

	var Attribute = function (json) {
		this.json = json;
		this.key = json.key;
		this.value = json.value;
		this.status = json.status;
		this.mustWriteReason = json.mustWriteReason;
	};

	directsdk.Attribute = Attribute;
	return Attribute;
});