import Sequence from '../dataTypes/Sequence';
import { sortNodeValues } from '../dataTypes/documentOrderUtils';
import createAtomicValue from '../dataTypes/createAtomicValue';


function opTo (_dynamicContext, fromSequence, toSequence) {
	// shortcut the non-trivial case of both values being known
	// RangeExpr is inclusive: 1 to 3 will make (1,2,3)
	const from = fromSequence.tryGetFirst();
	const to = toSequence.tryGetFirst();
	let fromValue = null;
	let toValue = null;

	if (from.ready && to.ready) {
		if (from.value === null || to.value === null) {
			return Sequence.empty();
		}
		fromValue = from.value.value;
		toValue = to.value.value;
		// By providing a length, we do not have to hold an end condition into account
		return new Sequence({
			next: () => ({ done: false, ready: true, value: createAtomicValue(fromValue++, 'xs:integer') })
		}, toValue - fromValue + 1);
	}
	return new Sequence({
		next: () => {
			if (fromValue === null) {
				const from = fromSequence.tryGetFirst();
				if (!from.ready) {
					return { done: false, ready: false, promise: from.promise };
				}
				if (from.value === null) {
					return { done: true, ready: true };
				}
				fromValue = from.value.value;
			}
			if (toValue === null) {
				const to = toSequence.tryGetFirst();
				if (!to.ready) {
					return { done: false, ready: false, promise: to.promise };
				}
				if (to.value === null) {
					return { done: true, ready: true };
				}
				toValue = to.value.value;
			}
			if (fromValue > toValue) {
				return { done: true, ready: true, value: undefined };
			}
			return { done: false, ready: true, value: createAtomicValue(fromValue++, 'xs:integer') };
		}

	});
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
