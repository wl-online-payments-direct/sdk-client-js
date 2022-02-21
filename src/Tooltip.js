define("onlinepaymentssdk.Tooltip", ["onlinepaymentssdk.core"], function(onlinepaymentssdk) {

	var Tooltip = function (json) {
		this.json = json;
		this.image = json.image;
		this.label = json.label;
	};

	onlinepaymentssdk.Tooltip = Tooltip;
	return Tooltip;
});