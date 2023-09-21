import { NODE_TYPES } from '../../domFacade/ConcreteNode';
import createPointerValue from '../dataTypes/createPointerValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import Specificity from '../Specificity';
import { errXPDY0002 } from '../XPathErrors';

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
				canBeStaticallyEvaluated: false,
			},
		);

		this._relativePathExpression = relativePathExpression;
	}

	public evaluate(dynamicContext: DynamicContext, executionParameters: ExecutionParameters) {
		if (dynamicContext.contextItem === null) {
			throw errXPDY0002('context is absent, it needs to be present to use paths.');
		}
		const node = dynamicContext.contextItem.value;
		const domFacade = executionParameters.domFacade;

		let documentNode = node;
		while (domFacade.getNodeType(documentNode) !== NODE_TYPES.DOCUMENT_NODE) {
			documentNode = domFacade.getParentNodePointer(documentNode);
			if (documentNode === null) {
				throw new Error(
					'XPDY0050: the root node of the context node is not a document node.',
				);
			}
		}

		// Assume this is the start, so only one node
		const contextSequence = sequenceFactory.singleton(
			createPointerValue(documentNode, domFacade),
		);
		return this._relativePathExpression
			? this._relativePathExpression.evaluateMaybeStatically(
					dynamicContext.scopeWithFocus(0, contextSequence.first(), contextSequence),
					executionParameters,
			  )
			: contextSequence;
	}
}
export default AbsolutePathExpression;
