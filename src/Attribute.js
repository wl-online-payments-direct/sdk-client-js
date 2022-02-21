define("onlinepaymentssdk.Attribute", ["onlinepaymentssdk.core"], function(onlinepaymentssdk) {

	var Attribute = function (json) {
		this.json = json;
		this.key = json.key;
		this.value = json.value;
		this.status = json.status;
		this.mustWriteReason = json.mustWriteReason;
	};

	onlinepaymentssdk.Attribute = Attribute;
	return Attribute;
});