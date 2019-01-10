import Expression, { RESULT_ORDERINGS } from '../Expression';

import Specificity from '../Specificity';
import SequenceFactory from '../dataTypes/SequenceFactory';
import MapValue from '../dataTypes/MapValue';
import zipSingleton from '../util/zipSingleton';

import createDoublyIterableSequence from '../util/createDoublyIterableSequence';

class MapConstructor extends Expression {
	_entries: { key: Expression; value: Expression }[];
	/**
	 * @param  entries  key-value tuples of expressions which will evaluate to key / value pairs
	 */
	constructor(entries: { key: Expression; value: Expression }[]) {
		super(
			new Specificity({
				[Specificity.EXTERNAL_KIND]: 1
			}),
			entries.reduce(
				(allExpressions, { key, value }) => allExpressions.concat(key, value),
				[]
			),
			{
				canBeStaticallyEvaluated: false
			}
		);
		this._entries = entries;
	}

	evaluate(dynamicContext, executionParameters) {
		const keySequences = this._entries.map(kvp =>
			kvp.key
				.evaluateMaybeStatically(dynamicContext, executionParameters)
				.atomize(executionParameters)
				.switchCases({
					default: () => {
						throw new Error(
							'XPTY0004: A key of a map should be a single atomizable value.'
						);
					},
					singleton: seq => seq
				})
		);

		return zipSingleton(keySequences, keys =>
			SequenceFactory.singleton(
				new MapValue(
					keys.map((key, keyIndex) => ({
						key,
						value: createDoublyIterableSequence(
							this._entries[keyIndex].value.evaluateMaybeStatically(
								dynamicContext,
								executionParameters
							)
						)
					}))
				)
			)
		);
	}
}

export default MapConstructor;
