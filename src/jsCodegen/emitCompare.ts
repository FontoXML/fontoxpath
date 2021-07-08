import { SequenceMultiplicity, SequenceType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { CodeGenContext } from './CodeGenContext';
import { emitBaseExpr } from './emitBaseExpression';
import { acceptAst, PartialCompilationResult, rejectAst } from './JavaScriptCompiledXPath';

export function emitValueCompare(
	ast: IAST,
	firstExpr: PartialCompilationResult,
	secondExpr: PartialCompilationResult,
	identifier: string,
	staticContext: CodeGenContext
): PartialCompilationResult {
	return rejectAst('');
}

export function emitGeneralCompare(
	ast: IAST,
	firstExpr: PartialCompilationResult,
	secondExpr: PartialCompilationResult,
	identifier: string,
	staticContext: CodeGenContext
): PartialCompilationResult {
	const firstAstOp = astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST;
	const firstType: SequenceType = astHelper.getAttribute(ast, 'type');
	const secondAstOp = astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST;
	const secondType: SequenceType = astHelper.getAttribute(ast, 'type');
	if (!firstType || !secondType) {
		return rejectAst('types of compare are not known');
	}
	if (
		firstType.mult === SequenceMultiplicity.EXACTLY_ONE &&
		secondType.mult === SequenceMultiplicity.EXACTLY_ONE
	) {
		return emitValueCompare(ast, firstExpr, secondExpr, identifier, staticContext);
	} else {
		// take all the children except for the type.
		const leftChildren: IAST[] = astHelper.getChildren(firstAstOp, '*');
		const rightChildren: IAST[] = astHelper.getChildren(secondAstOp, '*');
		leftChildren.shift();
		rightChildren.shift();
		// TODO: make the generalCompare compatible with the valueCompare, the code that is here at the moment is a guess

		let generalCompare: string = `
        function ${identifier}(contextItem) {
        `;

		for (let x = 0; x < leftChildren.length; x++) {
			for (let y = 0; y < rightChildren.length; y++) {
				const left = emitBaseExpr(leftChildren[x], identifier, staticContext);
				const right = emitBaseExpr(rightChildren[y], identifier, staticContext);
				const valueCompare = emitValueCompare(ast, left, right, identifier, staticContext);
				if (!valueCompare.isAstAccepted) {
					return rejectAst('generalCompare could not be created');
				}
				generalCompare += `if(${valueCompare.code}()) {
                        return true;
                    }
                    `;
			}
		}
		generalCompare += `return false
                        }`;
		return acceptAst(generalCompare);
	}
}
