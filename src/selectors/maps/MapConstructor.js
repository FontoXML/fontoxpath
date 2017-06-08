import Selector from '../Selector';
import Specificity from '../Specificity';
import Sequence from '../dataTypes/Sequence';
import MapValue from '../dataTypes/MapValue';
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
		var keyValuePairs = this._entries.map(function (keyValuePair) {
				var keySequence = keyValuePair.key.evaluateMaybeStatically(dynamicContext).atomize(dynamicContext);
				if (!keySequence.isSingleton()) {
					throw new Error('XPTY0004: A key of a map should be a single atomizable value.');
				}
				return {
					key: keySequence.first(),
					value: keyValuePair.value.evaluateMaybeStatically(dynamicContext)
				};
			});

		return Sequence.singleton(new MapValue(keyValuePairs));
	}
}

export default MapConstructor;
