import Expression from '../expressions/Expression';
import TestAbstractExpression from '../expressions/tests/TestAbstractExpression';

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
	const args = ast.slice(1);
	switch (ast[0]) {
			// Operators
		case 'and':
			return and(args, compilationOptions);
			break;
		case 'or':
			return or(args, compilationOptions);
			break;
		case 'compare':
			return compare(args, compilationOptions);
			break;
		case 'unaryPlus':
			return unaryPlus(args, compilationOptions);
			break;
		case 'unaryMinus':
			return unaryMinus(args, compilationOptions);
			break;
		case 'binaryOperator':
			return binaryOperator(args, compilationOptions);
			break;
		case 'sequence':
			return sequence(args, compilationOptions);
			break;
		case 'union':
			return union(args, compilationOptions);
			break;
		case 'intersectExcept':
			return intersectExcept(args, compilationOptions);
			break;

			// Tests
		case 'nameTest':
			return nameTest(args, compilationOptions);
			break;
		case 'kindTest':
			return kindTest(args, compilationOptions);
			break;
		case 'typeTest':
			return typeTest(args, compilationOptions);
			break;

			// Axes
		case 'ancestor':
			return ancestor(args, compilationOptions);
			break;
		case 'ancestor-or-self':
			return ancestorOrSelf(args, compilationOptions);
			break;
		case 'attribute':
			return attribute(args, compilationOptions);
			break;
		case 'child':
			return child(args, compilationOptions);
			break;
		case 'descendant':
			return descendant(args, compilationOptions);
			break;
		case 'descendant-or-self':
			return descendantOrSelf(args, compilationOptions);
			break;
		case 'parent':
			return parent(args, compilationOptions);
			break;
		case 'following-sibling':
			return followingSibling(args, compilationOptions);
			break;
		case 'preceding-sibling':
			return precedingSibling(args, compilationOptions);
			break;
		case 'following':
			return following(args, compilationOptions);
			break;
		case 'preceding':
			return preceding(args, compilationOptions);
			break;
		case 'self':
			return self(args, compilationOptions);
			break;

			// Path
		case 'absolutePath':
			return absolutePath(args, compilationOptions);
			break;
		case 'path':
			return path(args, compilationOptions);
			break;

			// Postfix operators
		case 'filter':
			return filter(args, compilationOptions);
			break;

			// Functions
		case 'functionCall':
			return functionCall(args, compilationOptions);
			break;
		case 'inlineFunction':
			return inlineFunction(args, compilationOptions);
			break;

		case 'literal':
			return literal(args, compilationOptions);
			break;

			// Variables
		case 'let':
			return letExpression(args, compilationOptions);
			break;
		case 'varRef':
			return varRef(args, compilationOptions);
			break;
		case 'namedFunctionRef':
			return namedFunctionRef(args, compilationOptions);
			break;
		case 'forExpression':
			return forExpression(args, compilationOptions);
			break;

			// Quantified
		case 'quantified':
			return quantified(args, compilationOptions);
			break;

			// Conditional
		case 'conditional':
			return conditional(args, compilationOptions);
			break;

		case 'instance of':
			return instanceOf(args, compilationOptions);
			break;
		case 'cast as':
			return castAs(args, compilationOptions);
			break;
		case 'castable as':
			return castableAs(args, compilationOptions);
			break;

		case 'simpleMap':
			return simpleMap(args, compilationOptions);
			break;

		case 'mapConstructor':
			return mapConstructor(args, compilationOptions);
			break;

		case 'arrayConstructor':
			return arrayConstructor(args, compilationOptions);
			break;

			// XQuery element constructors
		case 'DirElementConstructor':
			return dirElementConstructor(args, compilationOptions);
			break;

		case 'DirCommentConstructor':
			return dirCommentConstructor(args, compilationOptions);
			break;

		case 'DirPIConstructor':
			return dirPIConstructor(args, compilationOptions);
			break;

		default:
			throw new Error('No selector counterpart for: ' + ast[0] + '.');
	}
}

function arrayConstructor (args, compilationOptions) {
	return new ArrayConstructor(args[0], args.slice(1).map(arg => compile(arg, compilationOptions)));
}

function mapConstructor (args, compilationOptions) {
	return new MapConstructor(args.map(function (keyValuePair) {
		return {
			key: compile(keyValuePair[0], compilationOptions),
			value: compile(keyValuePair[1], compilationOptions)
		};
	}));
}

function absolutePath (args, compilationOptions) {
	return new AbsolutePathExpression(compile(args[0], compilationOptions));
}

function ancestor (args, compilationOptions) {
	return new AncestorAxis(/** @type {!TestAbstractExpression} */(compile(args[0], compilationOptions)));
}

function ancestorOrSelf (args, compilationOptions) {
	const subExpression = /** @type {!TestAbstractExpression} */(compile(args[0], compilationOptions));
	return new AncestorAxis(subExpression, { inclusive: true });
}

function and (args, compilationOptions) {
	return new AndOperator(args.map(arg => compile(arg, compilationOptions)));
}

function attribute (args, compilationOptions) {
	return new AttributeAxis(/** @type {!TestAbstractExpression} */(compile(args[0], compilationOptions)));
}

function binaryOperator (args, compilationOptions) {
	const kind = args[0];
	const a = compile(args[1], compilationOptions);
	const b = compile(args[2], compilationOptions);

	return new BinaryOperator(kind, a, b);
}

function child (args, compilationOptions) {
	return new ChildAxis(/** @type {!TestAbstractExpression} */(compile(args[0], compilationOptions)));
}

function descendant (args, compilationOptions) {
	return new DescendantAxis(/** @type {!TestAbstractExpression} */(compile(args[0], compilationOptions)));
}

function descendantOrSelf (args, compilationOptions) {
	const subExpression = /** @type {!TestAbstractExpression} */(compile(args[0], compilationOptions));
	return new DescendantAxis(subExpression, { inclusive: true });
}

function castAs (args, compilationOptions) {
	const expression = compile(args[0], compilationOptions);
	const [[prefix, namespaceURI, name], multiplicity] = args[1];

	return new CastAsOperator(expression, { prefix, namespaceURI, name }, multiplicity);
}

function castableAs (args, compilationOptions) {
	const expression = compile(args[0], compilationOptions);
	const [[prefix, namespaceURI, name], multiplicity] = args[1];

	return new CastableAsOperator(expression, { prefix, namespaceURI, name }, multiplicity);
}

// Binary compare (=, !=, le, is, <<, >>, etc)
function compare (args, compilationOptions) {
	return new Compare(args[0], compile(args[1], compilationOptions), compile(args[2], compilationOptions));
}

function conditional (args, compilationOptions) {
	return new IfExpression(compile(args[0], compilationOptions), compile(args[1], compilationOptions), compile(args[2], compilationOptions));
}

function filter (args, compilationOptions) {
	return new Filter(compile(args[0], compilationOptions), compile(args[1], compilationOptions));
}

function followingSibling (args, compilationOptions) {
	return new FollowingSiblingAxis(/** @type {!TestAbstractExpression} */(compile(args[0], compilationOptions)));
}

function following (args, compilationOptions) {
	return new FollowingAxis(/** @type {!TestAbstractExpression} */(compile(args[0], compilationOptions)));
}

function forExpression ([[prefix, namespaceURI, name], expression, returnExpression], compilationOptions) {
	return new ForExpression(
		{
			varName: { prefix, namespaceURI, name },
			expression: compile(expression, compilationOptions)
		},
		compile(returnExpression, compilationOptions));
}

function functionCall (args, compilationOptions) {
	return new FunctionCall(compile(args[0], compilationOptions), args[1].map(arg => arg === 'argumentPlaceholder' ? null : compile(arg, compilationOptions)));
}

function inlineFunction (args, compilationOptions) {
	const [params, returnType, body] = args;
	return new InlineFunction(
		params.map(([[prefix, namespaceURI, name], type]) => ([{ prefix, namespaceURI, name }, type])),
		returnType,
		compile(body, compilationOptions));
}

function instanceOf (args, compilationOptions) {
	const expression = compile(args[0], compilationOptions);
	const sequenceType = args[1];

	return new InstanceOfOperator(expression, compile(sequenceType[0], compilationOptions), sequenceType[1] || '');
}

function letExpression (args, compilationOptions) {
	const [prefix, namespaceURI, name] = args[0];
	const bindingSequence = compile(args[1], compilationOptions);
	const returnExpression = compile(args[2], compilationOptions);

	return new LetExpression({ prefix, namespaceURI, name }, bindingSequence, returnExpression);
}

function literal ([value, type], compilationOptions) {
	if (type === 'xs:string' && compilationOptions.allowXQuery) {
		value = parseCharacterReferences(value);
	}
	return new Literal(value, type);
}

function namedFunctionRef (args, _compilationOptions) {
	const [[prefix, namespaceURI, localName], arity] = args;
	return new NamedFunctionRef({ prefix, namespaceURI, localName }, arity);
}

function nameTest (args, _compilationOptions) {
	const [prefix, namespaceURI, localName] = args[0];
	return new NameTest(prefix, namespaceURI, localName);
}

function kindTest (args, _compilationOptions) {
	switch (args[0]) {
		case 'item()':
			return new UniversalExpression();
		case 'node()':
			return new TypeTest(null, null, 'node()');
		case 'element()':
			if (args.length === 2) {
				return new NameTest(args[1][0], args[1][1], args[1][2], { kind: 1 });
			}

			if (args.length > 2) {
				throw new Error('element() with more than 1 argument is not supported.');
			}

			return new KindTest(1);
		case 'text()':
			return new KindTest(3);
		case 'processing-instruction()':
			if (args.length > 1) {
				return new PITest(args[1]);
			}
			return new KindTest(7);
		case 'comment()':
			return new KindTest(8);
		case 'document-node()':
			return new KindTest(9);
		case 'attribute()':
			if (args.length === 2) {
				return new NameTest(args[1][0], args[1][1], args[1][2], { kind: 2 });
			}

			if (args.length > 2) {
				throw new Error('attribute() with more than 1 argument is not supported.');
			}

			return new KindTest(2);
		default:
			throw new Error('Unrecognized nodeType: ' + args[0]);
	}
}

function or (args, compilationOptions) {
	return new OrOperator(args.map(arg => compile(arg, compilationOptions)));
}

function parent (args, compilationOptions) {
	return new ParentAxis(/** @type {!TestAbstractExpression} */(compile(args[0], compilationOptions)));
}

function path (args, compilationOptions) {
	return new PathExpression(args.map(arg => compile(arg, compilationOptions)));
}

function precedingSibling (args, compilationOptions) {
	return new PrecedingSiblingAxis(/** @type {!TestAbstractExpression} */(compile(args[0], compilationOptions)));
}

function preceding (args, compilationOptions) {
	return new PrecedingAxis(/** @type {!TestAbstractExpression} */(compile(args[0], compilationOptions)));
}

function quantified (args, compilationOptions) {
	const inClauseExpressions = args[1].map(([_name, expression]) => {
		return compile(expression, compilationOptions);
	});
	const inClauseNames = args[1].map(([[namespaceURI, prefix, name], _expression]) => {
		return {
			namespaceURI, prefix, name
		};
	});
	return new QuantifiedExpression(args[0], inClauseNames, inClauseExpressions, compile(args[2], compilationOptions));
}

function self (args, compilationOptions) {
	return new SelfExpression(/** @type {!TestAbstractExpression} */(compile(args[0], compilationOptions)));
}

function sequence (args, compilationOptions) {
	return new SequenceOperator(args.map(arg => compile(arg, compilationOptions)));
}

function simpleMap (args, compilationOptions) {
	return new SimpleMapOperator(compile(args[0], compilationOptions), compile(args[1], compilationOptions));
}

function typeTest (args, _compilationOptions) {
	const [prefix, namespaceURI, name] = args[0];
	return new TypeTest(prefix, namespaceURI, name);
}

function unaryPlus (args, compilationOptions) {
	return new Unary('+', compile(args[0], compilationOptions));
}

function unaryMinus (args, compilationOptions) {
	return new Unary('-', compile(args[0], compilationOptions));
}

function union (args, compilationOptions) {
	return new Union(args.map(arg => compile(arg, compilationOptions)));
}

function intersectExcept (args, compilationOptions) {
	return new IntersectExcept(args[0], compile(args[1], compilationOptions), compile(args[2], compilationOptions));
}

function varRef (args, _compilationOptions) {
	const [prefix, namespaceURI, name] = args[0];
	return new VarRef(prefix, namespaceURI, name);
}

function isTextNodeOrCDataSection (item) {
	return item !== undefined && ((typeof item === 'string') || (item[0] === 'CDataSection'));
}

// XQuery Node constructors
function dirElementConstructor (args, compilationOptions) {
	if (!compilationOptions.allowXQuery) {
		throw new Error('XPST0003: Use of XQuery functionality is not allowed in XPath context');
	}
	const openingQName = args[0];
	const closingQName = args[1];
	/**
	 * @type {!Array<string|!Array>}
	 */
	const attList = args[2];
	/**
	 * @type {!Array<string|!Array>}
	 */
	const contents = args[3];

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

					if (!isTextNodeOrCDataSection(contents[i - 1]) && !isTextNodeOrCDataSection(contents[i+1])) {
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

function dirCommentConstructor (args, _compilationOptions) {
	return new DirCommentConstructor(args[0]);
}

function dirPIConstructor (args, _compilationOptions) {
	return new DirPIConstructor(args[0], args[1]);
}

/**
 * @param   {!Array<?>}  xPathAst
 * @return  {!Expression}
 */
export default function parseExpressionAsync (xPathAst, compilationOptions) {
    return compile(xPathAst, compilationOptions);
}
