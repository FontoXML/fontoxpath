import Selector from '../Selector';
import Specificity from '../Specificity';
import Sequence from '../dataTypes/Sequence';
import MapValue from '../dataTypes/MapValue';
import zipSingleton from '../util/zipSingleton';

/**
 * @extends {Selector}
 */
class MapConstructor extends Selector {
	/**
	 * @param  {Array<{key: !Selector, value:! Selector}>}  entries  key-value tuples of selectors which will evaluate to key / value pairs
	 */
	constructor (entries) {
		super(new Specificity({
			[Specificity.EXTERNAL_KIND]: 1
		}), {
			canBeStaticallyEvaluated: false
		});
		this._entries = entries;
	}

	evaluate (dynamicContext) {
		const keySequences = this._entries
				.map(kvp => kvp.key.evaluateMaybeStatically(dynamicContext).atomize(dynamicContext).switchCases({
					default: () => {
						throw new Error('XPTY0004: A key of a map should be a single atomizable value.');
					},
					singleton: seq => seq
				}));

		return zipSingleton(
			keySequences,
			keys => Sequence.singleton(new MapValue(keys.map((key, keyIndex) => ({
				key,
				value: this._entries[keyIndex].value.evaluateMaybeStatically(dynamicContext)
			})))));
	}
}

export default MapConstructor;
