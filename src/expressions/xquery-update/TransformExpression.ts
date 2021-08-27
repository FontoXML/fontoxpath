import deepCloneNode from '../../domClone/deepCloneNode';
import { ChildNodePointer, NodePointer } from '../../domClone/Pointer';
import DomFacade from '../../domFacade/DomFacade';
import createPointerValue from '../dataTypes/createPointerValue';
import ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { ValueType } from '../dataTypes/Value';
import QName from '../dataTypes/valueTypes/QName';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import arePointersEqual from '../operators/compares/arePointersEqual';
import { separateXDMValueFromUpdatingExpressionResult } from '../PossiblyUpdatingExpression';
import Specificity from '../Specificity';
import StaticContext from '../StaticContext';
import UpdatingExpressionResult from '../UpdatingExpressionResult';
import { IIterator, IterationHint, ready } from '../util/iterators';
import createPendingUpdateFromTransferable from './createPendingUpdateFromTransferable';
import { IPendingUpdate } from './IPendingUpdate';
import { applyUpdates, mergeUpdates } from './pulRoutines';
import UpdatingExpression from './UpdatingExpression';
import { errXUDY0014, errXUDY0037, errXUTY0013 } from './XQueryUpdateFacilityErrors';

function isCreatedNode(
	node: NodePointer,
	createdNodes: NodePointer[],
	domFacade: DomFacade
): boolean {
	if (createdNodes.find((cNode) => arePointersEqual(cNode, node))) {
		return true;
	}
	const parent = domFacade.getParentNodePointer(node as ChildNodePointer);
	return parent ? isCreatedNode(parent, createdNodes, domFacade) : false;
}

type VariableBinding = { registeredVariable?: string; sourceExpr: Expression; varRef: QName };

class TransformExpression extends UpdatingExpression {
	public _modifyExpr: Expression;
	public _returnExpr: Expression;
	public _variableBindings: VariableBinding[];

	constructor(
		variableBindings: VariableBinding[],
		modifyExpr: Expression,
		returnExpr: Expression
	) {
		super(
			new Specificity({}),
			variableBindings.reduce(
				(childExpressions, variableBinding) => {
					childExpressions.push(variableBinding.sourceExpr);
					return childExpressions;
				},
				[modifyExpr, returnExpr]
			),
			{
				canBeStaticallyEvaluated: false,
				resultOrder: RESULT_ORDERINGS.UNSORTED,
			}
		);
		this._variableBindings = variableBindings;
		this._modifyExpr = modifyExpr;
		this._returnExpr = returnExpr;

		// TransformExpressions do not know whether they are updating before the static phase is done for any variable references
		this.isUpdating = null;
	}

	public evaluate(
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters
	): ISequence {
		// If we were updating, the calling code would have called the evaluateWithUpdateList
		// method. We can assume we're not actually updating
		const pendingUpdateIterator = this.evaluateWithUpdateList(
			dynamicContext,
			executionParameters
		);
		return separateXDMValueFromUpdatingExpressionResult(pendingUpdateIterator, (_pul) => {
			/* Ignore the PUL part */
		});
	}

	public evaluateWithUpdateList(
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters
	): IIterator<UpdatingExpressionResult> {
		const { domFacade, nodesFactory, documentWriter } = executionParameters;

		const sourceValueIterators: IIterator<UpdatingExpressionResult>[] = [];
		let modifyValueIterator: IIterator<UpdatingExpressionResult>;
		let returnValueIterator: IIterator<UpdatingExpressionResult>;

		let modifyPul: IPendingUpdate[];
		const createdNodes: NodePointer[] = [];
		const toMergePuls: IPendingUpdate[][] = [];

		return {
			next: () => {
				if (createdNodes.length !== this._variableBindings.length) {
					// The copy clause contains one or more variable bindings, each of which consists of a variable name and an expression called the source expression.
					for (let i = createdNodes.length; i < this._variableBindings.length; i++) {
						const variableBinding = this._variableBindings[i];
						let sourceValueIterator: IIterator<UpdatingExpressionResult> =
							sourceValueIterators[i];

						// Each variable binding is processed as follows:
						if (!sourceValueIterator) {
							sourceValueIterators[i] = sourceValueIterator =
								this.ensureUpdateListWrapper(variableBinding.sourceExpr)(
									dynamicContext,
									executionParameters
								);
						}
						const sv = sourceValueIterator.next(IterationHint.NONE);

						// The result of evaluating the source expression must be a single node [err:XUTY0013]. Let $node be this single node.
						if (
							sv.value.xdmValue.length !== 1 ||
							!isSubtypeOf(sv.value.xdmValue[0].type, ValueType.NODE)
						) {
							throw errXUTY0013();
						}
						const node = sv.value.xdmValue[0];

						// A new copy is made of $node and all nodes that have $node as an ancestor, collectively referred to as copied nodes.
						const copiedNodes = createPointerValue(
							deepCloneNode(node.value, executionParameters),
							domFacade
						);
						createdNodes.push(copiedNodes.value);
						toMergePuls.push(sv.value.pendingUpdateList);

						// The variable name is bound to the top-level copied node generated in the previous step. The scope of this variable binding includes all subexpressions of the containing copy modify expression that appear after the variable binding clause, including the source expressions of later variable bindings, but it does not include the source expression to which the current variable name is bound.
						dynamicContext = dynamicContext.scopeWithVariableBindings({
							[variableBinding.registeredVariable]: () =>
								sequenceFactory.singleton(copiedNodes),
						});
					}
				}

				if (!modifyPul) {
					// The expression in the modify clause is evaluated,
					if (!modifyValueIterator) {
						modifyValueIterator = this.ensureUpdateListWrapper(this._modifyExpr)(
							dynamicContext,
							executionParameters
						);
					}
					const mv = modifyValueIterator.next(IterationHint.NONE);
					// resulting in a pending update list (denoted $pul) and an XDM instance. The XDM instance is discarded, and does not form part of the result of the copy modify expression.
					modifyPul = mv.value.pendingUpdateList;
				}

				modifyPul.forEach((pu) => {
					// If the target node of any update primitive in $pul is a node that was not newly created in Step 1, a dynamic error is raised [err:XUDY0014].
					if (pu.target && !isCreatedNode(pu.target, createdNodes, domFacade)) {
						throw errXUDY0014(pu.target.node);
					}

					// If $pul contains a upd:put update primitive, a dynamic error is raised [err:XUDY0037].
					if (pu.type === 'put') {
						throw errXUDY0037();
					}
				});

				const pul = modifyPul.map((update) => {
					const transferable = update.toTransferable(executionParameters);
					return createPendingUpdateFromTransferable(transferable);
				});

				// Let $revalidation-mode be the value of the revalidation mode in the static context of the library or main module containing the copy modify expression, and $inherit-namespaces be the value of inherit-namespaces in the static context of the copy modify expression. The following update operation is invoked: upd:applyUpdates($pul, $revalidation-mode, $inherit-namespaces).
				applyUpdates(pul, null, null, domFacade, nodesFactory, documentWriter);

				// The return clause is evaluated, resulting in a pending update list and an XDM instance.
				if (!returnValueIterator) {
					returnValueIterator = this.ensureUpdateListWrapper(this._returnExpr)(
						dynamicContext,
						executionParameters
					);
				}
				const rv = returnValueIterator.next(IterationHint.NONE);

				//  The result of the copy modify expression is the XDM instance returned, as well as a pending update list constructed by merging the pending update lists returned by any of the copy modify expression's copy or return clause operand expressions using upd:mergeUpdates. During evaluation of the return clause, changes applied to copied nodes by the preceding step are visible.
				return ready({
					xdmValue: rv.value.xdmValue,
					pendingUpdateList: mergeUpdates(rv.value.pendingUpdateList, ...toMergePuls),
				});
			},
		};
	}

	public performStaticEvaluation(staticContext: StaticContext) {
		staticContext.introduceScope();
		this._variableBindings.forEach(
			(variableBinding) =>
				(variableBinding.registeredVariable = staticContext.registerVariable(
					variableBinding.varRef.namespaceURI,
					variableBinding.varRef.localName
				))
		);
		super.performStaticEvaluation(staticContext);
		staticContext.removeScope();

		// If all of the copy modify expression's copy and return clauses have operand expressions
		// that are simple expressions, then the copy modify expression is a simple expression.

		// If any of the copy modify expression's copy or return clauses have operand expressions
		// that are updating expressions, then the copy modify expression is a updating expression.
		this.isUpdating =
			this._variableBindings.some((varBinding) => varBinding.sourceExpr.isUpdating) ||
			this._returnExpr.isUpdating;
	}
}

export default TransformExpression;
