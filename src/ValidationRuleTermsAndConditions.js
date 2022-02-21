define("onlinepaymentssdk.ValidationRuleTermsAndConditions", ["onlinepaymentssdk.core"], function(onlinepaymentssdk) {

	var ValidationRuleTermsAndConditions = function(json) {
		this.json = json;
		this.type = json.type,
		this.errorMessageId = json.type;

		this.validate = function(value) {
			return true === value || "true" === value;
		};
	};

	onlinepaymentssdk.ValidationRuleTermsAndConditions = ValidationRuleTermsAndConditions;
	return ValidationRuleTermsAndConditions;
});