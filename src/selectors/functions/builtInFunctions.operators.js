define([
	'../dataTypes/IntegerValue',
	'../dataTypes/Sequence',
	'../dataTypes/sortNodeValues'
], function (
	IntegerValue,
	Sequence,
	sortNodeValues
) {
	'use strict';


	function opTo (dynamicContext, fromValue, toValue) {
		var from = fromValue.value[0].value,
			to = toValue.value[0].value;
		if (from > to) {
			return Sequence.empty();
		}
		// RangeExpr is inclusive: 1 to 3 will make (1,2,3)
		return new Sequence(
			Array.apply(null, {length: to - from + 1})
				.map(function (_, i) {
					return new IntegerValue(from+i);
				}));
	}

	function opExcept (dynamicContext, firstNodes, secondNodes) {
		var allNodes = firstNodes.value.filter(function (nodeA) {
				return secondNodes.value.every(function (nodeB) {
					return nodeA !== nodeB;
				});
			});
		return new Sequence(sortNodeValues(dynamicContext.domFacade, allNodes));
	}

	function opIntersect (dynamicContext, firstNodes, secondNodes) {
		var allNodes = firstNodes.value.filter(function (nodeA) {
				return secondNodes.value.some(function (nodeB) {
					return nodeA === nodeB;
				});
			});
		return new Sequence(sortNodeValues(dynamicContext.domFacade, allNodes));
	}


	return {
		declarations: [
		{
			name: 'op:except',
			argumentTypes: ['node()*', 'node()*'],
			returnType: 'node()*',
			callFunction: opExcept
		},

		{
			name: 'op:intersect',
			argumentTypes: ['node()*', 'node()*'],
			returnType: 'node()*',
			callFunction: opIntersect
		},

		{
			name: 'op:to',
			argumentTypes: ['xs:integer', 'xs:integer'],
			returnType: 'xs:integer*',
			callFunction: opTo
		},
		],
		functions: {
			except: opExcept,
			intersect: opIntersect,
			to: opTo
		}
	};
});
