define([
	'fontoxml-blueprints'
], function (
	blueprints
) {
	'use strict';

	var blueprintQuery = blueprints.blueprintQuery;

	return function sortNodeValues (domFacade, nodeValues) {
		return nodeValues
			.sort(function (nodeValueA, nodeValueB) {
				var valueA, valueB;
				if (nodeValueA.instanceOfType('attribute()') && !nodeValueB.instanceOfType('attribute()')) {
					valueA = domFacade.getParentNode(nodeValueA.value);
					valueB = nodeValueB.value;
					if (valueA === valueB) {
						// Same element, so A
						return 1;
					}
				} else if (nodeValueB.instanceOfType('attribute()') && !nodeValueA.instanceOfType('attribute()')) {
					valueA = nodeValueA.value;
					valueB = domFacade.getParentNode(valueB.value);
					if (valueB === valueA) {
						// Same element, so B before A
						return -1;
					}
				} else if (nodeValueA.instanceOfType('attribute()') && nodeValueB.instanceOfType('attribute()')) {
					if (domFacade.getParentNode(nodeValueB.value) === domFacade.getParentNode(nodeValueA.value)) {
						// Sort on attributes name
						return nodeValueA.value.nodeName > nodeValueB.value.nodeName ? 1 : -1;
					}
					valueA = domFacade.getParentNode(nodeValueA.value);
					valueB = domFacade.getParentNode(nodeValueB.value);
				} else {
					valueA = nodeValueA.value;
					valueB = nodeValueB.value;
				}
				return blueprintQuery.compareNodePositions(domFacade, valueA, valueB);
			})
			.filter(function (nodeValue, i, sortedNodes) {
				if (i === 0) {
					return true;
				}
				return nodeValue !== sortedNodes[i - 1];
			});
	};
});
