import atomize from '../dataTypes/atomize';
import MapValue from '../dataTypes/MapValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { SequenceType } from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression from '../Expression';
import Specificity from '../Specificity';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';
import zipSingleton from '../util/zipSingleton';

class MapConstructor extends Expression {
	private _entries: { key: Expression; value: Expression }[];
	/**
	 * @param  entries  key-value tuples of expressions which will evaluate to key / value pairs
	 */
	constructor(entries: { key: Expression; value: Expression }[], type: SequenceType) {
		super(
			new Specificity({
				[Specificity.EXTERNAL_KIND]: 1,
			}),
			entries.reduce(
				(allExpressions, { key, value }) => allExpressions.concat(key, value),
				[],
			),
			{
				canBeStaticallyEvaluated: false,
			},
			false,
			type,
		);
		this._entries = entries;
	}

	public evaluate(dynamicContext: DynamicContext, executionParameters: ExecutionParameters) {
		const keySequences = this._entries.map((kvp) =>
			atomize(
				kvp.key.evaluateMaybeStatically(dynamicContext, executionParameters),
				executionParameters,
			).switchCases({
				default: () => {
					throw new Error(
						'XPTY0004: A key of a map should be a single atomizable value.',
					);
				},
				singleton: (seq) => seq,
			}),
		);

		return zipSingleton(keySequences, (keys) =>
			sequenceFactory.singleton(
				new MapValue(
					keys.map((key, keyIndex) => ({
						key,
						value: createDoublyIterableSequence(
							this._entries[keyIndex].value.evaluateMaybeStatically(
								dynamicContext,
								executionParameters,
							),
						),
					})),
				),
			),
		);
	}
}

export default MapConstructor;
