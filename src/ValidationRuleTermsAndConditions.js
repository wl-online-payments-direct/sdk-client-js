define("directsdk.ValidationRuleTermsAndConditions", ["directsdk.core"], function(directsdk) {

	var ValidationRuleTermsAndConditions = function(json) {
		this.json = json;
		this.type = json.type,
		this.errorMessageId = json.type;

		this.validate = function(value) {
			return true === value || "true" === value;
		};
	};

	directsdk.ValidationRuleTermsAndConditions = ValidationRuleTermsAndConditions;
	return ValidationRuleTermsAndConditions;
});