import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import createNodeValue from '../dataTypes/createNodeValue';

/**
 * @extends {Selector}
 */
class ParentAxis extends Selector {
	/**
	 * @param  {Selector}  parentSelector
	 */
	constructor (parentSelector) {
		super(parentSelector.specificity, {
			resultOrder: Selector.RESULT_ORDERINGS.REVERSE_SORTED,
			peer: true,
			subtree: true,
			canBeStaticallyEvaluated: false
		});

		this._parentSelector = parentSelector;
	}

	/**
	 * @param   {../DynamicContext}  dynamicContext
	 * @return  {Sequence}
	 */
	evaluate (dynamicContext) {
		const domFacade = dynamicContext.domFacade;

		const parentNode = domFacade.getParentNode(dynamicContext.contextItem.value);
		if (!parentNode) {
			return Sequence.empty();
		}
		const parentSequence = Sequence.singleton(createNodeValue(parentNode));
		const scopedContext = dynamicContext.scopeWithFocus(0, parentSequence.first(), parentSequence);
		const nodeIsMatch = this._parentSelector.evaluateMaybeStatically(scopedContext).getEffectiveBooleanValue();
		if (!nodeIsMatch) {
			return Sequence.empty();
		}
		return parentSequence;
	}
}

export default ParentAxis;
