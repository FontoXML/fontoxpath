import Expression from '../expressions/Expression';
import TestAbstractExpression from '../expressions/tests/TestAbstractExpression';

import astHelper from './astHelper';

import PathExpression from '../expressions/path/PathExpression';
import ForExpression from '../expressions/ForExpression';
import MapConstructor from '../expressions/maps/MapConstructor';
import ArrayConstructor from '../expressions/arrays/ArrayConstructor';
import AbsolutePathExpression from '../expressions/path/AbsolutePathExpression';
import Filter from '../expressions/postfix/Filter';
import AttributeAxis from '../expressions/axes/AttributeAxis';
import AncestorAxis from '../expressions/axes/AncestorAxis';
import ChildAxis from '../expressions/axes/ChildAxis';
import DescendantAxis from '../expressions/axes/DescendantAxis';
import FollowingAxis from '../expressions/axes/FollowingAxis';
import FollowingSiblingAxis from '../expressions/axes/FollowingSiblingAxis';
import ParentAxis from '../expressions/axes/ParentAxis';
import PrecedingAxis from '../expressions/axes/PrecedingAxis';
import PrecedingSiblingAxis from '../expressions/axes/PrecedingSiblingAxis';
import SelfExpression from '../expressions/axes/SelfAxis';
import NameTest from '../expressions/tests/NameTest';
import KindTest from '../expressions/tests/KindTest';
import PITest from '../expressions/tests/PITest';
import TypeTest from '../expressions/tests/TypeTest';
import FunctionCall from '../expressions/functions/FunctionCall';
import InlineFunction from '../expressions/functions/InlineFunction';
import AndOperator from '../expressions/operators/boolean/AndOperator';
import OrOperator from '../expressions/operators/boolean/OrOperator';
import UniversalExpression from '../expressions/operators/UniversalExpression';
import Union from '../expressions/operators/Union';
import IntersectExcept from '../expressions/operators/IntersectExcept';
import SequenceOperator from '../expressions/operators/SequenceOperator';
import SimpleMapOperator from '../expressions/operators/SimpleMapOperator';
import Unary from '../expressions/operators/arithmetic/Unary';
import BinaryOperator from '../expressions/operators/arithmetic/BinaryOperator';
import Compare from '../expressions/operators/compares/Compare';
import InstanceOfOperator from '../expressions/operators/types/InstanceOfOperator';
import CastAsOperator from '../expressions/operators/types/CastAsOperator';
import CastableAsOperator from '../expressions/operators/types/CastableAsOperator';
import QuantifiedExpression from '../expressions/quantified/QuantifiedExpression';
import IfExpression from '../expressions/conditional/IfExpression';
import Literal from '../expressions/literals/Literal';
import LetExpression from '../expressions/LetExpression';
import NamedFunctionRef from '../expressions/NamedFunctionRef';
import VarRef from '../expressions/VarRef';

import DirElementConstructor from '../expressions/xquery/DirElementConstructor';
import DirCommentConstructor from '../expressions/xquery/DirCommentConstructor';
import DirPIConstructor from '../expressions/xquery/DirPIConstructor';

function assertValidCodePoint (codePoint) {
	if ((codePoint >= 0x1 && codePoint <= 0xD7FF) ||
		(codePoint >= 0xE000 && codePoint <= 0xFFFD) ||
		(codePoint >= 0x10000 && codePoint <= 0x10FFFF)) {
		return;
	}
	throw new Error(`XQST0090: The character reference ${codePoint} (${codePoint.toString(16)}) does not reference a valid codePoint.`);
}

function parseCharacterReferences (input) {
	return input
		.replace(/(&[^;]+);/g, match => {
			if (/^&#x/.test(match)) {
				const codePoint = parseInt(match.slice(3, -1), 16);
				assertValidCodePoint(codePoint);
				return String.fromCodePoint(codePoint);
			}
			if (/^&#/.test(match)) {
				const codePoint = parseInt(match.slice(2, -1), 10);
				assertValidCodePoint(codePoint);
				return String.fromCodePoint(codePoint);
			}
			switch (match) {
				case '&lt;':
					return '<';
				case '&gt;':
					return '>';
				case '&amp;':
					return '&';
				case '&quot;':
					return '"';
				case '&apos;':
					return '\'';
			}

			throw new Error('XPST0003: Unknown character reference: "' + match + '"');
		});
}

// Basic and incomplete implementation of single steps as defined in XPATH 1.0 (http://www.w3.org/TR/xpath/)
// Only single steps are allowed, because that's what expressions offer. Anyway: all paths have synonyms as (nested) predicates.
// Missing:
//  * various functions, such as:
//    * last()
//    * first()
//    * position()
//    * name()
//  * operators, such as >, <, *, +, | and =, unless in the context of attributes
//  * variables
/**
 * @param   {!Array<?>}               ast
 * @param   {{allowXQuery:boolean}}   compilationOptions
 * @return  {!Expression}
 */
function compile (ast, compilationOptions) {
	const name = ast[0];
	switch (name) {
			// Operators
		case 'andOp':
			return andOp(ast, compilationOptions);
		case 'orOp':
			return orOp(ast, compilationOptions);
		case 'unaryPlus':
			return unaryPlus(ast, compilationOptions);
		case 'unaryMinus':
			return unaryMinus(ast, compilationOptions);
		case 'addOp':
		case 'subtractOp':
		case 'multiplyOp':
			return binaryOperator(ast, compilationOptions);
		case 'sequenceExpr':
			return sequence(ast, compilationOptions);
		case 'union':
			return union(ast, compilationOptions);
		case 'intersectExcept':
			return intersectExcept(ast, compilationOptions);
		case 'stringConcatenateOp':
			return stringConcatenateOp(ast, compilationOptions);

			// Compares
		case 'equalOp':
		case 'notEqualOp':
		case 'lessThanOrEqualOp':
		case 'lessThanOp':
		case 'greaterThanOrEqualOp':
		case 'greaterThanOp':
		case 'eqOp':
		case 'neOp':
		case 'ltOp':
		case 'leOp':
		case 'gtOp':
		case 'geOp':
			return compare(ast, compilationOptions);


			// Tests
		case 'nameTest':
			return nameTest(ast, compilationOptions);
		case 'kindTest':
			return kindTest(ast, compilationOptions);
		case 'typeTest':
			return typeTest(ast, compilationOptions);
		case 'piTest':
			return piTest(ast, compilationOptions);
		case 'anyKindTest':
			return anyKindTest(ast, compilationOptions);

			// Path
		case 'pathExpr':
			return pathExpr(ast, compilationOptions);

			// Postfix operators
		case 'filter':
			return filter(ast, compilationOptions);

			// Functions
		case 'functionCallExpr':
			return functionCall(ast, compilationOptions);
		case 'inlineFunction':
			return inlineFunction(ast, compilationOptions);
		case 'arrowExpr':
			return arrowExpr(ast, compilationOptions);

			// Literals
		case 'integerConstantExpr':
			return integerConstantExpr(ast, compilationOptions);
		case 'stringConstantExpr':
			return stringConstantExpr(ast, compilationOptions);

			// Variables
		case 'let':
			return letExpression(ast, compilationOptions);
		case 'varRef':
			return varRef(ast, compilationOptions);
		case 'forExpression':
			return forExpression(ast, compilationOptions);
		case 'flworExpr':
			return flworExpression(ast, compilationOptions);

			// Quantified
		case 'quantified':
			return quantified(ast, compilationOptions);

			// Conditional
		case 'ifThenElseExpr':
			return IfThenElseExpr(ast, compilationOptions);

		case 'instance of':
			return instanceOf(ast, compilationOptions);
		case 'cast as':
			return castAs(ast, compilationOptions);
		case 'castable as':
			return castableAs(ast, compilationOptions);

		case 'simpleMap':
			return simpleMap(ast, compilationOptions);

		case 'mapConstructor':
			return mapConstructor(ast, compilationOptions);

		case 'arrayConstructor':
			return arrayConstructor(ast, compilationOptions);

			// XQuery element constructors
		case 'elementConstructor':
			return dirElementConstructor(ast, compilationOptions);

		case 'DirCommentConstructor':
			return dirCommentConstructor(ast, compilationOptions);

		case 'DirPIConstructor':
			return dirPIConstructor(ast, compilationOptions);

		default:
			throw new Error('No selector counterpart for: ' + ast[0] + '.');
	}
}

function arrayConstructor (ast, compilationOptions) {
	return new ArrayConstructor(ast[0], ast.slice(1).map(arg => compile(arg, compilationOptions)));
}

function mapConstructor (ast, compilationOptions) {
	return new MapConstructor(ast.map(function (keyValuePair) {
		return {
			key: compile(keyValuePair[0], compilationOptions),
			value: compile(keyValuePair[1], compilationOptions)
		};
	}));
}

function andOp (ast, compilationOptions) {
	return new AndOperator([
		compile(astHelper.getFirstChild(ast, 'firstOperand')[1], compilationOptions),
		compile(astHelper.getFirstChild(ast, 'secondOperand')[1], compilationOptions)
	]);
}

function binaryOperator (ast, compilationOptions) {
	const kind = ast[0];
	const a = compile(astHelper.followPath(ast, ['firstOperand', '*']), compilationOptions);
	const b = compile(astHelper.followPath(ast, ['secondOperand', '*']), compilationOptions);

	return new BinaryOperator(kind, a, b);
}

function castAs (ast, compilationOptions) {
	const expression = compile(ast[0], compilationOptions);
	const [[prefix, namespaceURI, name], multiplicity] = ast[1];

	return new CastAsOperator(expression, { prefix, namespaceURI, name }, multiplicity);
}

function castableAs (ast, compilationOptions) {
	const expression = compile(ast[0], compilationOptions);
	const [[prefix, namespaceURI, name], multiplicity] = ast[1];

	return new CastableAsOperator(expression, { prefix, namespaceURI, name }, multiplicity);
}

// Binary compare (=, !=, le, is, <<, >>, etc)
function compare (ast, compilationOptions) {
	return new Compare(
		ast[0],
		compile(astHelper.followPath(ast, ['firstOperand', '*']), compilationOptions),
		compile(astHelper.followPath(ast, ['secondOperand', '*']), compilationOptions));
}

function IfThenElseExpr (ast, compilationOptions) {
	return new IfExpression(
		compile(astHelper.getFirstChild(astHelper.getFirstChild(ast, 'ifClause'), '*'), compilationOptions),
		compile(astHelper.getFirstChild(astHelper.getFirstChild(ast, 'thenClause'), '*'), compilationOptions),
		compile(astHelper.getFirstChild(astHelper.getFirstChild(ast, 'elseClause'), '*'), compilationOptions));
}

function filter (ast, compilationOptions) {
	return new Filter(compile(ast[1], compilationOptions), compile(ast[0], compilationOptions));
}

function forExpression ([[prefix, namespaceURI, name], expression, returnExpression], compilationOptions) {
	return new ForExpression(
		{
			varName: { prefix, namespaceURI, name },
			expression: compile(expression, compilationOptions)
		},
		compile(returnExpression, compilationOptions));
}

function flworExpression (ast, compilationOptions) {
	const [initialClause, ...intermediateClausesAndReturnClause] = astHelper.getChildren(ast, '*');
	const returnClauseExpression = astHelper.getFirstChild(intermediateClausesAndReturnClause[intermediateClausesAndReturnClause.length - 1], '*');
	const intermediateClauses = intermediateClausesAndReturnClause.slice(0, -1);

	if (intermediateClauses.length) {
		throw new Error('Not implemented: Intermediate clauses in flwor expressions are not implemented yet');
	}

	if (initialClause[0] === 'forClause') {
		const forClauseItems = astHelper.getChildren(initialClause, '*');
		return forClauseItems
			.reduceRight(
				(returnExpr, forClauseItem) => {
					const expression = 	astHelper.followPath(forClauseItem, ['forExpr', '*']);
					return new ForExpression(
						astHelper.getQName(astHelper.followPath(forClauseItem, ['typedVariableBinding', 'varName'])),
						compile(expression, compilationOptions),
						returnExpr);
				},
				compile(returnClauseExpression, compilationOptions));
	}

	if (initialClause[0] === 'letClause') {
		const letClauseItems = astHelper.getChildren(initialClause, '*');
		return letClauseItems
			.reduceRight(
				(returnExpr, letClauseItem) => {
					const expression = 	astHelper.followPath(letClauseItem, ['letExpr', '*']);
					return new LetExpression(
						astHelper.getQName(astHelper.followPath(letClauseItem, ['typedVariableBinding', 'varName'])),
						compile(expression, compilationOptions),
						returnExpr);
				},
				compile(returnClauseExpression, compilationOptions));
	}

	throw new Error(`Not implemented: ${initialClause[0]} is not supported in a flwor expression`);
}

function functionCall (ast, compilationOptions) {
	const functionName = astHelper.getFirstChild(ast, 'functionName');
	const functionArguments = astHelper.getChildren(astHelper.getFirstChild(ast, 'arguments'), '*');
	return new FunctionCall(
		new NamedFunctionRef(
			astHelper.getQName(functionName),
			functionArguments.length),
		functionArguments.map(arg => compile(arg, compilationOptions)));
}

function arrowExpr (ast, compilationOptions) {
	const argExpr = astHelper.followPath(ast, ['argExpr', '*']);
	const functionName = astHelper.getFirstChild(ast, 'EQName');
	const functionArguments = astHelper.getChildren(astHelper.getFirstChild(ast, 'arguments'), '*');
	return new FunctionCall(
		new NamedFunctionRef(
			astHelper.getQName(functionName),
			functionArguments.length + 1),
		[compile(argExpr, compilationOptions)].concat(functionArguments.map(arg => compile(arg, compilationOptions))));
}

function inlineFunction (ast, compilationOptions) {
	const [params, returnType, body] = ast;
	return new InlineFunction(
		params.map(([[prefix, namespaceURI, name], type]) => ([{ prefix, namespaceURI, name }, type])),
		returnType,
		compile(body, compilationOptions));
}

function instanceOf (ast, compilationOptions) {
	const expression = compile(ast[0], compilationOptions);
	const sequenceType = ast[1];

	return new InstanceOfOperator(expression, compile(sequenceType[0], compilationOptions), sequenceType[1] || '');
}

function letExpression (ast, compilationOptions) {
	const [prefix, namespaceURI, name] = ast[0];
	const bindingSequence = compile(ast[1], compilationOptions);
	const returnExpression = compile(ast[2], compilationOptions);

	return new LetExpression({ prefix, namespaceURI, name }, bindingSequence, returnExpression);
}

function integerConstantExpr (ast, _compilationOptions) {
	return new Literal(
		astHelper.getTextContent(astHelper.getFirstChild(ast, 'value')),
		'xs:integer');
}

function stringConstantExpr (ast, _compilationOptions) {
	return new Literal(
		astHelper.getTextContent(astHelper.getFirstChild(ast, 'value')),
		'xs:string');
}

function nameTest (ast, _compilationOptions) {
	return new NameTest(astHelper.getQName(ast));
}

function kindTest (ast, _compilationOptions) {
	switch (ast[0]) {
		case 'item()':
			return new UniversalExpression();
		case 'node()':
			return new TypeTest(null, null, 'node()');
		case 'element()':
			if (ast.length === 2) {
				return new NameTest(ast[1][0], ast[1][1], ast[1][2], { kind: 1 });
			}

			if (ast.length > 2) {
				throw new Error('element() with more than 1 argument is not supported.');
			}

			return new KindTest(1);
		case 'text()':
			return new KindTest(3);
		case 'processing-instruction()':
			if (ast.length > 1) {
				return new PITest(ast[1]);
			}
			return new KindTest(7);
		case 'comment()':
			return new KindTest(8);
		case 'document-node()':
			return new KindTest(9);
		case 'attribute()':
			if (ast.length === 2) {
				return new NameTest(ast[1][0], ast[1][1], ast[1][2], { kind: 2 });
			}

			if (ast.length > 2) {
				throw new Error('attribute() with more than 1 argument is not supported.');
			}

			return new KindTest(2);
		default:
			throw new Error('Unrecognized nodeType: ' + ast[0]);
	}
}

function anyKindTest (ast, compilationOptions) {
	return new TypeTest(null, null, 'node()');
}

function orOp (ast, compilationOptions) {
	return new OrOperator([
		compile(astHelper.getFirstChild(ast, 'firstOperand')[1], compilationOptions),
		compile(astHelper.getFirstChild(ast, 'secondOperand')[1], compilationOptions)
	]);
}

function pathExpr (ast, compilationOptions) {
	const steps = astHelper.getChildren(ast, 'stepExpr')
		.map(step => {
			const axis = astHelper.getFirstChild(step, 'xpathAxis');
			if (axis) {
				const test = astHelper.getFirstChild(step, [
					'attributeTest',
					'anyElementTest',
					'piTest',
					'documentTest',
					'commentTest',
					'namespaceTest',
					'anyKindTest',
					'textTest',
					'anyFunctionTest',
					'typedFunctionTest',
					'schemaAttributeTest',
					'atomicType',
					'anyItemType',
					'parenthesizedItemType',
					'typedMapTest',
					'typedArrayTest',
					'nameTest',
					'Wildcard'
				]);

				const predicates = astHelper.getFirstChild(step, 'predicates');

				let axisExpression;
				switch (astHelper.getTextContent(axis)) {
					case 'ancestor':
						axisExpression = new AncestorAxis(compile(test, compilationOptions), { inclusive: false });
						break;
					case 'ancestor-or-self':
						axisExpression = new AncestorAxis(compile(test, compilationOptions), { inclusive: true });
						break;
					case 'attribute':
						axisExpression = new AttributeAxis(compile(test, compilationOptions));
						break;
					case 'child':
						axisExpression = new ChildAxis(compile(test, compilationOptions));
						break;
					case 'descendant':
						axisExpression = new DescendantAxis(compile(test, compilationOptions), { inclusive: false });
						break;
					case 'descendant-or-self':
						axisExpression = new DescendantAxis(compile(test, compilationOptions), { inclusive: true });
						break;
					case 'parent':
						axisExpression = new ParentAxis(compile(test, compilationOptions));
						break;
					case 'following-sibling':
						axisExpression = new FollowingSiblingAxis(compile(test, compilationOptions));
						break;
					case 'preceding-sibling':
						axisExpression = new PrecedingSiblingAxis(compile(test, compilationOptions));
						break;
					case 'following':
						axisExpression = new FollowingAxis(compile(test, compilationOptions));
						break;
					case 'preceding':
						axisExpression = new PrecedingAxis(compile(test, compilationOptions));
						break;
					case 'self':
						axisExpression = new SelfExpression(compile(test, compilationOptions));
						break;
				}

				if (!predicates) {
					return axisExpression;
				}
				return astHelper.getChildren(predicates, '*')
					.reduceRight(
						(innerStep, predicate) => new Filter(innerStep, compile(predicate, compilationOptions)),
						axisExpression);
			}
		});
	const isAbsolute = astHelper.getFirstChild('root');
	const pathExpr = new PathExpression(steps);
	if (isAbsolute) {
		return new AbsolutePathExpression(pathExpr);
	}
	return pathExpr;
}

function piTest (ast, compilationOptions) {
	return new KindTest(7);
}

function quantified (ast, compilationOptions) {
	const inClauseExpressions = ast[1].map(([_name, expression]) => {
		return compile(expression, compilationOptions);
	});
	const inClauseNames = ast[1].map(([[namespaceURI, prefix, name], _expression]) => {
		return {
			namespaceURI, prefix, name
		};
	});
	return new QuantifiedExpression(ast[0], inClauseNames, inClauseExpressions, compile(ast[2], compilationOptions));
}

function sequence (ast, compilationOptions) {
	return new SequenceOperator(astHelper.getChildren(ast, '*').map(arg => compile(arg, compilationOptions)));
}

function simpleMap (ast, compilationOptions) {
	return new SimpleMapOperator(compile(ast[0], compilationOptions), compile(ast[1], compilationOptions));
}

function stringConcatenateOp (ast, compilationOptions) {
	const args = [
		astHelper.getFirstChild(ast, 'firstOperand')[1],
		astHelper.getFirstChild(ast, 'secondOperand')[1]];
	return new FunctionCall(
		new NamedFunctionRef(
			{
				namespaceURI: 'http://www.w3.org/2005/xpath-functions',
				localName: 'concat'
			},
			args.length),
		args.map(arg => compile(arg, compilationOptions)));
}

function typeTest (ast, _compilationOptions) {
	const [prefix, namespaceURI, name] = ast[0];
	return new TypeTest(prefix, namespaceURI, name);
}

function unaryPlus (ast, compilationOptions) {
	return new Unary('+', compile(ast[0], compilationOptions));
}

function unaryMinus (ast, compilationOptions) {
	return new Unary('-', compile(ast[0], compilationOptions));
}

function union (ast, compilationOptions) {
	return new Union(ast.map(arg => compile(arg, compilationOptions)));
}

function intersectExcept (ast, compilationOptions) {
	return new IntersectExcept(ast[0], compile(ast[1], compilationOptions), compile(ast[2], compilationOptions));
}

function varRef (ast, _compilationOptions) {
	const { prefix, namespaceURI, localName } = astHelper.getQName(astHelper.getFirstChild(ast, 'name'));
	return new VarRef(prefix, namespaceURI, localName );
}

function isTextNodeOrCDataSection (item) {
	return item !== undefined && ((typeof item === 'string') || (item[0] === 'CDataSection'));
}

// XQuery Node constructors
function dirElementConstructor (ast, compilationOptions) {
	if (!compilationOptions.allowXQuery) {
		throw new Error('XPST0003: Use of XQuery functionality is not allowed in XPath context');
	}
	const openingQName = ast[0];
	const closingQName = ast[1];
	/**
	 * @type {!Array<string|!Array>}
	 */
	const attList = ast[2];
	/**
	 * @type {!Array<string|!Array>}
	 */
	const contents = ast[3];

	const prefix = /** @type {string} */ (openingQName[0]);
	const name = /** @type {string} */ (openingQName[1]);
	if (closingQName) {
		// Throw a parsing error if the closingName does not match up
		const [closingPrefix, closingName] = closingQName;

		if (prefix !== closingPrefix || name !== closingName) {
			throw new Error('XQST0118: The start and the end tag of an element constructor must be equal');
		}
	}

	return new DirElementConstructor(
		prefix,
		name,
		attList.map(([name, val]) => ({
			name: name,
			partialValues: val.map(partialValue => {
				if (typeof partialValue === 'string') {
					return parseCharacterReferences(partialValue.replace(/\s/g, ' '));
				}
				return compile(partialValue, compilationOptions);
			})
		})),
		contents.reduce((mappedContents, content, i) => {
			if (typeof content === 'string') {
				// Detect boundary whitespace:

				// [Definition: Boundary whitespace is a sequence of
				// consecutive whitespace characters within the content of a direct element
				// constructor, that is delimited at each end either by the start or end of the
				// content, or by a DirectConstructor, or by an EnclosedExpr. For this purpose,
				// characters generated by character references such as &#x20; or by CDataSections
				// are not considered to be whitespace characters.]
				if (/^\s*$/.test(content)) {
					// TODO: these following whitespace handling things should be influenced by the
					// `declare boundary-space preserve;` settings in the prolog
					if (i === 0 && !isTextNodeOrCDataSection(contents[i + 1])) {
						// This is boundary whitespace
						return mappedContents;
					}
					if (i === contents.length - 1 && !isTextNodeOrCDataSection(contents[i - 1])) {
						// This is boundary whitespace
						return mappedContents;
					}

					if (!isTextNodeOrCDataSection(contents[i - 1]) && !isTextNodeOrCDataSection(contents[i + 1])) {
						// This is boundary whitespace
						return mappedContents;
					}
				}

				if (content.length !== 0) {
					mappedContents.push(new Literal(parseCharacterReferences(content), 'xs:string'));
				}
				return mappedContents;
			}
			if (content[0] === 'CDataSection') {
				// Do not mess with character references in CData
				if (content[1].length !== 0) {
					mappedContents.push(new Literal(content[1], 'xs:string'));
				}
				return mappedContents;
			}

			mappedContents.push(compile(content, compilationOptions));
			return mappedContents;
		}, []));
}

function dirCommentConstructor (ast, _compilationOptions) {
	return new DirCommentConstructor(ast[0]);
}

function dirPIConstructor (ast, _compilationOptions) {
	return new DirPIConstructor(ast[0], ast[1]);
}

/**
 * @param   {!Array<?>}  xPathAst
 * @return  {!Expression}
 */
export default function (xPathAst, compilationOptions) {
    return compile(xPathAst, compilationOptions);
}
