import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { CodeGenContext } from './CodeGenContext';
import { emitOperand } from './emitOperand';
// import { emitBaseExpr } from './emitBaseExpression';
import {
	acceptAst,
	FunctionIdentifier,
	getCompiledValueCode,
	PartialCompilationResult,
	rejectAst,
} from './JavaScriptCompiledXPath';

/**
 * Generates javascript code for a value compare expression.
 *
 * @param ast The ast of the value compare expression
 * @param compareType The type of comparison we're executing
 * @param firstExpr The generated code of the first expression
 * @param secondExpr The generated code of the second expression
 * @param identifier The identifier of the result
 * @param staticContext The code generation context
 * @returns Generated code of the value compare
 */
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

	// Make sure both child expression got annotated
	if (!leftType || !rightType) {
		return rejectAst("Operands in compare weren't annotated");
	}

	const compareOperators: Record<string, string> = {
		eqOp: '===',
		neOp: '!==',
	};

	// Make sure we support the comparison type
	if (!compareOperators[compareType]) {
		return rejectAst(compareType + ' not yet implemented');
	}

	// Get the correct operator
	const operator = compareOperators[compareType];

	// String - string compare
	if (leftType.type === ValueType.XSSTRING && rightType.type === ValueType.XSSTRING) {
		// We just execute the compare operator with the two operands.
		const code = `
		function ${identifier}(contextItem) {
			${firstExpr.variables.join('\n')}
			${secondExpr.variables.join('\n')}
			return ${getCompiledValueCode(firstExpr.code, firstExpr.isFunction)} 
					${operator}
					${getCompiledValueCode(secondExpr.code, secondExpr.isFunction)};
		}
		`;

		return acceptAst(code, true);
	}
	// Node - string compare
	else if (leftType.type === ValueType.NODE && rightType.type === ValueType.XSSTRING) {
		// If the left-hand operand is an empty node sequence, we just return an empty sequence.
		// Otherwise we execute the correct comparison operator
		const code = `
		function ${identifier}(contextItem) {
			${firstExpr.variables.join('\n')}
			${secondExpr.variables.join('\n')}
			const value = ${getCompiledValueCode(firstExpr.code, firstExpr.isFunction)}.next();
			
			if (value.done) return [];

			return value.value?.value?.node?.nodeValue
					${operator}
					${getCompiledValueCode(secondExpr.code, secondExpr.isFunction)};
		}
		`;

		return acceptAst(code, true);
	} else {
		return rejectAst('Value compare only supports strings for now');
	}
}

/**
 * Generates javascript code for a general compare expression.
 *
 * @param ast The ast of the general compare expression
 * @param compareType The type of comparison we're executing
 * @param firstExpr The generated code of the first expression
 * @param secondExpr The generated code of the second expression
 * @param identifier The identifier of the result
 * @param staticContext The code generation context
 * @returns Generated code of the general compare
 */
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
		// const leftChildren: IAST[] = astHelper.getChildren(firstAstOp, '*');
		// const rightChildren: IAST[] = astHelper.getChildren(secondAstOp, '*');
		// leftChildren.shift();
		// rightChildren.shift();
		// // TODO: make the generalCompare compatible with the valueCompare, the code that is here at the moment is a guess

		// let generalCompare: string = `
		// function ${identifier}(contextItem) {
		// `;

		// for (let x = 0; x < leftChildren.length; x++) {
		// 	for (let y = 0; y < rightChildren.length; y++) {
		// 		const left = emitBaseExpr(leftChildren[x], identifier, staticContext);
		// 		const right = emitBaseExpr(rightChildren[y], identifier, staticContext);
		// 		const valueCompare = emitValueCompare(
		// 			ast,
		// 			compareType,
		// 			left,
		// 			right,
		// 			identifier,
		// 			staticContext
		// 		);
		// 		if (!valueCompare.isAstAccepted) {
		// 			return rejectAst('generalCompare could not be created');
		// 		}
		// 		// generalCompare += `if(${valueCompare.code}(contextItem)) {
		// 		//         return true;
		// 		//     }
		// 		//     `;
		// 	}
		// }
		// generalCompare += `return false;
		//                 }`;
		// return acceptAst(generalCompare);
	}
}

/**
 * Compiles compare expressions to a JavaScript function.
 *
 *
 * @param ast Logical expression AST node.
 * @param identifier Function identifier for the emitted function
 * @param staticContext Static context parameter to retrieve context-dependent information.
 * @param compareType The exact operator that will be compiled
 * @returns Wrapped compare expression.
 */
export function emitCompareExpr(
	ast: IAST,
	identifier: FunctionIdentifier,
	staticContext: CodeGenContext,
	compareType: string
): PartialCompilationResult {
	const firstExpr = emitOperand(ast, identifier, 'firstOperand', staticContext);
	if (!firstExpr.isAstAccepted) {
		return firstExpr;
	}

	const secondExpr = emitOperand(ast, identifier, 'secondOperand', staticContext);
	if (!secondExpr.isAstAccepted) {
		return secondExpr;
	}

	switch (compareType) {
		// valueCompare
		case 'eqOp':
		case 'neOp':
		case 'ltOp':
		case 'leOp':
		case 'gtOp':
		case 'geOp':
		case 'isOp':
			return emitValueCompare(
				ast,
				compareType,
				firstExpr,
				secondExpr,
				identifier,
				staticContext
			);
		// generalCompare
		case 'equalOp':
		case 'notEqualOp':
		case 'lessThanOrEqualOp':
		case 'lessThanOp':
		case 'greaterThanOrEqualOp':
		case 'greaterThanOp':
			return emitGeneralCompare(
				ast,
				compareType,
				firstExpr,
				secondExpr,
				identifier,
				staticContext
			);
		// nodeCompare
		case 'nodeBeforeOp':
		case 'nodeAfterOp':
		default:
			return rejectAst('Unsupported compare type');
	}
}

/**
 *  A map to translate from general compare to value compare
 */
const OPERATOR_TRANSLATION: { [s: string]: string } = {
	['equalOp']: 'eqOp',
	['notEqualOp']: 'neOp',
	['lessThanOrEqualOp']: 'leOp',
	['lessThanOp']: 'ltOp',
	['greaterThanOrEqualOp']: 'geOp',
	['greaterThanOp']: 'gtOp',
};
