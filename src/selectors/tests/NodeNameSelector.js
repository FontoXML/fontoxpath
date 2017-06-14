import Sequence from '../dataTypes/Sequence';
import Selector from '../Selector';
import Specificity from '../Specificity';
import isSubtypeOf from '../dataTypes/isSubtypeOf';

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
		super(new Specificity(specificity), { canBeStaticallyEvaluated: false });

		this._nodeName = nodeName;

	}

	evaluate (dynamicContext) {
		const node = dynamicContext.contextItem;

		if (!isSubtypeOf(node.type, 'element()') && !isSubtypeOf(node.type, 'attribute()')) {
			return Sequence.singletonFalseSequence();
		}
		if (this._nodeName === '*') {
			return Sequence.singletonTrueSequence();
		}
		const returnValue = this._nodeName === node.value.nodeName;
		return returnValue ? Sequence.singletonTrueSequence() : Sequence.singletonFalseSequence();
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
