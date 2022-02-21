define("onlinepaymentssdk.BasicPaymentItems", ["onlinepaymentssdk.core"], function(onlinepaymentssdk) {
	"use strict";

		var _parseJson = function (_products, _basicPaymentItems) {
		_basicPaymentItems.basicPaymentItems = JSON.parse(JSON.stringify(_products.basicPaymentProducts));
		for (var i = 0, il = _basicPaymentItems.basicPaymentItems.length; i < il; i++) {
			var basicPaymentItem = _basicPaymentItems.basicPaymentItems[i];
			_basicPaymentItems.basicPaymentItemById[basicPaymentItem.id] = basicPaymentItem;
			if (basicPaymentItem.accountsOnFile) {
				var aofs = basicPaymentItem.accountsOnFile;
				for (var j = 0, jl = aofs.length; j < jl; j++) {
					var aof = aofs[j];
					_basicPaymentItems.accountsOnFile.push(aof);
					_basicPaymentItems.accountOnFileById[aof.id] = aof;
				}
			}
		};
	};

	var BasicPaymentItems = function (products) {
		this.basicPaymentItems = [];
		this.basicPaymentItemById = {};
		this.accountsOnFile = [];
		this.accountOnFileById = {};
		_parseJson(products, this);
	};
	onlinepaymentssdk.BasicPaymentItems = BasicPaymentItems;
	return BasicPaymentItems;
});