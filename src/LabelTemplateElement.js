define("onlinepaymentssdk.LabelTemplateElement", ["onlinepaymentssdk.core"], function(onlinepaymentssdk) {

	var LabelTemplateElement = function (json) {
		this.json = json;
		this.attributeKey = json.attributeKey;
		this.mask = json.mask;
		this.wildcardMask = json.mask ? json.mask.replace(/9/g, "*") : "";
	};

	onlinepaymentssdk.LabelTemplateElement = LabelTemplateElement;
	return LabelTemplateElement;
});