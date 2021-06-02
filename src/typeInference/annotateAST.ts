import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import StaticContext from '../expressions/StaticContext';
import astHelper, { IAST } from '../parsing/astHelper';
import { annotateArrayConstructor } from './annotateArrayConstructor';
import { annotateArrowExpr } from './annotateArrowExpr';
import { annotateBinOp } from './annotateBinaryOperator';
import { annotateCastableOperator, annotateCastOperator } from './annotateCastOperators';
import {
	annotateGeneralCompare,
	annotateNodeCompare,
	annotateValueCompare,
} from './annotateCompareOperator';
import { annotateContextItemExpr } from './annotateContextItemExpr';
import { annotateDynamicFunctionInvocationExpr } from './annotateDynamicFunctionInvocationExpr';
import { annotateFunctionCall } from './annotateFunctionCall';
import { annotateIfThenElseExpr } from './annotateIfThenElseExpr';
import { annotateInstanceOfExpr } from './annotateInstanceOfExpr';
import { annotateLogicalOperator } from './annotateLogicalOperator';
import { annotateMapConstructor } from './annotateMapConstructor';
import { annotateNamedFunctionRef } from './annotateNamedFunctionRef';
import { annotatePathExpr } from './annotatePathExpr';
import { annotateQuantifiedExpr } from './annotateQuantifiedExpr';
import { annotateRangeSequenceOperator } from './annotateRangeSequenceOperator';
import { annotateSequenceOperator } from './annotateSequenceOperator';
import { annotateSetOperator } from './annotateSetOperators';
import { annotateSimpleMapExpr } from './annotateSimpleMapExpr';
import { annotateStringConcatenateOperator } from './annotateStringConcatenateOperator';
import { annotateTypeSwitchOperator } from './annotateTypeSwitchOperator';
import { annotateUnaryLookup } from './annotateUnaryLookup';
import { annotateUnaryMinus, annotateUnaryPlus } from './annotateUnaryOperator';

export type AnnotationContext = {
	query?: string;
	staticContext?: StaticContext;
};

/**
 * Recursively traverse the AST in the depth first, pre-order to infer type and annotate AST;
 * Annotates as much type information as possible to the AST nodes.
 * Inserts attribute `type` to the corresponding node if type is inferred.
 *
 * @param ast The AST to annotate
 * @param context The static context used for function lookups
 */
export default function annotateAst(ast: IAST, context: AnnotationContext) {
	annotate(ast, context);
}

export function countQueryBodyAnnotations(
	ast: IAST,
	total: number = 0,
	annotated: number = 0
): [number, number] {
	const nodeNames = Object.keys(annotationFunctions);

	for (let i = 1; i < ast.length; i++) {
		if (Array.isArray(ast[i]))
			[total, annotated] = countQueryBodyAnnotations(ast[i] as IAST, total, annotated);
	}

	if (nodeNames.includes(ast[0])) {
		if (astHelper.getAttribute(ast, 'type')) annotated += 1;
		total += 1;
	}

	return [total, annotated];
}
/**
 * Recursively traverse the AST in the depth first, pre-order to infer type and annotate AST;
 * Annotates as much type information as possible to the AST nodes.
 * Inserts attribute `type` to the corresponding node if type is inferred.
 *
 * @param ast The AST to annotate.
 * @param context The static context to use for function lookups.
 * @throws errors when attempts to annotate fail.
 * @returns The type of the AST node or `undefined` when the type cannot be annotated.
 */
function annotate(ast: IAST, context: AnnotationContext): SequenceType | undefined {
	// Check if we actually have an AST
	if (!ast) {
		return undefined;
	}

	const astNodeName = ast[0];

	const annotationFunction = annotationFunctions[astNodeName];
	if (annotationFunction) return annotationFunction(ast, context);

	// Current node cannot be annotated, but maybe deeper ones can.
	for (let i = 1; i < ast.length; i++) {
		annotate(ast[i] as IAST, context);
	}

	return undefined;
}

/**
 * The function lambda for annotating binary operators
 */
const binopAnnotateCb = (ast: IAST, context: AnnotationContext): SequenceType => {
	const left = annotate(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, context);
	const right = annotate(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST, context);
	return annotateBinOp(ast, left, right, ast[0], context);
};

/**
 * The function lambda for annotating logical operators
 */
const logicOpAnnotateCb = (ast: IAST, context: AnnotationContext): SequenceType => {
	annotate(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, context);
	annotate(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST, context);
	return annotateLogicalOperator(ast, context);
};

/**
 * The function lambda for annotating set operators
 */
const setOpAnnotateCb = (ast: IAST, context: AnnotationContext): SequenceType => {
	const l = annotate(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, context);
	const r = annotate(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST, context);
	return annotateSetOperator(ast, l, r, context);
};

/**
 * The function lambda for annotating general compare operators
 */
const generalComporeAnnotateCb = (ast: IAST, context: AnnotationContext): SequenceType => {
	annotate(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, context);
	annotate(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST, context);
	return annotateGeneralCompare(ast, context);
};

/**
 * The function lambda for annotating value compare operators
 */
const valueCompareAnnotateCb = (ast: IAST, context: AnnotationContext): SequenceType => {
	annotate(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, context);
	annotate(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST, context);
	return annotateValueCompare(ast, context);
};

/**
 * The function lambda for annotating node compare operators
 */
const nodeCompareAnnotateCb = (ast: IAST, context: AnnotationContext): SequenceType => {
	annotate(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, context);
	annotate(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST, context);
	return annotateNodeCompare(ast, context);
};

/**
 * A lookup table which stores the AST node name and the annotation function lambda. Converting
 * this from a switch to a map allows us to get a list of all nodes the current system can annotate
 * using `Object.keys(annotationFunctions)`.
 */
const annotationFunctions: {
	[key: string]: (ast: IAST, context: AnnotationContext) => SequenceType;
} = {
	unaryMinusOp: (ast: IAST, context: AnnotationContext): SequenceType => {
		const minVal = annotate(astHelper.getFirstChild(ast, 'operand')[1] as IAST, context);
		return annotateUnaryMinus(ast, minVal, context);
	},
	unaryPlusOp: (ast: IAST, context: AnnotationContext): SequenceType => {
		const plusVal = annotate(astHelper.getFirstChild(ast, 'operand')[1] as IAST, context);
		return annotateUnaryPlus(ast, plusVal, context);
	},

	// Binary operators
	addOp: binopAnnotateCb,
	subtractOp: binopAnnotateCb,
	divOp: binopAnnotateCb,
	idivOp: binopAnnotateCb,
	modOp: binopAnnotateCb,
	multiplyOp: binopAnnotateCb,

	// And + Or operators
	andOp: logicOpAnnotateCb,
	orOp: logicOpAnnotateCb,

	// Sequences
	sequenceExpr: (ast: IAST, context: AnnotationContext): SequenceType => {
		const children = astHelper.getChildren(ast, '*');
		children.map((a) => annotate(a, context));
		return annotateSequenceOperator(ast, children.length, context);
	},

	// Set operations (union, intersect, except)
	unionOp: setOpAnnotateCb,
	intersectOp: setOpAnnotateCb,
	exceptOp: setOpAnnotateCb,

	// String concatentation
	stringConcatenateOp: (ast: IAST, context: AnnotationContext): SequenceType => {
		annotate(astHelper.getFirstChild(ast, 'firstOperand')[1] as IAST, context);
		annotate(astHelper.getFirstChild(ast, 'secondOperand')[1] as IAST, context);
		return annotateStringConcatenateOperator(ast, context);
	},

	// Range operator
	rangeSequenceExpr: (ast: IAST, context: AnnotationContext): SequenceType => {
		annotate(astHelper.getFirstChild(ast, 'startExpr')[1] as IAST, context);
		annotate(astHelper.getFirstChild(ast, 'endExpr')[1] as IAST, context);
		return annotateRangeSequenceOperator(ast, context);
	},

	// Comparison operators
	equalOp: generalComporeAnnotateCb,
	notEqualOp: generalComporeAnnotateCb,
	lessThanOrEqualOp: generalComporeAnnotateCb,
	lessThanOp: generalComporeAnnotateCb,
	greaterThanOrEqualOp: generalComporeAnnotateCb,
	greaterThanOp: generalComporeAnnotateCb,
	eqOp: valueCompareAnnotateCb,
	neOp: valueCompareAnnotateCb,
	ltOp: valueCompareAnnotateCb,
	leOp: valueCompareAnnotateCb,
	gtOp: valueCompareAnnotateCb,
	geOp: valueCompareAnnotateCb,
	isOp: nodeCompareAnnotateCb,
	nodeBeforeOp: nodeCompareAnnotateCb,
	nodeAfterOp: nodeCompareAnnotateCb,

	// Path Expression
	pathExpr: (ast: IAST, context: AnnotationContext): SequenceType => {
		const root = astHelper.getFirstChild(ast, 'rootExpr');
		if (root) annotate(root[1] as IAST, context);
		astHelper.getChildren(ast, 'stepExpr').map((b) => annotate(b, context));
		return annotatePathExpr(ast, context);
	},

	// Context Item
	contextItemExpr: (ast, _context) => {
		return annotateContextItemExpr(ast);
	},
	ifThenElseExpr: (ast: IAST, context: AnnotationContext): SequenceType => {
		const ifClause = annotate(
			astHelper.getFirstChild(astHelper.getFirstChild(ast, 'ifClause'), '*'),
			context
		);
		const thenClause = annotate(
			astHelper.getFirstChild(astHelper.getFirstChild(ast, 'thenClause'), '*'),
			context
		);
		const elseClause = annotate(
			astHelper.getFirstChild(astHelper.getFirstChild(ast, 'elseClause'), '*'),
			context
		);
		return annotateIfThenElseExpr(ast, thenClause, elseClause, context);
	},
	instanceOfExpr: (ast: IAST, context: AnnotationContext): SequenceType => {
		annotate(astHelper.getFirstChild(ast, 'argExpr'), context);
		annotate(astHelper.getFirstChild(ast, 'sequenceType'), context);
		return annotateInstanceOfExpr(ast, context);
	},

	// Constant expressions
	integerConstantExpr: (ast: IAST, context: AnnotationContext): SequenceType => {
		const integerSequenceType = {
			type: ValueType.XSINTEGER,
			mult: SequenceMultiplicity.EXACTLY_ONE,
		};

		astHelper.insertAttribute(ast, 'type', integerSequenceType);
		return integerSequenceType;
	},
	doubleConstantExpr: (ast: IAST, context: AnnotationContext): SequenceType => {
		const doubleSequenceType = {
			type: ValueType.XSDOUBLE,
			mult: SequenceMultiplicity.EXACTLY_ONE,
		};

		astHelper.insertAttribute(ast, 'type', doubleSequenceType);
		return doubleSequenceType;
	},
	decimalConstantExpr: (ast: IAST, context: AnnotationContext): SequenceType => {
		const decimalSequenceType = {
			type: ValueType.XSDECIMAL,
			mult: SequenceMultiplicity.EXACTLY_ONE,
		};

		astHelper.insertAttribute(ast, 'type', decimalSequenceType);
		return decimalSequenceType;
	},
	stringConstantExpr: (ast: IAST, context: AnnotationContext): SequenceType => {
		const stringSequenceType = {
			type: ValueType.XSSTRING,
			mult: SequenceMultiplicity.EXACTLY_ONE,
		};

		astHelper.insertAttribute(ast, 'type', stringSequenceType);
		return stringSequenceType;
	},

	// Functions
	functionCallExpr: (ast: IAST, context: AnnotationContext): SequenceType => {
		const functionArguments = astHelper.getFirstChild(ast, 'arguments');
		const argumentTypeNodes = astHelper.getChildren(functionArguments, '*');
		const argumentTypes: SequenceType[] = argumentTypeNodes.map((x) => annotate(x, context));

		return annotateFunctionCall(ast, argumentTypes, context);
	},
	arrowExpr: (ast: IAST, context: AnnotationContext): SequenceType => {
		const functionCallExpr: SequenceType = annotate(
			astHelper.getFirstChild(ast, 'argExpr')[1] as IAST,
			context
		);

		return annotateArrowExpr(ast, functionCallExpr, context);
	},
	dynamicFunctionInvocationExpr: (ast: IAST, context: AnnotationContext): SequenceType => {
		const functionItem: SequenceType = annotate(
			astHelper.followPath(ast, ['functionItem', '*']),
			context
		);
		const args: SequenceType = annotate(astHelper.getFirstChild(ast, 'arguments'), context);
		return annotateDynamicFunctionInvocationExpr(ast, context, functionItem, args);
	},
	namedFunctionRef: (ast: IAST, context: AnnotationContext): SequenceType => {
		return annotateNamedFunctionRef(ast, context);
	},
	inlineFunctionExpr: (ast: IAST, context: AnnotationContext): SequenceType => {
		annotate(astHelper.getFirstChild(ast, 'functionBody')[1] as IAST, context);
		return { type: ValueType.FUNCTION, mult: SequenceMultiplicity.EXACTLY_ONE };
	},
	// Casting
	castExpr: (ast: IAST, context: AnnotationContext): SequenceType => {
		return annotateCastOperator(ast, context);
	},
	castableExpr: (ast: IAST, context: AnnotationContext): SequenceType => {
		return annotateCastableOperator(ast, context);
	},
	// Maps
	simpleMapExpr: (ast: IAST, context: AnnotationContext): SequenceType => {
		astHelper.getChildren(ast, 'pathExpr').map((c) => annotate(c, context));
		return annotateSimpleMapExpr(ast, context);
	},
	mapConstructor: (ast: IAST, context: AnnotationContext): SequenceType => {
		astHelper.getChildren(ast, 'mapConstructorEntry').map((keyValuePair) => ({
			key: annotate(astHelper.followPath(keyValuePair, ['mapKeyExpr', '*']), context),
			value: annotate(astHelper.followPath(keyValuePair, ['mapValueExpr', '*']), context),
		}));
		return annotateMapConstructor(ast, context);
	},
	// Arrays
	arrayConstructor: (ast: IAST, context: AnnotationContext): SequenceType => {
		astHelper
			.getChildren(astHelper.getFirstChild(ast, '*'), 'arrayElem')
			.map((arrayElem) => annotate(arrayElem, context));
		return annotateArrayConstructor(ast, context);
	},
	// Unary Lookup
	unaryLookup: (ast: IAST, context: AnnotationContext): SequenceType => {
		const ncName = astHelper.getFirstChild(ast, 'NCName');
		return annotateUnaryLookup(ast, ncName);
	},
	// TypeSwitch
	typeswitchExpr: (ast: IAST, context: AnnotationContext): SequenceType => {
		const argumentType = annotate(astHelper.getFirstChild(ast, 'argExpr')[1] as IAST, context);
		const caseClausesReturns = astHelper
			.getChildren(ast, 'typeswitchExprCaseClause')
			.map((a) => annotate(astHelper.followPath(a, ['resultExpr'])[1] as IAST, context));
		const defaultCaseReturn = annotate(
			astHelper.followPath(ast, ['typeswitchExprDefaultClause', 'resultExpr'])[1] as IAST,
			context
		);
		return annotateTypeSwitchOperator(ast, argumentType, caseClausesReturns, defaultCaseReturn);
	},
	quantifiedExpr: (ast: IAST, context: AnnotationContext): SequenceType => {
		astHelper.getChildren(ast, '*').map((a) => annotate(a, context));
		return annotateQuantifiedExpr(ast, context);
	},
	'x:stackTrace': (ast: IAST, context: AnnotationContext): SequenceType => {
		return annotate(astHelper.getChildren(ast, '*')[2], context);
	},
	queryBody: (ast: IAST, context: AnnotationContext): SequenceType => {
		const type = annotate(ast[1] as IAST, context);
		if (type) {
			astHelper.insertAttribute(ast, 'type', type);
		}
		return type;
	},
};
