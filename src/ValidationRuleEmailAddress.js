define("directsdk.ValidationRuleEmailAddress", ["directsdk.core"], function(directsdk) {

	var ValidationRuleEmailAddress = function(json) {
		this.json = json;
		this.type = json.type,
		this.errorMessageId = json.type;

		this.validate = function(value) {
			var regexp = new RegExp(/^[^@\.]+(\.[^@\.]+)*@([^@\.]+\.)*[^@\.]+\.[^@\.][^@\.]+$/i);
			return regexp.test(value);
		};
	};

	directsdk.ValidationRuleEmailAddress = ValidationRuleEmailAddress;
	return ValidationRuleEmailAddress;
});