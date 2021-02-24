define("directsdk.LabelTemplateElement", ["directsdk.core"], function(directsdk) {

	var LabelTemplateElement = function (json) {
		this.json = json;
		this.attributeKey = json.attributeKey;
		this.mask = json.mask;
		this.wildcardMask = json.mask ? json.mask.replace(/9/g, "*") : "";
	};

	directsdk.LabelTemplateElement = LabelTemplateElement;
	return LabelTemplateElement;
});