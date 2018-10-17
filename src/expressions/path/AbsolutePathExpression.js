import Expression from '../Expression';
import Sequence from '../dataTypes/Sequence';
import Specificity from '../Specificity';
import createNodeValue from '../dataTypes/createNodeValue';

/**
 * @extends {Expression}
 */
class AbsolutePathExpression extends Expression {
	/**
	 * @param  {Expression}  relativePathExpression
	 */
	constructor (relativePathExpression) {
		super(
			relativePathExpression ? relativePathExpression.specificity : new Specificity({}),
			relativePathExpression ? [relativePathExpression] : [],
			{
				resultOrder: Expression.RESULT_ORDERINGS.SORTED,
				subtree: false,
				peer: false,
				canBeStaticallyEvaluated: false
			}
		);

		this._relativePathExpression = relativePathExpression;
	}

	evaluate (dynamicContext, executionParameters) {
		if (dynamicContext.contextItem === null) {
			throw new Error('XPDY0002: context is absent, it needs to be present to use paths.');
		}
		var node = dynamicContext.contextItem.value;
		var documentNode = node.nodeType === node.DOCUMENT_NODE ? node : node.ownerDocument;
		// Assume this is the start, so only one node
		var contextSequence = Sequence.singleton(createNodeValue(documentNode));
		return this._relativePathExpression ?
			this._relativePathExpression.evaluateMaybeStatically(
			dynamicContext.scopeWithFocus(0, contextSequence.first(), contextSequence), executionParameters) :
			contextSequence;
	}

}
export default AbsolutePathExpression;
