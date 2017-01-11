import Selector from '../Selector';
import Specificity from '../Specificity';
import ArrayValue from '../dataTypes/ArrayValue';
import Sequence from '../dataTypes/Sequence';

/**
 * @extends {Selector}
 */
class ArrayConstructor extends Selector {
	/**
	 * @param   {string}           curlyness  Whether this constructor should use curly behaviour
	 *                                         Curly behaviour unfolds the single entry sequence, square constructor does not unfold
	 * @param   {!Array<!Selector>}  members    The selectors for the values
	 */
	constructor (curlyness, members) {
		super(
			new Specificity({
				[Specificity.EXTERNAL_KIND]: 1
			}), Selector.RESULT_ORDERINGS.UNSORTED);
		this._curlyness = curlyness;
		this._members = members;
	}

	equals (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		if (!(otherSelector instanceof ArrayConstructor)) {
			return false;
		}
		const otherArrayConstructor = /** @type ArrayConstructor */ (otherSelector);
		return this._curlyness === otherArrayConstructor._curlyness &&
			this._members.length === otherArrayConstructor._members.length &&
			this._members.every(function (entry, i) {
				return otherArrayConstructor._members[i].equals(entry);
			});
	}

	evaluate (dynamicContext) {
		if (this._curlyness === 'curly') {
			return Sequence.singleton(new ArrayValue(this._members[0].evaluate(dynamicContext).value.map(Sequence.singleton)));
		}

		return Sequence.singleton(new ArrayValue(this._members.map(
			function (entry) {
				return entry.evaluate(dynamicContext);
			})));
	}
}
export default ArrayConstructor;
