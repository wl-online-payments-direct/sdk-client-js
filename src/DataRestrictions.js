define("onlinepaymentssdk.DataRestrictions", ["onlinepaymentssdk.core", "onlinepaymentssdk.ValidationRuleExpirationDate", "onlinepaymentssdk.ValidationRuleFixedList", "onlinepaymentssdk.ValidationRuleLength", "onlinepaymentssdk.ValidationRuleLuhn", "onlinepaymentssdk.ValidationRuleRange", "onlinepaymentssdk.ValidationRuleRegularExpression", "onlinepaymentssdk.ValidationRuleEmailAddress", "onlinepaymentssdk.ValidationRuleTermsAndConditions", "onlinepaymentssdk.ValidationRuleIban", "onlinepaymentssdk.ValidationRuleFactory"], function(onlinepaymentssdk, ValidationRuleExpirationDate, ValidationRuleFixedList, ValidationRuleLength, ValidationRuleLuhn, ValidationRuleRange, ValidationRuleRegularExpression, ValidationRuleEmailAddress, ValidationRuleTermsAndConditions, ValidationRuleIban, ValidationRuleFactory) {

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

	onlinepaymentssdk.DataRestrictions = DataRestrictions;
	return DataRestrictions;
});