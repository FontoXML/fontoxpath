import createAtomicValue from '../dataTypes/createAtomicValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { DONE_TOKEN, notReady, ready } from '../util/iterators';

import FunctionDefinitionType from './FunctionDefinitionType';

const opTo: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	fromSequence,
	toSequence
) => {
	// shortcut the non-trivial case of both values being known
	// RangeExpr is inclusive: 1 to 3 will make (1,2,3)
	const from = fromSequence.tryGetFirst();
	const to = toSequence.tryGetFirst();
	let fromValue = null;
	let toValue = null;

	if (from.ready && to.ready) {
		if (from.value === null || to.value === null) {
			return sequenceFactory.empty();
		}
		fromValue = from.value.value;
		toValue = to.value.value;
		if (fromValue > toValue) {
			return sequenceFactory.empty();
		}
		// By providing a length, we do not have to hold an end condition into account
		return sequenceFactory.create(
			{
				next: () => ready(createAtomicValue(fromValue++, 'xs:integer')),
			},
			toValue - fromValue + 1
		);
	}
	return sequenceFactory.create({
		next: () => {
			if (fromValue === null) {
				const fromAttempt = fromSequence.tryGetFirst();
				if (!fromAttempt.ready) {
					return notReady(fromAttempt.promise);
				}
				if (fromAttempt.value === null) {
					return DONE_TOKEN;
				}
				fromValue = fromAttempt.value.value;
			}
			if (toValue === null) {
				const toAttempt = toSequence.tryGetFirst();
				if (!toAttempt.ready) {
					return notReady(toAttempt.promise);
				}
				if (toAttempt.value === null) {
					return DONE_TOKEN;
				}
				toValue = toAttempt.value.value;
			}
			if (fromValue > toValue) {
				return DONE_TOKEN;
			}
			return ready(createAtomicValue(fromValue++, 'xs:integer'));
		},
	});
};

export default {
	declarations: [
		{
			namespaceURI: 'http://fontoxpath/operators',
			localName: 'to',
			argumentTypes: ['xs:integer?', 'xs:integer?'],
			returnType: 'xs:integer*',
			callFunction: opTo,
		},
	],
	functions: {
		to: opTo,
	},
};
