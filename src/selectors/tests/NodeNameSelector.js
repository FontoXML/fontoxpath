import BooleanValue from '../dataTypes/BooleanValue';
import Sequence from '../dataTypes/Sequence';
import Selector from '../Selector';
import Specificity from '../Specificity';

/**
 * @extends {Selector}
 */
class NodeNameSelector extends Selector {
	/**
	 * @param  {string}  nodeName
	 */
	constructor (nodeName) {
		var specificity = {
				[Specificity.NODENAME_KIND]: 1
			};
		if (nodeName === '*') {
			specificity = {
				[Specificity.NODETYPE_KIND]: 1
			};
		}
		super(new Specificity(specificity));

		this._nodeName = nodeName;

	}

	evaluate (dynamicContext) {
		var node = dynamicContext.contextItem;

		if (!node.instanceOfType('element()') && !node.instanceOfType('attribute()')) {
			return Sequence.singleton(BooleanValue.FALSE);
		}
		if (this._nodeName === '*') {
			return Sequence.singleton(BooleanValue.TRUE);
		}
		var returnValue = this._nodeName === node.nodeName;
		return Sequence.singleton(returnValue ? BooleanValue.TRUE : BooleanValue.FALSE);
	}

	getBucket () {
		if (this._nodeName === '*') {
			// While * is a test matching attributes or elements, buckets are never used to match nodes.
			return 'type-1';
		}
		return 'name-' + this._nodeName;
	}
}

export default NodeNameSelector;
