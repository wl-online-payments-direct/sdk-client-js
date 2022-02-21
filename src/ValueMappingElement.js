define("onlinepaymentssdk.ValueMappingElement", ["onlinepaymentssdk.core"], function(onlinepaymentssdk) {

	var ValueMappingElement = function (json) {
		this.json = json;
		this.displayName = json.displayName;
		this.value = json.value;
	};

	onlinepaymentssdk.ValueMappingElement = ValueMappingElement;
	return ValueMappingElement;
});