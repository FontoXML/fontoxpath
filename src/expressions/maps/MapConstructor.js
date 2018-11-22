import Expression from '../Expression';
import Specificity from '../Specificity';
import Sequence from '../dataTypes/Sequence';
import MapValue from '../dataTypes/MapValue';
import zipSingleton from '../util/zipSingleton';

import createDoublyIterableSequence from '../util/createDoublyIterableSequence';

/**
 * @extends {Expression}
 */
class MapConstructor extends Expression {
	/**
	 * @param  {Array<{key: !Expression, value:! Expression}>}  entries  key-value tuples of expressions which will evaluate to key / value pairs
	 */
	constructor (entries) {
		super(
			new Specificity({
				[Specificity.EXTERNAL_KIND]: 1
			}),
			entries.reduce(
				(allExpressions, { key, value }) => allExpressions.concat(key, value), []),
			{
				canBeStaticallyEvaluated: false
			});
		this._entries = entries;
	}

	evaluate (dynamicContext, executionParameters) {
		const keySequences = this._entries
				.map(kvp => kvp.key.evaluateMaybeStatically(dynamicContext, executionParameters).atomize(executionParameters).switchCases({
					default: () => {
						throw new Error('XPTY0004: A key of a map should be a single atomizable value.');
					},
					singleton: seq => seq
				}));

		return zipSingleton(
			keySequences,
			keys => Sequence.singleton(new MapValue(keys.map((key, keyIndex) => ({
				key,
				value: createDoublyIterableSequence(
					this._entries[keyIndex].value.evaluateMaybeStatically(dynamicContext, executionParameters)
				)
			})))));
	}
}

export default MapConstructor;
