define("directsdk.Tooltip", ["directsdk.core"], function(directsdk) {

	var Tooltip = function (json) {
		this.json = json;
		this.image = json.image;
		this.label = json.label;
	};

	directsdk.Tooltip = Tooltip;
	return Tooltip;
});