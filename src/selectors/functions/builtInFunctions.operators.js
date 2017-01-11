import IntegerValue from '../dataTypes/IntegerValue';
import Sequence from '../dataTypes/Sequence';
import sortNodeValues from '../dataTypes/sortNodeValues';

function opTo (_dynamicContext, fromValue, toValue) {
	var from = fromValue.value[0].value,
	to = toValue.value[0].value;
	if (from > to) {
		return Sequence.empty();
	}
	// RangeExpr is inclusive: 1 to 3 will make (1,2,3)
	var arr = [];
	for (var i = 0; i < to - from + 1; i++) {
		arr[i] = new IntegerValue(from + i);
	}
	return new Sequence(arr);
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


export default {
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
