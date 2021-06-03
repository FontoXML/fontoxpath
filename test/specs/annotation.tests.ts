import * as chai from 'chai';
import {
	SequenceMultiplicity,
	SequenceType,
	ValueType,
} from 'fontoxpath/expressions/dataTypes/Value';
import StaticContext from 'fontoxpath/expressions/StaticContext';
import astHelper from 'fontoxpath/parsing/astHelper';
import parseExpression from 'fontoxpath/parsing/parseExpression';
import annotateAst, { countQueryBodyAnnotations } from 'fontoxpath/typeInference/annotateAST';
import { AnnotationContext } from 'fontoxpath/typeInference/AnnotationContext';
import { type } from 'os';

/**
 *
 * @param expression
 * @param expectedType
 * @param staticContext
 * @param followSpecificPath optional, used to pinpoint the nodes that requires type assertions
 * as sometimes it is hard to have queries that produce ast that is purely about the item under test.
 */
function assertValueType(
	expression: string,
	expectedType: ValueType,
	context: AnnotationContext,
	followSpecificPath?: string[]
) {
	const ast = parseExpression(expression, {});
	if (context) annotateAst(ast, context);
	else annotateAst(ast, new AnnotationContext(undefined));

	const queryBody = astHelper.followPath(
		ast,
		followSpecificPath ? followSpecificPath : ['mainModule', 'queryBody']
	);
	const resultType = astHelper.getAttribute(queryBody, 'type') as SequenceType;
	if (!resultType) {
		chai.assert.isTrue(expectedType === null || expectedType === undefined);
	} else {
		chai.assert.deepEqual(resultType.type, expectedType);
	}
}

describe('Annotating constants', () => {
	it('annotates an integer constant', () => assertValueType('1', ValueType.XSINTEGER, undefined));
	it('annotates a string constant', () =>
		assertValueType("'test'", ValueType.XSSTRING, undefined));
	it('annotates decimal constant', () => assertValueType('0.5', ValueType.XSDECIMAL, undefined));
	it('annotates double constant', () => assertValueType('1.0e7', ValueType.XSDOUBLE, undefined));
});

describe('Annotating unary expressions', () => {
	it('annotates unary plus operator', () =>
		assertValueType('+1', ValueType.XSINTEGER, undefined));
	it('annotates chained unary plus operator', () =>
		assertValueType('+++1', ValueType.XSINTEGER, undefined));
	it('annotates unary minus operator', () =>
		assertValueType('-1', ValueType.XSINTEGER, undefined));
	it('annotates chained unary minus operator', () =>
		assertValueType('---1', ValueType.XSINTEGER, undefined));
	it('annotates unary plus operator on decimal', () =>
		assertValueType('+0.1', ValueType.XSDECIMAL, undefined));
	it('annotates unary minus operator on decimal', () =>
		assertValueType('-0.1', ValueType.XSDECIMAL, undefined));
});

describe('Annotate unary lookup', () => {
	it('unary look up test', () => {
		assertValueType('map{"num":1}[?num]', ValueType.ITEM, undefined, [
			'mainModule',
			'queryBody',
			'pathExpr',
			'stepExpr',
			'predicates',
			'unaryLookup',
		]);
	});
});

describe('Path expression test', () => {
	it('Path expression test', () => {
		// The same query also triggers the path expression
		assertValueType('map{"num":1}[?num]', ValueType.NODE, undefined);
	});
});

describe('Annotating binary expressions', () => {
	it('simple add operator', () => assertValueType('1 + 2', ValueType.XSINTEGER, undefined));
	it('simple sub operator', () => assertValueType('1 - 2', ValueType.XSINTEGER, undefined));
	it('simple mul operator', () => assertValueType('1 * 2', ValueType.XSINTEGER, undefined));
	it('simple div operator', () => assertValueType('1 div 2', ValueType.XSDECIMAL, undefined));
	it('simple idiv operator', () => assertValueType('1 idiv 2', ValueType.XSINTEGER, undefined));
	it('simple mod operator', () => assertValueType('1 mod 2', ValueType.XSINTEGER, undefined));
	it('simple chained add operator', () =>
		assertValueType('1 + 2 + 3', ValueType.XSINTEGER, undefined));
	it('simple chained sub operator', () =>
		assertValueType('1 - 2 - 3', ValueType.XSINTEGER, undefined));
	it('simple chained mul operator', () =>
		assertValueType('1 * 2 * 3', ValueType.XSINTEGER, undefined));
	it('simple chained div operator', () =>
		assertValueType('1 div 2 div 3', ValueType.XSDECIMAL, undefined));
	it('simple chained idiv operator', () =>
		assertValueType('1 idiv 2 idiv 3', ValueType.XSINTEGER, undefined));
	it('simple chained mod operator', () =>
		assertValueType('1 mod 2 mod 3', ValueType.XSINTEGER, undefined));
	it('add integer and decimal results in decimal', () =>
		assertValueType('1 + 0.1', ValueType.XSDECIMAL, undefined));
});

describe('Annotating compare expressions', () => {
	it('eqOp', () => assertValueType('1 = 2', ValueType.XSBOOLEAN, undefined));
	it('neOp', () => assertValueType('1 != 2', ValueType.XSBOOLEAN, undefined));
	it('leOp', () => assertValueType('1 <= 2', ValueType.XSBOOLEAN, undefined));
	it('ltOp', () => assertValueType('1 < 2', ValueType.XSBOOLEAN, undefined));
	it('geOp', () => assertValueType('1 >= 2', ValueType.XSBOOLEAN, undefined));
	it('gtOp', () => assertValueType('1 > 2', ValueType.XSBOOLEAN, undefined));
});

describe('Annotating cast expressions', () => {
	it('simple cast expression', () =>
		assertValueType('5 cast as xs:double', ValueType.XSDOUBLE, undefined));
	it('unknown child cast expression', () =>
		assertValueType('$x cast as xs:integer', ValueType.XSINTEGER, undefined));
});

describe('Annotate Array', () => {
	it('annotate simple square array', () =>
		assertValueType('[3, 5, 4]', ValueType.ARRAY, undefined));
	it('annotate complex array', () =>
		assertValueType('["hello", (3, 4, 5)]', ValueType.ARRAY, undefined));
});

describe('annotate Sequence', () => {
	it('annotate simple sequence', () =>
		assertValueType('(4, 3, hello)', ValueType.ITEM, undefined));
	it('annotate complex sequence', () =>
		assertValueType('(4, 3, hello, (43, (256, "help")))', ValueType.ITEM, undefined));
});

describe('Annotate maps', () => {
	it('mapConstructor', () => assertValueType('map{a:1, b:2}', ValueType.MAP, undefined));
	it('simpleMapExpr', () => assertValueType('$a ! ( //b)', ValueType.MAP, undefined));
});

describe('Annotating ifThenElse expressions', () => {
	it('ifThenElse type is known', () =>
		assertValueType('if (3) then 3 else 5', ValueType.XSINTEGER, undefined));
	it('ifThenElse type is not known', () =>
		assertValueType('if (3) then "hello" else 5', ValueType.ITEM, undefined));
});

describe('Annotate quantifiedExpr', () => {
	it('quantifiedExpr', () =>
		assertValueType('every $x in true() satisfies $x', ValueType.XSBOOLEAN, undefined));
});

describe('Annotate arrowExpr', () => {
	it('annotate tailFunction', () =>
		assertValueType('array:tail([1]) => array:size()', ValueType.ITEM, undefined));
});

describe('Annotate dynamic function invocation expression test', () => {
	it('dynamic function invocation', () => {
		assertValueType('$f()', ValueType.ITEM, undefined, [
			'mainModule',
			'queryBody',
			'pathExpr',
			'stepExpr',
			'filterExpr',
			'dynamicFunctionInvocationExpr',
		]);
	});
});

describe('Annotating Logical Operator', () => {
	it('annotate or operator test', () =>
		assertValueType('true() or true()', ValueType.XSBOOLEAN, undefined));
	it('annotate and operator test', () =>
		assertValueType('true() and false()', ValueType.XSBOOLEAN, undefined));
	it('annotate mixed logical operator test', () =>
		assertValueType('true() (: and false() :) or true()', ValueType.XSBOOLEAN, undefined));
});

describe('Annotating Comparison operator', () => {
	it('equal operator', () => assertValueType('1 = 1', ValueType.XSBOOLEAN, undefined));
	it('not equal operator', () => assertValueType('1 != 1', ValueType.XSBOOLEAN, undefined));
	it('greater than operator', () => assertValueType('1 > 1', ValueType.XSBOOLEAN, undefined));
	it('greater than or equal operator', () =>
		assertValueType('1 >= 1', ValueType.XSBOOLEAN, undefined));
	it('less than operator', () => assertValueType('1 < 1', ValueType.XSBOOLEAN, undefined));
	it('less than or equal operator', () =>
		assertValueType('1 <= 1', ValueType.XSBOOLEAN, undefined));
});

// Halted: left and right is node returns undefined
describe('Annotating Set operator', () => {
	it('union of non nodes test', () => {
		assertValueType('array {a} union array {c}', ValueType.NODE, undefined);
	});
	it('intersect of non nodes test', () => {
		assertValueType('array {a, b} intersect array {b, c}', ValueType.NODE, undefined);
	});
	it('except of non nodes test', () => {
		assertValueType('[a] except [a]', ValueType.NODE, undefined);
	});

	// Generating left and right nodes using pathExpr (which returns a node)
	it('union test', () => {
		assertValueType('//*[@someAttribute] union //b', ValueType.NODE, undefined);
	});
	it('intersect test', () => {
		assertValueType('(//*[@someAttribute] intersect //b)', ValueType.NODE, undefined);
	});
	it('except test', () => {
		assertValueType('//*[@someAttribute] except //b', ValueType.NODE, undefined);
	});
});

describe('Annotating Node compare operator test', () => {
	it('Node before', () => {
		assertValueType('//firstElement << //secondElement', ValueType.XSBOOLEAN, undefined);
	});
	it('Node after', () => {
		assertValueType('//firstElement >> //secondElement', ValueType.XSBOOLEAN, undefined);
	});
});

describe('Annotating StringConcatenateOp', () => {
	it('Concatenate strings', () => {
		assertValueType('"con" || "cat" || "enate"', ValueType.XSSTRING, undefined);
	});
});

describe('Annotating RangeSequenceExpr', () => {
	it('RangeSequenceExpr', () => {
		assertValueType('(1 to 10)', ValueType.XSINTEGER, undefined);
	});
});

describe('Annotating Instance of', () => {
	it('Instance of positive test', () => {
		assertValueType('true() instance of xs:boolean*', ValueType.XSBOOLEAN, undefined);
	});
	it('Instance of negative test', () => {
		assertValueType('() instance of xs:boolean*', ValueType.XSBOOLEAN, undefined);
	});
	it('Instance of array', () => {
		assertValueType(
			'array { true(), false()} instance of xs:array*',
			ValueType.XSBOOLEAN,
			undefined
		);
	});
});

describe('Annotating contextItemExpr', () => {
	it('plain contextItemExpr test', () => {
		// . is the contextItem symbol? Annotation function returns only undefined right now
		assertValueType('.', undefined, undefined, []);
	});
});

describe('Annotating castable', () => {
	it('castable test', () => {
		assertValueType('"5" castable as xs:integer', ValueType.XSBOOLEAN, undefined);
	});
});

describe('Annotating function call without context', () => {
	it('array function call without context', () => {
		assertValueType('array:size([])', ValueType.ITEM, undefined);
	});
	it('array function call without context', () => {
		assertValueType('fn:concat#2', ValueType.ITEM, undefined);
	});
});

describe('Annotating inline functions', () => {
	it('in line function test', () => {
		assertValueType('function() {}', ValueType.FUNCTION, undefined);
	});
});

describe('Annotating typeswitch expression', () => {
	it('first case matches', () => {
		assertValueType(
			'typeswitch(1) case xs:integer return 2 case xs:string return 42.0 default return a',
			ValueType.XSINTEGER,
			undefined
		);
	});
	it('not first case matches', () => {
		assertValueType(
			'typeswitch(1) case xs:string return 42.0 case xs:integer return 2 default return a',
			ValueType.XSINTEGER,
			undefined
		);
	});
	it('typeswitch with an OR in the condition', () => {
		assertValueType(
			'typeswitch(1) case xs:integer | xs:string return 2 default return 42.0',
			ValueType.XSINTEGER,
			undefined
		);
	});
	it('default case is returned', () => {
		assertValueType(
			'typeswitch(1) case xs:string return 42.0 default return 2',
			ValueType.XSINTEGER,
			undefined
		);
	});
});

describe('Annotation counting', () => {
	const context = new AnnotationContext(undefined);
	insertVariables(context, [
		['x', { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.EXACTLY_ONE }],
		['a', { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.EXACTLY_ONE }],
		['b', { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.EXACTLY_ONE }],
	]);
	it('correctly counts add expressions', () => {
		const ast = parseExpression('2 + 1', {});
		annotateAst(ast, new AnnotationContext(undefined));
		const [total, annotated] = countQueryBodyAnnotations(ast);
		chai.assert.equal(total, annotated);
	});
	it('correctly counts unannotated expressions', () => {
		const ast = parseExpression('$x + 1', {});
		annotateAst(ast, context);
		const [total, annotated] = countQueryBodyAnnotations(ast);
		console.log(total, annotated);
		chai.assert.isTrue(annotated === total);
		chai.assert.equal(total, 4);
	});
	it('correctly counts unannotated expressions 2', () => {
		const ast = parseExpression('$b + math:sin($a)', {});
		annotateAst(ast, context);
		const [total, annotated] = countQueryBodyAnnotations(ast);
		console.log(total, annotated);
		chai.assert.equal(annotated, 2);
		chai.assert.equal(total, 5);
	});
});

describe('Annotating flwor Expressions', () => {
	it('annotate simple let expression', () => {
		assertValueType("let $s := 'Hello' return $s", ValueType.XSSTRING, undefined);
	});
	it('annotate complex let expression', () => {
		assertValueType(
			"let $s := 'Hello' return let $v := 3 return $s || $v",
			ValueType.XSSTRING,
			undefined
		);
	});
	it('annotate simple for expression', () => {
		assertValueType('for $x in (3, 4, 5) return $x', ValueType.ITEM, undefined);
	});

	it('annotate complex for expression', () => {
		assertValueType(
			'for $x in (3, 4, 5) for $y in (2, 5) return $x + $y',
			ValueType.ITEM,
			undefined
		);
	});

	it('annotate name shadowing for expression', () => {
		assertValueType(
			'for $x in (3, 25, 5) let $x := "stuff" || $x return $x',
			ValueType.ITEM,
			undefined
		);
	});
});

describe('annotating varRef', () => {
	const context = new AnnotationContext(undefined);
	context.insertVariable('x', {
		type: ValueType.XSINTEGER,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	});
	context.insertVariable('y', {
		type: ValueType.XSINTEGER,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	});
	context.insertVariable('z', {
		type: ValueType.XSSTRING,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	});
	it('annotate simple varRef', () => {
		assertValueType('$x', ValueType.XSINTEGER, context);
	});
	it('annotate varRef + varRef', () => {
		assertValueType('$x + $y', ValueType.XSINTEGER, context);
	});
	it('annotate complex varRef', () => {
		assertValueType('$x + 1', ValueType.XSINTEGER, context);
	});
	it('annotate varRef not in context', () => {
		assertValueType('$x + $l', ValueType.ITEM, context);
	});
	it('annotate varRef throws when types incorrect', () => {
		chai.assert.throws(() => assertValueType('$x + $z', undefined, context));
	});
});

/**
 * An easy way to add multiple variables in a context
 * @param context the context in which the variables are inserted
 * @param variables
 */
function insertVariables(context: AnnotationContext, variables: Array<[string, SequenceType]>) {
	variables.forEach((element) => {
		context.insertVariable(element[0], element[1]);
	});
}

// Type switch is not tested, type switch is reserved in XPath but not yet used
// Annotation of `functionCallExpr` and `namedFunctionRef` with context is not tested

// Test case template
// describe('Annotating ', () => {
// 	it('',
// 		() => {
//			// assertValueType('', ValueType. , undefined)
// 		});
// });
