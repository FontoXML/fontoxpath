import IntegerValue from '../dataTypes/IntegerValue';
import Sequence from '../dataTypes/Sequence';
import { sortNodeValues } from '../dataTypes/documentOrderUtils';

function opTo (_dynamicContext, fromValue, toValue) {
	var from = fromValue.first().value,
		to = toValue.first().value;
	if (from > to) {
		return Sequence.empty();
	}
	// RangeExpr is inclusive: 1 to 3 will make (1,2,3)
	return new Sequence({
		next: () => {
			if (from > to) {
				return { done: true };
			}
			return { done: false, value: new IntegerValue(from++) };
		}
	}, to - from + 1);
}

/**
 * @param   {../DynamicContext}  dynamicContext
 * @param   {!Sequence<!../dataTypes/NodeValue>}  firstNodes
 * @param   {!Sequence<!../dataTypes/NodeValue>}  secondNodes
 * @return  {!Sequence<!../dataTypes/NodeValue>}
 */
function opExcept (dynamicContext, firstNodes, secondNodes) {
	/**
	 * @type {!Array<!../dataTypes/NodeValue>}
	 */
	const allSecondNodes = secondNodes.getAllValues();

	const allNodes = firstNodes.getAllValues().filter(function (nodeA) {
		return allSecondNodes.every(function (nodeB) {
			return nodeA !== nodeB;
		});

	});
	return new Sequence(sortNodeValues(dynamicContext.domFacade, allNodes));
}

/**
 * @param   {../DynamicContext}  dynamicContext
 * @param   {!Sequence<!../dataTypes/NodeValue>}  firstNodes
 * @param   {!Sequence<!../dataTypes/NodeValue>}  secondNodes
 * @return  {!Sequence<!../dataTypes/NodeValue>}
 */
function opIntersect (dynamicContext, firstNodes, secondNodes) {
	/**
	 * @type {!Array<!../dataTypes/NodeValue>}
	 */
	const allSecondNodes = secondNodes.getAllValues();

	const allNodes = firstNodes.getAllValues().filter(function (nodeA) {
		return allSecondNodes.some(function (nodeB) {
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
