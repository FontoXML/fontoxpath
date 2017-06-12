import Sequence from '../dataTypes/Sequence';
import Selector from '../Selector';
import Specificity from '../Specificity';
import createAtomicValue from '../dataTypes/createAtomicValue';
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
		var node = dynamicContext.contextItem;

		if (!isSubtypeOf(node.type, 'element()') && !isSubtypeOf(node.type, 'attribute()')) {
			return Sequence.singleton(createAtomicValue(false, 'xs:boolean'));
		}
		if (this._nodeName === '*') {
			return Sequence.singleton(createAtomicValue(true, 'xs:boolean'));
		}
		var returnValue = this._nodeName === node.value.nodeName;
			return Sequence.singleton(returnValue ? createAtomicValue(true, 'xs:boolean') : createAtomicValue(false, 'xs:boolean'));
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
