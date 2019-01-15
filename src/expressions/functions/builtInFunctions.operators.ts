import createAtomicValue from '../dataTypes/createAtomicValue';
import SequenceFactory from '../dataTypes/sequenceFactory';
import { DONE_TOKEN, notReady, ready } from '../util/iterators';

import FunctionDefinitionType from './FunctionDefinitionType';

const opTo: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	staticContext,
	fromSequence,
	toSequence
) {
	// shortcut the non-trivial case of both values being known
	// RangeExpr is inclusive: 1 to 3 will make (1,2,3)
	const from = fromSequence.tryGetFirst();
	const to = toSequence.tryGetFirst();
	let fromValue = null;
	let toValue = null;

	if (from.ready && to.ready) {
		if (from.value === null || to.value === null) {
			return SequenceFactory.empty();
		}
		fromValue = from.value.value;
		toValue = to.value.value;
		if (fromValue > toValue) {
			return SequenceFactory.empty();
		}
		// By providing a length, we do not have to hold an end condition into account
		return SequenceFactory.create(
			{
				next: () => ready(createAtomicValue(fromValue++, 'xs:integer'))
			},
			toValue - fromValue + 1
		);
	}
	return SequenceFactory.create({
		next: () => {
			if (fromValue === null) {
				const from = fromSequence.tryGetFirst();
				if (!from.ready) {
					return notReady(from.promise);
				}
				if (from.value === null) {
					return DONE_TOKEN;
				}
				fromValue = from.value.value;
			}
			if (toValue === null) {
				const to = toSequence.tryGetFirst();
				if (!to.ready) {
					return notReady(to.promise);
				}
				if (to.value === null) {
					return DONE_TOKEN;
				}
				toValue = to.value.value;
			}
			if (fromValue > toValue) {
				return DONE_TOKEN;
			}
			return ready(createAtomicValue(fromValue++, 'xs:integer'));
		}
	});
};

export default {
	declarations: [
		{
			namespaceURI: 'http://fontoxpath/operators',
			localName: 'to',
			argumentTypes: ['xs:integer?', 'xs:integer?'],
			returnType: 'xs:integer*',
			callFunction: opTo
		}
	],
	functions: {
		to: opTo
	}
};
