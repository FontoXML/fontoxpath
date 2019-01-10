import Expression, { RESULT_ORDERINGS } from '../Expression';

import UpdatingExpression from './UpdatingExpression';
import Specificity from '../Specificity';
import { mergeUpdates } from './pulRoutines';
import { ready } from '../util/iterators';
import createNodeValue from '../dataTypes/createNodeValue';
import isSubTypeOf from '../dataTypes/isSubtypeOf';
import SequenceFactory from '../dataTypes/SequenceFactory';
import QName from '../dataTypes/valueTypes/QName';
import { errXUTY0013, errXUDY0014, errXUDY0037 } from './XQueryUpdateFacilityErrors';
import { applyUpdates } from './pulRoutines';

function deepCloneNode (node) {
	// Each copied node receives a new node identity. The parent, children, and attributes properties of the copied nodes are set so as to preserve their inter-node relationships. The parent property of the copy of $node is set to empty. Other properties of the copied nodes are determined as follows:

	// For a copied document node, the document-uri property is set to empty.
	// For a copied element node, the type-name property is set to xs:untyped, and the nilled, is-id, and is-idrefs properties are set to false.
	// For a copied attribute node, the type-name property is set to xs:untypedAtomic and the is-idrefs property is set to false. The is-id property is set to true if the qualified name of the attribute node is xml:id; otherwise it is set to false.
	// The string-value of each copied element and attribute node remains unchanged, and its typed value becomes equal to its string value as an instance of xs:untypedAtomic.
	// 	Note:Implementations that store only the typed value of a node are required at this point to convert the typed value to a string form.
	// If copy-namespaces mode in the static context specifies preserve, all in-scope-namespaces of the original element are retained in the new copy. If copy-namespaces mode specifies no-preserve, the new copy retains only those in-scope namespaces of the original element that are used in the names of the element and its attributes.
	// All other properties of the copied nodes are preserved.
	// TODO: Consider doing this with an INodesFactory.
	return createNodeValue(node.value.cloneNode(true));
}

function isCreatedNode (node, createdNodes, domFacade) {
	if (createdNodes.includes(node)) {
		return true;
	}
	const parent = domFacade.getParentNode(node);
	return parent ? isCreatedNode(parent, createdNodes, domFacade) : false;
}

type VariableBinding = {varRef: QName, sourceExpr: Expression, registeredVariable?: string}

class TransformExpression extends UpdatingExpression {
	_variableBindings: any[];
	_modifyExpr: Expression;
	_returnExpr: Expression;

	constructor (variableBindings: Array<VariableBinding>, modifyExpr: Expression, returnExpr: Expression) {
		super(
			new Specificity({}),
			variableBindings.reduce((childExpressions, variableBinding) => {
				childExpressions.push(variableBinding.sourceExpr);
				return childExpressions;
			}, [modifyExpr, returnExpr]),
			{
				canBeStaticallyEvaluated: false,
				resultOrder: RESULT_ORDERINGS.UNSORTED
			});
		this._variableBindings = variableBindings;
		this._modifyExpr = modifyExpr;
		this._returnExpr = returnExpr;
	}

	performStaticEvaluation (staticContext) {
		staticContext.introduceScope();
		this._variableBindings.forEach(variableBinding =>
			variableBinding.registeredVariable = staticContext.registerVariable(variableBinding.varRef.namespaceURI, variableBinding.varRef.localName));
		super.performStaticEvaluation(staticContext);
		staticContext.removeScope();
	}

	evaluateWithUpdateList (dynamicContext, executionParameters) {
		const { domFacade, nodesFactory, documentWriter } = executionParameters;

		const sourceValueIterators = [];
		let modifyValueIterator;
		let returnValueIterator;

		let modifyPul;
		const createdNodes = [];
		const toMergePuls = [];

		return {
			next: () => {
				if (createdNodes.length !== this._variableBindings.length) {
					// The copy clause contains one or more variable bindings, each of which consists of a variable name and an expression called the source expression.
					for (let i = createdNodes.length; i < this._variableBindings.length; i++) {
						const variableBinding = this._variableBindings[i];
						let sourceValueIterator = sourceValueIterators[i];

						// Each variable binding is processed as follows:
						if (!sourceValueIterator) {
							sourceValueIterators[i] = sourceValueIterator = variableBinding.sourceValueIterator = super.ensureUpdateListWrapper(variableBinding.sourceExpr)(dynamicContext, executionParameters);
						}
						var sv = sourceValueIterator.next();
						if (!sv.ready) {
							return sv;
						}

						// The result of evaluating the source expression must be a single node [err:XUTY0013]. Let $node be this single node.
						if (sv.value.xdmValue.length !== 1 || !isSubTypeOf(sv.value.xdmValue[0].type, 'node()')) {
							throw errXUTY0013();
						}
						const node = sv.value.xdmValue[0];

						// A new copy is made of $node and all nodes that have $node as an ancestor, collectively referred to as copied nodes.
						const copiedNodes = deepCloneNode(node);
						createdNodes.push(copiedNodes.value);
						toMergePuls.push(sv.value.pendingUpdateList);

						// The variable name is bound to the top-level copied node generated in the previous step. The scope of this variable binding includes all subexpressions of the containing copy modify expression that appear after the variable binding clause, including the source expressions of later variable bindings, but it does not include the source expression to which the current variable name is bound.
						dynamicContext = dynamicContext.scopeWithVariableBindings({
							[variableBinding.registeredVariable]: () => SequenceFactory.singleton(copiedNodes)
						});
					}
				}

				if (!modifyPul) {
					// The expression in the modify clause is evaluated,
					if (!modifyValueIterator) {
						modifyValueIterator = super.ensureUpdateListWrapper(this._modifyExpr)(dynamicContext, executionParameters);
					}
					const mv = modifyValueIterator.next();
					if (!mv.ready) {
						return mv;
					}
					// resulting in a pending update list (denoted $pul) and an XDM instance. The XDM instance is discarded, and does not form part of the result of the copy modify expression.
					modifyPul = mv.value.pendingUpdateList;
				}

				modifyPul.forEach(pu => {
					// If the target node of any update primitive in $pul is a node that was not newly created in Step 1, a dynamic error is raised [err:XUDY0014].
					if (pu.target && !isCreatedNode(pu.target, createdNodes, domFacade)) {
						throw errXUDY0014(pu.target);
					}

					// If $pul contains a upd:put update primitive, a dynamic error is raised [err:XUDY0037].
					if (pu.type === 'put') {
						throw errXUDY0037();
					}
				});

				// Let $revalidation-mode be the value of the revalidation mode in the static context of the library or main module containing the copy modify expression, and $inherit-namespaces be the value of inherit-namespaces in the static context of the copy modify expression. The following update operation is invoked: upd:applyUpdates($pul, $revalidation-mode, $inherit-namespaces).
				applyUpdates(modifyPul, null, null, domFacade, nodesFactory, documentWriter);

				// The return clause is evaluated, resulting in a pending update list and an XDM instance.
				if (!returnValueIterator) {
					returnValueIterator = super.ensureUpdateListWrapper(this._returnExpr)(dynamicContext, executionParameters);
				}
				const rv = returnValueIterator.next();
				if (!rv.ready) {
					return rv;
				}

				//  The result of the copy modify expression is the XDM instance returned, as well as a pending update list constructed by merging the pending update lists returned by any of the copy modify expression's copy or return clause operand expressions using upd:mergeUpdates. During evaluation of the return clause, changes applied to copied nodes by the preceding step are visible.
				return ready({
					xdmValue: rv.value.xdmValue,
					pendingUpdateList: mergeUpdates(
						rv.value.pendingUpdateList,
						...toMergePuls)
				});
			}
		};
	}
}

export default TransformExpression;
