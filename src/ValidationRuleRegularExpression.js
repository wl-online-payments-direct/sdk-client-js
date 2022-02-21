define("onlinepaymentssdk.ValidationRuleRegularExpression", ["onlinepaymentssdk.core"], function(onlinepaymentssdk) {

	var ValidationRuleRegularExpression = function(json) {
		this.json = json;
        this.type = json.type,
        this.errorMessageId = json.type;
		this.regularExpression = json.attributes.regularExpression;

		this.validate = function(value) {
			var regexp = new RegExp(this.regularExpression);
			return regexp.test(value);
		};
	};

	onlinepaymentssdk.ValidationRuleRegularExpression = ValidationRuleRegularExpression;
	return ValidationRuleRegularExpression;
});
