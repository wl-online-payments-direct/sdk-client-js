define("directsdk.ValueMappingElement", ["directsdk.core"], function(directsdk) {

	var ValueMappingElement = function (json) {
		this.json = json;
		this.displayName = json.displayName;
		this.value = json.value;
	};

	directsdk.ValueMappingElement = ValueMappingElement;
	return ValueMappingElement;
});