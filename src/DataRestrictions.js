define("directsdk.DataRestrictions", ["directsdk.core", "directsdk.ValidationRuleExpirationDate", "directsdk.ValidationRuleFixedList", "directsdk.ValidationRuleLength", "directsdk.ValidationRuleLuhn", "directsdk.ValidationRuleRange", "directsdk.ValidationRuleRegularExpression", "directsdk.ValidationRuleEmailAddress", "directsdk.ValidationRuleTermsAndConditions", "directsdk.ValidationRuleIban", "directsdk.ValidationRuleFactory"], function(directsdk, ValidationRuleExpirationDate, ValidationRuleFixedList, ValidationRuleLength, ValidationRuleLuhn, ValidationRuleRange, ValidationRuleRegularExpression, ValidationRuleEmailAddress, ValidationRuleTermsAndConditions, ValidationRuleIban, ValidationRuleFactory) {

	var DataRestrictions = function (json, mask) {

		var _parseJSON = function (_json, _validationRules, _validationRuleByType) {
		    var validationRuleFactory = new ValidationRuleFactory();
			if (_json.validators) {
				for (var key in _json.validators) {
					var validationRule = validationRuleFactory.makeValidator({type: key, attributes: _json.validators[key]});
					if (validationRule) {
						_validationRules.push(validationRule);
						_validationRuleByType[validationRule.type] = validationRule;
					}
				}
			}
		};

		this.json = json;
		this.isRequired = json.isRequired;
		this.validationRules = [];
		this.validationRuleByType = {};

		_parseJSON(json, this.validationRules, this.validationRuleByType);
	};

	directsdk.DataRestrictions = DataRestrictions;
	return DataRestrictions;
});