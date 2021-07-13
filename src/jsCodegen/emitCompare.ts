import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { CodeGenContext } from './CodeGenContext';
import { emitBaseExpr } from './emitBaseExpression';
import { acceptAst, PartialCompilationResult, rejectAst } from './JavaScriptCompiledXPath';

export function emitValueCompare(
	ast: IAST,
	compareType: string,
	firstExpr: PartialCompilationResult,
	secondExpr: PartialCompilationResult,
	identifier: string,
	_staticContext: CodeGenContext
): PartialCompilationResult {
	const leftType = astHelper.getAttribute(
		astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST,
		'type'
	);
	const rightType = astHelper.getAttribute(
		astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST,
		'type'
	);

	if (!firstExpr.isAstAccepted || !secondExpr.isAstAccepted) {
		return rejectAst("One of the two operands in compare wasn't accepted");
	}

	if (!leftType || !rightType) {
		return rejectAst("Operands in compare weren't annotated");
	}

	if (leftType.type !== ValueType.XSSTRING || rightType.type !== ValueType.XSSTRING) {
		return rejectAst('Value compare only supports strings for now');
	}

	const compareOperators: Record<string, string> = {
		eqOp: '===',
		neOp: '!==',
	};
	if (!compareOperators[compareType]) {
		return rejectAst(compareType + ' not yet implemented');
	}
	const code = `
	function ${identifier}(contextItem) {
		${firstExpr.variables.join('\n')}
		${secondExpr.variables.join('\n')}
		return parseCharacterReferences(${firstExpr.code}(contextItem)) ${
		compareOperators[compareType]
	} parseCharacterReferences(${secondExpr.code}(contextItem));
	}
	`;

	return acceptAst(code);
}

export function emitGeneralCompare(
	ast: IAST,
	compareType: string,
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
		return emitValueCompare(
			ast,
			OPERATOR_TRANSLATION[compareType],
			firstExpr,
			secondExpr,
			identifier,
			staticContext
		);
	} else {
		return rejectAst('generalCompare with sequences is still in development');
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
				const valueCompare = emitValueCompare(
					ast,
					compareType,
					left,
					right,
					identifier,
					staticContext
				);
				if (!valueCompare.isAstAccepted) {
					return rejectAst('generalCompare could not be created');
				}
				// generalCompare += `if(${valueCompare.code}(contextItem)) {
				//         return true;
				//     }
				//     `;
			}
		}
		generalCompare += `return false;
	                    }`;
		return acceptAst(generalCompare);
	}
}

const OPERATOR_TRANSLATION: { [s: string]: string } = {
	['equalOp']: 'eqOp',
	['notEqualOp']: 'neOp',
	['lessThanOrEqualOp']: 'leOp',
	['lessThanOp']: 'ltOp',
	['greaterThanOrEqualOp']: 'geOp',
	['greaterThanOp']: 'gtOp',
};
