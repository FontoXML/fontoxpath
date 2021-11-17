import { ConcreteNode, NODE_TYPES } from '../domFacade/ConcreteNode';
import ExternalDomFacade from '../domFacade/ExternalDomFacade';
import { EvaluableExpression } from '../evaluateXPath';

export default function evaluableExpressionToString(
	evaluableExpression: EvaluableExpression
): string {
	if (typeof evaluableExpression === 'string') {
		return evaluableExpression;
	} else {
		const domFacade = new ExternalDomFacade();

		const childNodes = domFacade.getChildNodes(evaluableExpression);
		const commentNode: any = childNodes.find(
			(node: ConcreteNode) => node.nodeType === NODE_TYPES.COMMENT_NODE
		);
		return commentNode ? commentNode.data : 'some expression';
	}
}
