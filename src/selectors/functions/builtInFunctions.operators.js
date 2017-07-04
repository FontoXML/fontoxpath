import Sequence from '../dataTypes/Sequence';
import { sortNodeValues } from '../dataTypes/documentOrderUtils';
import createAtomicValue from '../dataTypes/createAtomicValue';


function opTo (_dynamicContext, fromValue, toValue) {
	if (toValue.isEmpty()) {
		return toValue;
	}
	if (fromValue.isEmpty()) {
		return fromValue;
	}
	var from = fromValue.first().value,
		to = toValue.first().value;
	if (from > to) {
		return Sequence.empty();
	}
	// RangeExpr is inclusive: 1 to 3 will make (1,2,3)
	return new Sequence({
		next: () => {
			if (from > to) {
				return { done: true, ready: true, value: undefined };
			}
			return { done: false, ready: true, value: createAtomicValue(from++, 'xs:integer') };
		}
	}, to - from + 1);
}

/**
 * @param   {../DynamicContext}  dynamicContext
 * @param   {!Sequence<!../dataTypes/Value>}  firstNodes
 * @param   {!Sequence<!../dataTypes/Value>}  secondNodes
 * @return  {!Sequence<!../dataTypes/Value>}
 */
function opExcept (dynamicContext, firstNodes, secondNodes) {
	/**
	 * @type {!Array<!../dataTypes/Value>}
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
 * @param   {!Sequence<!../dataTypes/Value>}  firstNodes
 * @param   {!Sequence<!../dataTypes/Value>}  secondNodes
 * @return  {!Sequence<!../dataTypes/Value>}
 */
function opIntersect (dynamicContext, firstNodes, secondNodes) {
	/**
	 * @type {!Array<!../dataTypes/Value>}
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
			argumentTypes: ['xs:integer?', 'xs:integer?'],
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
