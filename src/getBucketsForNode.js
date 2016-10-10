define([
	'fontoxml-dom-utils/domInfo'
], function (
	domInfo
) {
	'use strict';

	return function getBucketsForNode (node) {
		var buckets = [];

		buckets.push('type-' + node.nodeType);

		if (domInfo.isElement(node)) {
			buckets.push('name-' + node.nodeName);
		}

		return buckets;
	};
});
