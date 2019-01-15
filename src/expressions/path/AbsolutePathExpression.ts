import Expression, { RESULT_ORDERINGS } from '../Expression';

import createNodeValue from '../dataTypes/createNodeValue';
import SequenceFactory from '../dataTypes/sequenceFactory';
import Specificity from '../Specificity';

class AbsolutePathExpression extends Expression {
	private _relativePathExpression: Expression;
	constructor(relativePathExpression: Expression) {
		super(
			relativePathExpression ? relativePathExpression.specificity : new Specificity({}),
			relativePathExpression ? [relativePathExpression] : [],
			{
				resultOrder: RESULT_ORDERINGS.SORTED,
				subtree: false,
				peer: false,
				canBeStaticallyEvaluated: false
			}
		);

		this._relativePathExpression = relativePathExpression;
	}

	public evaluate(dynamicContext, executionParameters) {
		if (dynamicContext.contextItem === null) {
			throw new Error('XPDY0002: context is absent, it needs to be present to use paths.');
		}
		const node = dynamicContext.contextItem.value;
		const documentNode = node.nodeType === node.DOCUMENT_NODE ? node : node.ownerDocument;
		// Assume this is the start, so only one node
		const contextSequence = SequenceFactory.singleton(createNodeValue(documentNode));
		return this._relativePathExpression
			? this._relativePathExpression.evaluateMaybeStatically(
					dynamicContext.scopeWithFocus(0, contextSequence.first(), contextSequence),
					executionParameters
			  )
			: contextSequence;
	}
}
export default AbsolutePathExpression;
