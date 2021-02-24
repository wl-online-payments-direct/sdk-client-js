define("directsdk.MaskedString", ["directsdk.core"], function(directsdk) {

	var MaskedString = function(formattedValue, cursorIndex) {

		this.formattedValue = formattedValue;
		this.cursorIndex = cursorIndex;
	};

	directsdk.MaskedString = MaskedString;
	return MaskedString;
});