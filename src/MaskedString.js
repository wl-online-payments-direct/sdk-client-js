define("onlinepaymentssdk.MaskedString", ["onlinepaymentssdk.core"], function(onlinepaymentssdk) {

	var MaskedString = function(formattedValue, cursorIndex) {

		this.formattedValue = formattedValue;
		this.cursorIndex = cursorIndex;
	};

	onlinepaymentssdk.MaskedString = MaskedString;
	return MaskedString;
});