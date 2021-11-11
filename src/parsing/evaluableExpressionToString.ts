import { ConcreteNode, NODE_TYPES } from '../domFacade/ConcreteNode';
import { EvaluableExpression } from '../evaluateXPath';

export default function evaluableExpressionToString(
	evaluableExpression: EvaluableExpression
): string {
	if (typeof evaluableExpression === 'string') {
		return evaluableExpression;
	} else {
		// Prevent us from defining the whole writable DOM interface by casting to any here:
		const evaluableExpressionAny = evaluableExpression as any;
		const commentNode: any = Array.from(evaluableExpressionAny.childNodes).find(
			(node: ConcreteNode) => node.nodeType === NODE_TYPES.COMMENT_NODE
		);
		return commentNode ? commentNode.data : 'some expression';
	}
}
