define("onlinepaymentssdk.ValidationRuleEmailAddress", ["onlinepaymentssdk.core"], function(onlinepaymentssdk) {

	var ValidationRuleEmailAddress = function(json) {
		this.json = json;
		this.type = json.type,
		this.errorMessageId = json.type;

		this.validate = function(value) {
			var regexp = new RegExp(/^[^@\.]+(\.[^@\.]+)*@([^@\.]+\.)*[^@\.]+\.[^@\.][^@\.]+$/i);
			return regexp.test(value);
		};
	};

	onlinepaymentssdk.ValidationRuleEmailAddress = ValidationRuleEmailAddress;
	return ValidationRuleEmailAddress;
});