import {
	complete,
	delimited,
	followed,
	map,
	not,
	okWithValue,
	optional,
	or,
	Parser,
	ParseResult,
	peek,
	plus,
	preceded,
	star,
	then,
} from 'prsc';
import { Location } from '../expressions/debug/StackTraceGenerator';
import { IAST } from './astHelper';
import {
	anyKindTest,
	aposAttrValueContentChar,
	argumentPlaceholder,
	assertAdjacentOpeningTerminal,
	boundarySpaceDecl,
	cdataSection,
	charRef,
	commentTest,
	compatibilityAnnotation,
	constructionDecl,
	contextItemExpr,
	copyNamespacesDecl,
	decimalFormatPropertyName,
	dirCommentConstructor,
	dirPiConstructor,
	elementContentChar,
	emptyOrderDecl,
	escapeApos,
	escapeQuot,
	forwardAxis,
	generalCompare,
	integerLiteral,
	locationPathAbbreviation,
	namespaceNodeTest,
	nodeCompare,
	numericLiteral,
	occurrenceIndicator,
	orderingModeDecl,
	pragmaContents,
	predefinedEntityRef,
	QNameAST,
	quotAttrValueContentChar,
	reservedFunctionNames,
	reverseAxis,
	separator,
	textTest,
	validationMode,
	valueCompare,
} from './literalParser';
import {
	bracedURILiteral,
	elementName,
	elementNameOrWildCard,
	eqName,
	ncName,
	prefix,
	qName,
	varName,
	varRef,
} from './nameParser';
import {
	alias,
	cached,
	precededMultiple,
	regex,
	surrounded,
	then3,
	then4,
	then5,
	wrapArray,
} from './parsingFunctions';
import {
	accumulateDirContents,
	assertEqualQNames,
	isAttributeTest,
	parseCharacterReferences,
	wrapInSequenceExprIfNeeded,
} from './parsingUtils';
import * as tokens from './tokens';
import { atomicOrUnionType, singleType, typeName } from './typesParser';
import {
	explicitWhitespace,
	whitespace,
	whitespaceCache,
	whitespacePlus,
	whitespacePlusCache,
} from './whitespaceParser';

const pathExprCache = new Map<number, ParseResult<IAST>>();

function generateParser(options: { outputDebugInfo: boolean; xquery: boolean }): Parser<IAST> {
	function defaultBinaryOperatorFn(lhs: IAST, rhs: [string, IAST][]): IAST {
		return rhs.reduce((lh, rh) => [rh[0], ['firstOperand', lh], ['secondOperand', rh[1]]], lhs);
	}

	function binaryOperator<T, S>(
		exp: Parser<T>,
		operator: Parser<string>,
		constructionFn: (lhs: T, rhs: [string, T][]) => S
	): Parser<S> {
		return then(
			exp,
			star(then(surrounded(operator, whitespace), exp, (a, b) => [a, b])),
			constructionFn
		);
	}

	function nonRepeatableBinaryOperator(
		exp: Parser<IAST>,
		operator: Parser<string>,
		firstArgName: string = 'firstOperand',
		secondArgName: string = 'secondOperand'
	): Parser<IAST> {
		return then(
			exp,
			optional(then(surrounded(operator, whitespace), exp, (a, b) => [a, b])),
			(lhs: IAST, rhs: [string, IAST] | null) => {
				if (rhs === null) {
					return lhs;
				}
				return [rhs[0], [firstArgName, lhs], [secondArgName, rhs[1]]];
			}
		);
	}

	const stackTraceMap = new Map<number, Location>();

	function wrapInStackTrace(parser: Parser<IAST>): Parser<IAST> {
		if (!options.outputDebugInfo) {
			return parser;
		}

		return (input: string, offset: number): ParseResult<IAST> => {
			const result = parser(input, offset);
			if (!result.success) {
				return result;
			}

			const start = stackTraceMap.has(offset)
				? stackTraceMap.get(offset)
				: {
						offset,
						line: -1,
						column: -1,
				  };

			const end = stackTraceMap.has(result.offset)
				? stackTraceMap.get(result.offset)
				: {
						offset: result.offset,
						line: -1,
						column: -1,
				  };

			stackTraceMap.set(offset, start);
			stackTraceMap.set(result.offset, end);

			return okWithValue(result.offset, [
				'x:stackTrace',
				{
					start,
					end,
				},
				result.value,
			] as unknown as IAST);
		};
	}

	const predicate: Parser<IAST> = preceded(
		tokens.BRACKET_OPEN,
		followed(surrounded(expr, whitespace), tokens.BRACKET_CLOSE)
	);

	const stringLiteral: Parser<string> = map(
		options.xquery
			? or([
					surrounded(
						star(or([predefinedEntityRef, charRef, escapeQuot, regex(/[^\"&]/)])),
						tokens.DOUBLE_QUOTE
					),
					surrounded(
						star(or([predefinedEntityRef, charRef, escapeApos, regex(/[^'&]/)])),
						tokens.SINGLE_QUOTE
					),
			  ])
			: or([
					surrounded(star(or([escapeQuot, regex(/[^\"]/)])), tokens.DOUBLE_QUOTE),
					surrounded(star(or([escapeApos, regex(/[^']/)])), tokens.SINGLE_QUOTE),
			  ]),
		(x) => x.join('')
	);

	const elementTest: Parser<IAST> = or([
		map(
			precededMultiple(
				[tokens.ELEMENT, whitespace],
				delimited(
					followed(tokens.BRACE_OPEN, whitespace),
					then(
						elementNameOrWildCard,
						precededMultiple([whitespace, tokens.COMMA, whitespace], typeName),
						(elemName, type) =>
							[
								['elementName', elemName],
								['typeName', ...type],
							] as [IAST, IAST]
					),
					preceded(whitespace, tokens.BRACE_CLOSE)
				)
			),
			([nameOrWildcard, type]) => ['elementTest', nameOrWildcard, type] as IAST
		),
		map(
			precededMultiple(
				[tokens.ELEMENT, whitespace],
				delimited(tokens.BRACE_OPEN, elementNameOrWildCard, tokens.BRACE_CLOSE)
			),
			(nameOrWildcard) => ['elementTest', ['elementName', nameOrWildcard]] as IAST
		),
		map(
			precededMultiple(
				[tokens.ELEMENT, whitespace],
				delimited(tokens.BRACE_OPEN, whitespace, tokens.BRACE_CLOSE)
			),
			(_) => ['elementTest']
		),
	]);

	const attribNameOrWildCard: Parser<IAST> = or([
		map(elementName, (qname) => ['QName', ...qname] as IAST),
		map(tokens.ASTERIX, (_) => ['star']),
	]);

	const attributeTest: Parser<IAST> = or([
		map(
			precededMultiple(
				[tokens.ATTRIBUTE, whitespace],
				delimited(
					followed(tokens.BRACE_OPEN, whitespace),
					then(
						attribNameOrWildCard,
						precededMultiple([whitespace, tokens.COMMA, whitespace], typeName),
						(attrName, type) =>
							[
								['attributeName', attrName],
								['typeName', ...type],
							] as [IAST, IAST]
					),
					preceded(whitespace, tokens.BRACE_CLOSE)
				)
			),
			([nameOrWildcard, type]) => ['attributeTest', nameOrWildcard, type] as IAST
		),
		map(
			precededMultiple(
				[tokens.ATTRIBUTE, whitespace],
				delimited(tokens.BRACE_OPEN, attribNameOrWildCard, tokens.BRACE_CLOSE)
			),
			(nameOrWildcard) => ['attributeTest', ['attributeName', nameOrWildcard]] as IAST
		),
		map(
			precededMultiple(
				[tokens.ATTRIBUTE, whitespace],
				delimited(tokens.BRACE_OPEN, whitespace, tokens.BRACE_CLOSE)
			),
			(_) => ['attributeTest']
		),
	]);

	const elementDeclaration: Parser<QNameAST> = elementName;

	const schemaElementTest: Parser<IAST> = map(
		precededMultiple(
			[tokens.SCHEMA_ELEMENT, whitespace, tokens.BRACE_OPEN],
			followed(elementDeclaration, tokens.BRACE_CLOSE)
		),
		(x) => ['schemaElementTest', ...x]
	);

	const attributeName = eqName;

	const attributeDeclaration = attributeName;

	const schemaAttributeTest: Parser<IAST> = map(
		delimited(
			tokens.SCHEMA_ATTRIBUTE_OPEN,
			surrounded(attributeDeclaration, whitespace),
			tokens.BRACE_CLOSE
		),
		(decl) => ['schemaAttributeTest', ...decl]
	);

	const documentTest: Parser<IAST> = map(
		preceded(
			tokens.DOCUMENT_NODE_OPEN,
			followed(
				surrounded(optional(or([elementTest, schemaElementTest])), whitespace),
				tokens.BRACE_CLOSE
			)
		),
		(x) => ['documentTest', ...(x ? [x] : [])]
	);

	const piTest: Parser<IAST> = or([
		map(
			preceded(
				tokens.PROCESSING_INSTRUCTION_OPEN,
				followed(surrounded(or([ncName, stringLiteral]), whitespace), tokens.BRACE_CLOSE)
			),
			(target) => ['piTest', ['piTarget', target]] as IAST
		),

		wrapArray(alias([tokens.PROCESSING_INSTRUCTION_TEST], 'piTest')),
	]);

	const kindTest: Parser<IAST> = or([
		documentTest,
		elementTest,
		attributeTest,
		schemaElementTest,
		schemaAttributeTest,
		piTest,
		commentTest,
		textTest,
		namespaceNodeTest,
		anyKindTest,
	]);

	const wildcard: Parser<IAST> = or([
		map(preceded(tokens.ASTERIX_COLON, ncName), (x) => [
			'Wildcard',
			['star'],
			['NCName', x],
		]) as Parser<IAST>,
		wrapArray(alias([tokens.ASTERIX], 'Wildcard')),
		map(followed(bracedURILiteral, tokens.ASTERIX), (x) => ['Wildcard', ['uri', x], ['star']]),
		map(followed(ncName, tokens.COLON_ASTERIX), (x) => [
			'Wildcard',
			['NCName', x],
			['star'],
		]) as Parser<IAST>,
	]);

	const nameTest: Parser<IAST> = or([wildcard, map(eqName, (x) => ['nameTest', ...x])]);

	const nodeTest: Parser<IAST> = or([kindTest, nameTest]);

	const abbrevForwardStep: Parser<IAST> = then(optional(tokens.AT_SIGN), nodeTest, (a, b) => {
		return a !== null || isAttributeTest(b)
			? ['stepExpr', ['xpathAxis', 'attribute'], b]
			: ['stepExpr', ['xpathAxis', 'child'], b];
	});

	const forwardStep: Parser<IAST> = or([
		then(forwardAxis, nodeTest, (axis, test) => ['stepExpr', ['xpathAxis', axis], test]),
		abbrevForwardStep,
	]);

	const abbrevReverseStep: Parser<IAST> = map(tokens.DOUBLE_DOT, (_) => [
		'stepExpr',
		['xpathAxis', 'parent'],
		['anyKindTest'],
	]);

	const reverseStep: Parser<IAST> = or([
		then(reverseAxis, nodeTest, (axis, test) => ['stepExpr', ['xpathAxis', axis], test]),
		abbrevReverseStep,
	]);

	const predicateList: Parser<IAST | undefined> = map(
		star(preceded(whitespace, predicate)),
		(x: IAST[]) => (x.length > 0 ? ['predicates', ...x] : undefined)
	);

	const axisStep: Parser<IAST> = then(
		or([reverseStep, forwardStep]),
		predicateList,
		(a: IAST, b: IAST | undefined) => (b === undefined ? a : (a.concat([b]) as IAST))
	);

	const literal: Parser<IAST> = or([
		numericLiteral,
		map(stringLiteral, (x) => [
			'stringConstantExpr',
			['value', options.xquery ? parseCharacterReferences(x) : x],
		]),
	]);

	const parenthesizedExpr: Parser<IAST> = or([
		delimited(tokens.BRACE_OPEN, surrounded(expr, whitespace), tokens.BRACE_CLOSE),
		map(delimited(tokens.BRACE_OPEN, whitespace, tokens.BRACE_CLOSE), (_) => ['sequenceExpr']),
	]);

	const argument: Parser<IAST> = or([exprSingle, argumentPlaceholder]);

	const argumentList: Parser<IAST[]> = map(
		delimited(
			tokens.BRACE_OPEN,
			surrounded(
				optional(
					then(
						argument,
						star(preceded(surrounded(tokens.COMMA, whitespace), argument)),
						(first, following) => [first, ...following]
					)
				),
				whitespace
			),
			tokens.BRACE_CLOSE
		),
		(x) => (x !== null ? x : [])
	);

	const functionCall: Parser<IAST> = preceded(
		not(
			then3(reservedFunctionNames, whitespace, tokens.BRACE_OPEN, (_a, _b, _c) => undefined),
			['cannot use reseved keyword for function names']
		),
		then(eqName, preceded(whitespace, argumentList), (functionName, args) => [
			'functionCallExpr',
			['functionName', ...functionName],
			args !== null ? ['arguments', ...args] : ['arguments'],
		])
	);

	const namedFunctionRef: Parser<IAST> = then(
		eqName,
		preceded(tokens.HASHTAG, integerLiteral),
		(functionName, integer) => ['namedFunctionRef', ['functionName', ...functionName], integer]
	);

	const enclosedExpr: Parser<IAST | null> = delimited(
		tokens.CURLY_BRACE_OPEN,
		surrounded(optional(expr), whitespace),
		tokens.CURLY_BRACE_CLOSE
	);

	const functionBody: Parser<IAST> = map(enclosedExpr, (x) => (x ? x : ['sequenceExpr']));

	const sequenceType: Parser<IAST[]> = or([
		map(tokens.EMPTY_SEQUENCE_TEST, (_) => [['voidSequenceType']]),
		then(
			itemTypeIndirect,
			optional(preceded(whitespace, occurrenceIndicator)),
			(type, occurrence) => [
				type,
				...(occurrence !== null ? ([['occurrenceIndicator', occurrence]] as IAST[]) : []),
			]
		),
	]);

	const annotation: Parser<IAST> = then(
		precededMultiple([tokens.PERCENT, whitespace], eqName),
		optional(
			followed(
				then(
					precededMultiple([tokens.BRACE_OPEN, whitespace], literal),
					star(precededMultiple([tokens.COMMA, whitespace], literal)),
					(lhs, rhs) => lhs.concat(rhs)
				),
				tokens.BRACE_CLOSE
			)
		),
		(annotationName, params) =>
			[
				'annotation',
				['annotationName', ...annotationName],
				...(params ? ['arguments', params] : []),
			] as IAST
	);

	const anyFunctionTest: Parser<IAST> = map(
		precededMultiple(
			[
				tokens.FUNCTION,
				whitespace,
				tokens.BRACE_OPEN,
				whitespace,
				tokens.ASTERIX,
				whitespace,
			],
			tokens.BRACE_CLOSE
		),
		(_) => ['anyFunctionTest']
	);

	const typedFunctionTest: Parser<IAST> = then(
		precededMultiple(
			[tokens.FUNCTION, whitespace, tokens.BRACE_OPEN, whitespace],
			optional(
				binaryOperator(sequenceType, tokens.COMMA, (lhs, rhs) =>
					lhs.concat.apply(
						lhs,
						rhs.map((x) => x[1])
					)
				)
			)
		),
		precededMultiple(
			[whitespace, tokens.BRACE_CLOSE, whitespacePlus, tokens.AS, whitespacePlus],
			sequenceType
		),
		(paramTypeList, returnType) => [
			'typedFunctionTest',
			['paramTypeList', ['sequenceType', ...(paramTypeList ? paramTypeList : [])]],
			['sequenceType', ...returnType],
		]
	);

	const functionTest: Parser<IAST> = then(
		star(annotation),
		or([anyFunctionTest, typedFunctionTest]),
		(annotations, test) => [test[0], ...annotations, ...test.slice(1)]
	);

	const anyMapTest: Parser<IAST> = map(
		precededMultiple(
			[tokens.MAP, whitespace, tokens.BRACE_OPEN, whitespace, tokens.ASTERIX, whitespace],
			tokens.BRACE_CLOSE
		),
		(_) => ['anyMapTest']
	);

	const typedMapTest: Parser<IAST> = then(
		precededMultiple(
			[tokens.MAP, whitespace, tokens.BRACE_OPEN, whitespace],
			atomicOrUnionType
		),
		precededMultiple(
			[whitespace, tokens.COMMA],
			followed(surrounded(sequenceType, whitespace), tokens.BRACE_CLOSE)
		),
		(keyType, valueType) => ['typedMapTest', keyType, ['sequenceType', ...valueType]]
	);

	const mapTest: Parser<IAST> = or([anyMapTest, typedMapTest]);

	const anyArrayTest: Parser<IAST> = map(
		precededMultiple(
			[tokens.ARRAY, whitespace, tokens.BRACE_OPEN, whitespace, tokens.ASTERIX, whitespace],
			tokens.BRACE_CLOSE
		),
		(_) => ['anyArrayTest']
	);

	const typedArrayTest: Parser<IAST> = map(
		precededMultiple(
			[tokens.ARRAY, whitespace, tokens.BRACE_OPEN],
			followed(surrounded(sequenceType, whitespace), tokens.BRACE_CLOSE)
		),
		(type) => ['typedArrayTest', ['sequenceType', ...type]]
	);

	const arrayTest: Parser<IAST> = or([anyArrayTest, typedArrayTest]);

	const parenthesizedItemType: Parser<IAST> = map(
		delimited(tokens.BRACE_OPEN, surrounded(itemTypeIndirect, whitespace), tokens.BRACE_CLOSE),
		(x) => ['parenthesizedItemType', x]
	);

	const itemType: Parser<IAST> = or([
		kindTest,
		wrapArray(alias([tokens.ITEM_TYPE_TEST], 'anyItemType')),
		functionTest,
		mapTest,
		arrayTest,
		atomicOrUnionType,
		parenthesizedItemType,
	]);

	function itemTypeIndirect(input: string, offset: number): ParseResult<IAST> {
		return itemType(input, offset);
	}

	const typeDeclaration: Parser<IAST> = map(
		precededMultiple([tokens.AS, whitespacePlus], sequenceType),
		(x) => ['typeDeclaration', ...x]
	);

	const param: Parser<IAST> = then(
		preceded(tokens.DOLLAR, eqName),
		optional(preceded(whitespacePlus, typeDeclaration)),
		(variableName, typeDecl) => [
			'param',
			['varName', ...variableName],
			...(typeDecl ? [typeDecl] : []),
		]
	);

	const paramList: Parser<IAST[]> = binaryOperator(param, tokens.COMMA, (lhs, rhs) => [
		lhs,
		...rhs.map((x) => x[1]),
	]);

	const inlineFunctionExpr: Parser<IAST> = then4(
		star(annotation),
		precededMultiple(
			[whitespace, tokens.FUNCTION, whitespace, tokens.BRACE_OPEN, whitespace],
			optional(paramList)
		),
		precededMultiple(
			[whitespace, tokens.BRACE_CLOSE, whitespace],
			optional(
				map(
					precededMultiple([tokens.AS, whitespace], followed(sequenceType, whitespace)),
					(x) => ['typeDeclaration', ...x]
				)
			)
		),
		functionBody,
		(annotations, params, typeDecl, body) =>
			[
				'inlineFunctionExpr',
				...annotations,
				['paramList', ...(params ? params : [])],
				...(typeDecl ? [typeDecl] : []),
				['functionBody', body],
			] as IAST
	);

	const functionItemExpr: Parser<IAST> = or([namedFunctionRef, inlineFunctionExpr]);

	const mapKeyExpr: Parser<IAST> = map(exprSingle, (x) => ['mapKeyExpr', x]);
	const mapValueExpr: Parser<IAST> = map(exprSingle, (x) => ['mapValueExpr', x]);

	const mapConstructorEntry: Parser<IAST> = then(
		mapKeyExpr,
		preceded(surrounded(tokens.COLON, whitespace), mapValueExpr),
		(k, v) => ['mapConstructorEntry', k, v]
	);

	const mapConstructor: Parser<IAST> = preceded(
		tokens.MAP,
		delimited(
			surrounded(tokens.CURLY_BRACE_OPEN, whitespace),
			map(
				optional(
					binaryOperator(
						mapConstructorEntry,
						surrounded(tokens.COMMA, whitespace),
						(lhs, rhs) => [lhs, ...rhs.map((x) => x[1])]
					)
				),
				(entries) => (entries ? ['mapConstructor', ...entries] : ['mapConstructor'])
			),
			preceded(whitespace, tokens.CURLY_BRACE_CLOSE)
		)
	);

	const squareArrayConstructor: Parser<IAST> = map(
		delimited(
			tokens.BRACKET_OPEN,
			surrounded(
				optional(
					binaryOperator(exprSingle, tokens.COMMA, (lhs, rhs) =>
						[lhs, ...rhs.map((x) => x[1])].map((x) => ['arrayElem', x])
					)
				),
				whitespace
			),
			tokens.BRACKET_CLOSE
		),
		(x) => ['squareArray', ...(x !== null ? x : [])] as IAST
	);

	const curlyArrayConstructor: Parser<IAST> = map(
		preceded(tokens.ARRAY, preceded(whitespace, enclosedExpr)),
		(x) => ['curlyArray', ...(x !== null ? [['arrayElem', x]] : [])] as IAST
	);

	const arrayConstructor: Parser<IAST> = map(
		or([squareArrayConstructor, curlyArrayConstructor]),
		(x) => ['arrayConstructor', x]
	);

	const keySpecifier: Parser<string | IAST> = or([
		ncName as Parser<string | IAST>,
		integerLiteral,
		parenthesizedExpr,
		tokens.ASTERIX,
	]);

	const unaryLookup: Parser<IAST> = map(
		preceded(tokens.QUESTION_MARK, preceded(whitespace, keySpecifier)),
		(x) => {
			return x === '*'
				? ['unaryLookup', ['star']]
				: typeof x === 'string'
				? ['unaryLookup', ['NCName', x]]
				: ['unaryLookup', x];
		}
	);

	const commonContent: Parser<IAST | string> = or([
		predefinedEntityRef,
		charRef,
		alias([tokens.CURLY_BRACE_OPEN_DOUBLE], '{') as Parser<IAST | string>,
		alias([tokens.CURLY_BRACE_CLOSE_DOUBLE], '}'),
		map(enclosedExpr, (x) => x || ['sequenceExpr']),
	]);

	const dirElemContent: Parser<IAST | string> = or([
		cdataSection,
		directConstructorIndirect,
		commonContent,
		elementContentChar,
	]);

	const quotAttrValueContent: Parser<IAST | string> = or([
		map(quotAttrValueContentChar, (x) => x.replace(/[\x20\x0D\x0A\x09]/g, ' ')) as Parser<
			IAST | string
		>,
		commonContent,
	]);

	const aposAttrValueContent: Parser<IAST | string> = or([
		map(aposAttrValueContentChar, (x) => x.replace(/[\x20\x0D\x0A\x09]/g, ' ')) as Parser<
			IAST | string
		>,
		commonContent,
	]);

	const dirAttributeValue: Parser<(IAST | string)[]> = map(
		or([
			surrounded(star(or([escapeQuot, quotAttrValueContent])), tokens.DOUBLE_QUOTE),
			surrounded(star(or([escapeApos, aposAttrValueContent])), tokens.SINGLE_QUOTE),
		]),
		(x: (IAST | string)[]) => accumulateDirContents(x, false, false)
	);

	const attribute: Parser<IAST> = then(
		qName,
		preceded(surrounded(tokens.EQUALS, optional(explicitWhitespace)), dirAttributeValue),
		(attrName, value) => {
			if (attrName[0].prefix === '' && attrName[1] === 'xmlns') {
				if (value.length && typeof value[0] !== 'string') {
					throw new Error(
						'XQST0022: A namespace declaration may not contain enclosed expressions'
					);
				}
				return ['namespaceDeclaration', value.length ? ['uri', value[0]] : ['uri']];
			}
			if (attrName[0].prefix === 'xmlns') {
				if (value.length && typeof value[0] !== 'string') {
					throw new Error(
						"XQST0022: The namespace declaration for 'xmlns:" +
							attrName[1] +
							"' may not contain enclosed expressions"
					);
				}
				return [
					'namespaceDeclaration',
					['prefix', attrName[1]],
					value.length ? ['uri', value[0]] : ['uri'],
				] as IAST;
			}
			return [
				'attributeConstructor',
				['attributeName'].concat(attrName as string[]),
				value.length === 0
					? ['attributeValue']
					: value.length === 1 && typeof value[0] === 'string'
					? ['attributeValue', value[0]]
					: (['attributeValueExpr'] as IAST).concat(value),
			] as IAST;
		}
	);

	const dirAttributeList: Parser<IAST[]> = map(
		star(preceded(explicitWhitespace, optional(attribute))),
		(x) => x.filter(Boolean)
	);

	const dirElemConstructor: Parser<IAST> = then3(
		preceded(tokens.LESS_THAN, qName),
		dirAttributeList,
		or([
			map(tokens.DIR_ELEM_CLOSE, (_) => null),
			then(
				preceded(tokens.GREATER_THAN, star(dirElemContent)),
				precededMultiple(
					[whitespace, tokens.DIR_ELEM_OPEN_CONTENT],
					followed(
						qName,
						then(optional(explicitWhitespace), tokens.GREATER_THAN, (_) => null)
					)
				),
				(contents, endName) => {
					return [accumulateDirContents(contents, true, true), endName];
				}
			),
		]),
		(tagName, attList, contentsEndName) => {
			let contents = contentsEndName;
			if (contentsEndName && contentsEndName.length) {
				assertEqualQNames(tagName, contentsEndName[1]);
				contents = contentsEndName[0];
			}
			return [
				'elementConstructor',
				['tagName', ...tagName],
				...(attList.length ? [['attributeList', ...attList]] : []),
				...(contents && contents.length ? [['elementContent', ...contents]] : []),
			] as IAST;
		}
	);

	const directConstructor: Parser<IAST> = or([
		dirElemConstructor,
		dirCommentConstructor,
		dirPiConstructor,
	]);

	function directConstructorIndirect(input: string, offset: number): ParseResult<IAST> {
		return directConstructor(input, offset);
	}

	const compDocConstructor: Parser<IAST> = map(
		precededMultiple([tokens.DOCUMENT, whitespace], enclosedExpr),
		(x) => ['computedDocumentConstructor', ...(x ? [['argExpr', x]] : [])] as IAST
	);

	const enclosedContentExpr: Parser<IAST[]> = map(enclosedExpr, (x) =>
		x ? [['contentExpr', x]] : []
	);

	const compElemConstructor: Parser<IAST> = then(
		precededMultiple(
			[tokens.ELEMENT, whitespace],
			or([
				map(eqName, (x) => ['tagName', ...x] as IAST),
				map(
					delimited(
						tokens.CURLY_BRACE_OPEN,
						surrounded(expr, whitespace),
						tokens.CURLY_BRACE_CLOSE
					),
					(x) => ['tagNameExpr', x] as IAST
				),
			])
		),
		preceded(whitespace, enclosedContentExpr),
		(tagName, content) => ['computedElementConstructor', tagName, ...content] as IAST
	);

	const compAttrConstructor: Parser<IAST> = then(
		preceded(
			tokens.ATTRIBUTE,
			or([
				map(
					precededMultiple([assertAdjacentOpeningTerminal, whitespace], eqName),
					(x) => ['tagName', ...x] as IAST
				),
				map(
					preceded(
						whitespace,
						delimited(
							tokens.CURLY_BRACE_OPEN,
							surrounded(expr, whitespace),
							tokens.CURLY_BRACE_CLOSE
						)
					),
					(x) => ['tagNameExpr', x] as IAST
				),
			])
		),
		preceded(whitespace, enclosedExpr),
		(constructorName, valExpr) =>
			[
				'computedAttributeConstructor',
				constructorName,
				['valueExpr', valExpr ? valExpr : ['sequenceExpr']],
			] as IAST
	);

	const enclosedPrefixExpr: Parser<IAST[]> = map(enclosedExpr, (x) =>
		x ? [['prefixExpr', x]] : []
	);

	const enclosedUriExpr: Parser<IAST[]> = map(enclosedExpr, (x) => (x ? [['URIExpr', x]] : []));

	const compNamespaceConstructor: Parser<IAST> = then(
		precededMultiple(
			[tokens.NAMESPACE, whitespace],
			or([prefix as Parser<IAST[] | IAST>, enclosedPrefixExpr])
		),
		preceded(whitespace, enclosedUriExpr),
		(prefixPart, uri) => ['computedNamespaceConstructor', ...prefixPart, ...uri]
	);

	const compTextConstructor: Parser<IAST> = map(
		precededMultiple([tokens.TEXT, whitespace], enclosedExpr),
		(x) => ['computedTextConstructor', ...(x ? [['argExpr', x]] : [])] as IAST
	);

	const compCommentConstructor: Parser<IAST> = map(
		precededMultiple([tokens.COMMENT, whitespace], enclosedExpr),
		(x) => ['computedCommentConstructor', ...(x ? [['argExpr', x]] : [])] as IAST
	);

	const compPiConstructor: Parser<IAST> = precededMultiple(
		[tokens.PROCESSING_INSTRUCTION, whitespace],
		then(
			or([
				map(ncName, (x) => ['piTarget', x]),
				map(
					delimited(
						tokens.CURLY_BRACE_OPEN,
						surrounded(expr, whitespace),
						tokens.CURLY_BRACE_CLOSE
					),
					(x) => ['piTargetExpr', x]
				),
			]),
			preceded(whitespace, enclosedExpr),
			(target, value) =>
				[
					'computedPIConstructor',
					target,
					...(value ? [['piValueExpr', value]] : []),
				] as IAST
		)
	);

	const computedConstructor: Parser<IAST> = or([
		compDocConstructor,
		compElemConstructor,
		compAttrConstructor,
		compNamespaceConstructor,
		compTextConstructor,
		compCommentConstructor,
		compPiConstructor,
	]);

	const nodeConstructor: Parser<IAST> = or([directConstructor, computedConstructor]);

	const primaryExpr: Parser<IAST> = or([
		literal,
		varRef,
		parenthesizedExpr,
		contextItemExpr,
		functionCall,
		// orderedExpr,
		// unorderedExpr,
		nodeConstructor,
		functionItemExpr,
		mapConstructor,
		arrayConstructor,
		// stringConstructor,
		unaryLookup,
	]);

	const lookup: Parser<IAST> = map(
		precededMultiple([tokens.QUESTION_MARK, whitespace], keySpecifier),
		(x) =>
			x === '*'
				? ['lookup', ['star']]
				: typeof x === 'string'
				? ['lookup', ['NCName', x]]
				: ['lookup', x]
	);

	const postfixExprWithStep: Parser<IAST> = then(
		map(primaryExpr, (x) => wrapInSequenceExprIfNeeded(x)),
		star(
			or([
				map(preceded(whitespace, predicate), (x) => ['predicate', x] as IAST),
				map(preceded(whitespace, argumentList), (x) => ['argumentList', x] as IAST),
				preceded(whitespace, lookup),
			])
		),
		(expression: IAST, postfixExpr: IAST[]) => {
			let toWrap: IAST | IAST[] = expression;

			const predicates: IAST[] = [];
			const filters: IAST[] = [];

			let allowSinglePredicate = false;

			function flushPredicates() {
				if (allowSinglePredicate && predicates.length === 1) {
					filters.push(['predicate', predicates[0]]);
				} else if (predicates.length !== 0) {
					filters.push(['predicates', ...predicates]);
				}
				predicates.length = 0;
			}

			function flushFilters(ensureFilter: boolean) {
				flushPredicates();
				if (filters.length !== 0) {
					if (toWrap[0] === 'sequenceExpr' && toWrap.length > 2) {
						toWrap = ['sequenceExpr', toWrap as IAST];
					}
					toWrap = [['filterExpr', toWrap as IAST], ...filters];
					filters.length = 0;
				} else if (ensureFilter) {
					toWrap = [['filterExpr', toWrap as IAST]];
				} else {
					toWrap = [toWrap as IAST];
				}
			}

			for (const postFix of postfixExpr) {
				switch (postFix[0]) {
					case 'predicate':
						predicates.push(postFix[1] as IAST);
						break;
					case 'lookup':
						allowSinglePredicate = true;
						flushPredicates();
						filters.push(postFix);
						break;
					case 'argumentList':
						flushFilters(false);
						if (toWrap.length > 1) {
							toWrap = [['sequenceExpr', ['pathExpr', ['stepExpr', ...toWrap]]]];
						}
						toWrap = [
							'dynamicFunctionInvocationExpr',
							['functionItem', ...toWrap],
							...((postFix[1] as IAST).length
								? [['arguments', ...(postFix[1] as IAST)]]
								: []),
						] as IAST;
						break;
					default:
						throw new Error('unreachable');
				}
			}

			flushFilters(true);

			return toWrap;
		}
	);

	const stepExprWithForcedStep: Parser<IAST> = or([
		map(postfixExprWithStep, (x) => ['stepExpr', ...x]),
		axisStep,
	]);

	const postfixExprWithoutStep: Parser<IAST> = followed(
		primaryExpr,
		peek(
			not(preceded(whitespace, or([predicate, argumentList as Parser<IAST>, lookup])), [
				'primary expression not followed by predicate, argumentList, or lookup',
			])
		)
	);

	const stepExprWithoutStep: Parser<IAST> = postfixExprWithoutStep;

	const relativePathExpr: Parser<IAST> = or([
		then3(
			stepExprWithForcedStep,
			preceded(whitespace, locationPathAbbreviation),
			preceded(whitespace, relativePathExprWithForcedStepIndirect),
			(lhs, abbrev, rhs) => ['pathExpr', lhs, abbrev, ...rhs]
		),
		then(
			stepExprWithForcedStep,
			preceded(surrounded(tokens.SLASH, whitespace), relativePathExprWithForcedStepIndirect),
			(lhs, rhs) => ['pathExpr', lhs, ...rhs]
		),
		stepExprWithoutStep,
		map(stepExprWithForcedStep, (x) => ['pathExpr', x]),
	]);

	const relativePathExprWithForcedStep: Parser<IAST[]> = or([
		then3(
			stepExprWithForcedStep,
			preceded(whitespace, locationPathAbbreviation),
			preceded(whitespace, relativePathExprWithForcedStepIndirect),
			(lhs, abbrev, rhs) => [lhs, abbrev, ...rhs]
		),
		then(
			stepExprWithForcedStep,
			preceded(surrounded(tokens.SLASH, whitespace), relativePathExprWithForcedStepIndirect),
			(lhs, rhs) => [lhs, ...rhs]
		),
		map(stepExprWithForcedStep, (x) => [x]),
	]);

	function relativePathExprWithForcedStepIndirect(
		input: string,
		offset: number
	): ParseResult<IAST[]> {
		return relativePathExprWithForcedStep(input, offset);
	}

	const absoluteLocationPath: Parser<IAST> = or([
		map(precededMultiple([tokens.SLASH, whitespace], relativePathExprWithForcedStep), (x) => [
			'pathExpr',
			['rootExpr'],
			...x,
		]),
		then(
			locationPathAbbreviation,
			preceded(whitespace, relativePathExprWithForcedStep),
			(abbrev, path) => ['pathExpr', ['rootExpr'], abbrev, ...path]
		),
		map(
			followed(
				tokens.SLASH,
				not(
					preceded(whitespace, options.xquery ? regex(/[*<a-zA-Z]/) : regex(/[*a-zA-Z]/)),
					[
						'Single rootExpr cannot be by followed by something that can be interpreted as a relative path',
					]
				)
			),
			(_) => ['pathExpr', ['rootExpr']] as IAST
		),
	]);

	const pathExpr: Parser<IAST> = cached(
		or([relativePathExpr, absoluteLocationPath]),
		pathExprCache
	);

	const validateExpr: Parser<IAST> = preceded(
		tokens.VALIDATE,
		then(
			optional(
				or([
					map(preceded(whitespace, validationMode), (mode) => ['validationMode', mode]),
					map(precededMultiple([whitespace, tokens.TYPE, whitespace], typeName), (t) => [
						'type',
						...t,
					]),
				])
			),
			delimited(
				preceded(whitespace, tokens.CURLY_BRACE_OPEN),
				surrounded(expr, whitespace),
				tokens.CURLY_BRACE_CLOSE
			),
			(modeOrType, argExpr) =>
				['validateExpr', ...(modeOrType ? [modeOrType] : []), ['argExpr', argExpr]] as IAST
		)
	);

	const pragma: Parser<IAST> = delimited(
		tokens.PRAGMA_START,
		then(
			preceded(whitespace, eqName),
			optional(preceded(whitespacePlus, pragmaContents)),
			(pragmaName, contents) =>
				(contents
					? ['pragma', ['pragmaName', pragmaName], ['pragmaContents', contents]]
					: ['pragma', ['pragmaName', pragmaName]]) as IAST
		),
		preceded(whitespace, tokens.PRAGMA_END)
	);

	const extensionExpr: Parser<IAST> = map(
		followed(
			plus(pragma),
			preceded(
				whitespace,
				delimited(
					tokens.CURLY_BRACE_OPEN,
					surrounded(optional(expr), whitespace),
					tokens.CURLY_BRACE_CLOSE
				)
			)
		),
		(extension) => ['extensionExpr', ...extension] as IAST
	);

	const simpleMapExpr: Parser<IAST> = wrapInStackTrace(
		binaryOperator(pathExpr, tokens.EXCLAMATION_MARK, (lhs: IAST, rhs: [string, IAST][]) => {
			if (rhs.length === 0) {
				return lhs;
			} else {
				return [
					'simpleMapExpr',
					lhs[0] === 'pathExpr'
						? lhs
						: [
								'pathExpr',
								['stepExpr', ['filterExpr', wrapInSequenceExprIfNeeded(lhs)]],
						  ],
				].concat(
					rhs.map((value) => {
						const item: IAST = value[1];
						return item[0] === 'pathExpr'
							? item
							: [
									'pathExpr',
									['stepExpr', ['filterExpr', wrapInSequenceExprIfNeeded(item)]],
							  ];
					})
				) as IAST;
			}
		})
	);

	const valueExpr: Parser<IAST> = or([validateExpr, extensionExpr, simpleMapExpr]);

	const unaryExpr: Parser<IAST> = or([
		then(
			or([alias([tokens.MINUS], 'unaryMinusOp'), alias([tokens.PLUS], 'unaryPlusOp')]),
			preceded(whitespace, unaryExprIndirect),
			(op, value) => [op, ['operand', value]]
		),
		valueExpr,
	]);

	function unaryExprIndirect(input: string, offset: number): ParseResult<IAST> {
		return unaryExpr(input, offset);
	}

	const arrowFunctionSpecifier: Parser<IAST> = or([
		map(eqName, (x) => ['EQName', ...x]),
		varRef,
		parenthesizedExpr,
	]);

	const arrowExpr: Parser<IAST> = then(
		unaryExpr,
		star(
			precededMultiple(
				[whitespace, tokens.ARROW, whitespace],
				then(
					arrowFunctionSpecifier,
					preceded(whitespace, argumentList),
					(specifier: IAST, argList: IAST[]) => [specifier, argList]
				)
			)
		),
		(argExpr, functionParts: [IAST, IAST[]][]) =>
			functionParts.reduce(
				(arg, part) => ['arrowExpr', ['argExpr', arg], part[0], ['arguments', ...part[1]]],
				argExpr
			)
	);
	const castExpr: Parser<IAST> = then(
		arrowExpr,
		optional(
			precededMultiple(
				[
					whitespace,
					tokens.CAST,
					whitespacePlus,
					tokens.AS,
					assertAdjacentOpeningTerminal,
					whitespace,
				],
				singleType
			)
		),
		(lhs, rhs) => (rhs !== null ? ['castExpr', ['argExpr', lhs], rhs] : lhs)
	);

	const castableExpr: Parser<IAST> = then(
		castExpr,
		optional(
			precededMultiple(
				[
					whitespace,
					tokens.CASTABLE,
					whitespacePlus,
					tokens.AS,
					assertAdjacentOpeningTerminal,
					whitespace,
				],
				singleType
			)
		),
		(lhs, rhs) => (rhs !== null ? ['castableExpr', ['argExpr', lhs], rhs] : lhs)
	);

	const treatExpr: Parser<IAST> = then(
		castableExpr,
		optional(
			precededMultiple(
				[
					whitespace,
					tokens.TREAT,
					whitespacePlus,
					tokens.AS,
					assertAdjacentOpeningTerminal,
					whitespace,
				],
				sequenceType
			)
		),
		(lhs, rhs) =>
			rhs !== null ? ['treatExpr', ['argExpr', lhs], ['sequenceType', ...rhs]] : lhs
	);

	const instanceofExpr: Parser<IAST> = then(
		treatExpr,
		optional(
			precededMultiple(
				[
					whitespace,
					tokens.INSTANCE,
					whitespacePlus,
					tokens.OF,
					assertAdjacentOpeningTerminal,
					whitespace,
				],
				sequenceType
			)
		),
		(lhs, rhs) =>
			rhs !== null ? ['instanceOfExpr', ['argExpr', lhs], ['sequenceType', ...rhs]] : lhs
	);

	const intersectExpr: Parser<IAST> = binaryOperator(
		instanceofExpr,
		followed(
			or([alias([tokens.INTERSECT], 'intersectOp'), alias([tokens.EXCEPT], 'exceptOp')]),
			assertAdjacentOpeningTerminal
		),
		defaultBinaryOperatorFn
	);

	const unionExpr: Parser<IAST> = binaryOperator(
		intersectExpr,
		or([
			alias([tokens.VERTICAL_BAR], 'unionOp'),
			followed(alias([tokens.UNION], 'unionOp'), assertAdjacentOpeningTerminal),
		]),
		defaultBinaryOperatorFn
	);

	const multiplicativeExpr: Parser<IAST> = binaryOperator(
		unionExpr,
		or([
			alias([tokens.ASTERIX], 'multiplyOp'),
			followed(alias([tokens.DIV], 'divOp'), assertAdjacentOpeningTerminal),
			followed(alias([tokens.IDIV], 'idivOp'), assertAdjacentOpeningTerminal),
			followed(alias([tokens.MOD], 'modOp'), assertAdjacentOpeningTerminal),
		]),
		defaultBinaryOperatorFn
	);

	const additiveExpr: Parser<IAST> = binaryOperator(
		multiplicativeExpr,
		or([alias([tokens.MINUS], 'subtractOp'), alias([tokens.PLUS], 'addOp')]),
		defaultBinaryOperatorFn
	);

	const rangeExpr: Parser<IAST> = nonRepeatableBinaryOperator(
		additiveExpr,
		followed(alias([tokens.TO], 'rangeSequenceExpr'), assertAdjacentOpeningTerminal),
		'startExpr',
		'endExpr'
	);

	const stringConcatExpr: Parser<IAST> = binaryOperator(
		rangeExpr,
		alias([tokens.VERTICAL_BAR_DOUBLE], 'stringConcatenateOp'),
		defaultBinaryOperatorFn
	);

	const comparisonExpr: Parser<IAST> = nonRepeatableBinaryOperator(
		stringConcatExpr,
		or([valueCompare, nodeCompare, generalCompare])
	);

	const andExpr: Parser<IAST> = binaryOperator(
		comparisonExpr,
		followed(alias([tokens.AND], 'andOp'), assertAdjacentOpeningTerminal),
		defaultBinaryOperatorFn
	);

	const orExpr: Parser<IAST> = binaryOperator(
		andExpr,
		followed(alias([tokens.OR], 'orOp'), assertAdjacentOpeningTerminal),
		defaultBinaryOperatorFn
	);

	const ifExpr: Parser<IAST> = then(
		then(
			precededMultiple([tokens.IF, whitespace, tokens.BRACE_OPEN, whitespace], expr),
			precededMultiple(
				[
					whitespace,
					tokens.BRACE_CLOSE,
					whitespace,
					tokens.THEN,
					assertAdjacentOpeningTerminal,
					whitespace,
				],
				exprSingle
			),
			(ifClause, thenClause) => [ifClause, thenClause]
		),
		precededMultiple(
			[whitespace, tokens.ELSE, assertAdjacentOpeningTerminal, whitespace],
			exprSingle
		),
		(ifthen, elseClause) => {
			return [
				'ifThenElseExpr',
				['ifClause', ifthen[0]],
				['thenClause', ifthen[1]],
				['elseClause', elseClause],
			];
		}
	);

	const allowingEmpty: Parser<string> = delimited(tokens.ALLOWING, whitespacePlus, tokens.EMPTY);

	const positionalVar: Parser<IAST> = map(
		precededMultiple([tokens.AT, whitespacePlus, tokens.DOLLAR], varName),
		(x) => ['positionalVariableBinding', ...x]
	);

	const forBinding: Parser<IAST> = then5(
		preceded(tokens.DOLLAR, varName),
		preceded(whitespace, optional(typeDeclaration)),
		preceded(whitespace, optional(allowingEmpty)),
		preceded(whitespace, optional(positionalVar)),
		preceded(surrounded(tokens.IN, whitespace), exprSingle),
		(variableName, typeDecl, empty, pos, forExpr) =>
			[
				'forClauseItem',
				[
					'typedVariableBinding',
					['varName', ...variableName, ...(typeDecl ? [typeDecl] : [])],
				],
				...(empty ? [['allowingEmpty']] : []),
				...(pos ? [pos] : []),
				['forExpr', forExpr],
			] as IAST
	);

	const forClause: Parser<IAST> = precededMultiple(
		[tokens.FOR, whitespacePlus],
		binaryOperator(forBinding, tokens.COMMA, (lhs, rhs) => [
			'forClause',
			lhs,
			...rhs.map((x) => x[1]),
		])
	);

	const letBinding: Parser<IAST> = then3(
		preceded(tokens.DOLLAR, varName),
		preceded(whitespace, optional(typeDeclaration)),
		preceded(surrounded(tokens.WALRUS, whitespace), exprSingle),
		(variableName, typeDecl, letExpr) => [
			'letClauseItem',
			['typedVariableBinding', ['varName', ...variableName], ...(typeDecl ? [typeDecl] : [])],
			['letExpr', letExpr],
		]
	);

	const letClause: Parser<IAST> = map(
		precededMultiple(
			[tokens.LET, whitespace],
			binaryOperator(letBinding, tokens.COMMA, (lhs, rhs) => [lhs, ...rhs.map((x) => x[1])])
		),
		(x) => ['letClause', ...x]
	);

	const initialClause: Parser<IAST> = or([forClause, letClause]);

	const whereClause: Parser<IAST> = map(
		precededMultiple([tokens.WHERE, assertAdjacentOpeningTerminal, whitespace], exprSingle),
		(x) => ['whereClause', x]
	);

	const uriLiteral: Parser<string> = stringLiteral;

	const groupingVariable: Parser<IAST> = map(preceded(tokens.DOLLAR, varName), (x) => [
		'varName',
		...x,
	]);

	const groupVarInitialize: Parser<IAST> = then(
		preceded(whitespace, optional(typeDeclaration)),
		preceded(surrounded(tokens.WALRUS, whitespace), exprSingle),
		(t, val) =>
			[
				'groupVarInitialize',
				...(t ? [['typeDeclaration', ...t]] : []),
				['varValue', val],
			] as IAST
	);

	const groupingSpec: Parser<IAST> = then3(
		groupingVariable,
		optional(groupVarInitialize),
		optional(
			map(preceded(surrounded(tokens.COLLATION, whitespace), uriLiteral), (x) => [
				'collation',
				x,
			])
		),
		(variableName, init, col) =>
			['groupingSpec', variableName, ...(init ? [init] : []), ...(col ? [col] : [])] as IAST
	);

	const groupingSpecList: Parser<IAST[]> = binaryOperator(
		groupingSpec,
		tokens.COMMA,
		(lhs, rhs) => [lhs, ...rhs.map((x) => x[1])]
	);

	const groupByClause: Parser<IAST> = map(
		precededMultiple([tokens.GROUP, whitespacePlus, tokens.BY, whitespace], groupingSpecList),
		(x) => ['groupByClause', ...x]
	);

	const orderModifier: Parser<IAST | null> = then3(
		optional(or([tokens.ASCENDING, tokens.DESCENDING])),
		optional(
			precededMultiple(
				[whitespace, tokens.EMPTY, whitespace],
				or([tokens.GREATEST, tokens.LEAST].map((x) => map(x, (y) => 'empty ' + y)))
			)
		),
		preceded(
			whitespace,
			optional(precededMultiple([tokens.COLLATION, whitespace], uriLiteral))
		),
		(kind, empty, collation) => {
			if (!kind && !empty && !collation) {
				return null;
			} else {
				return [
					'orderModifier',
					...(kind ? [['orderingKind', kind]] : []),
					...(empty ? [['emptyOrderingMode', empty]] : []),
					...(collation ? [['collation', collation]] : []),
				] as IAST;
			}
		}
	);

	const orderSpec: Parser<IAST> = then(
		exprSingle,
		preceded(whitespace, orderModifier),
		(orderByExpr, modifier) => [
			'orderBySpec',
			['orderByExpr', orderByExpr],
			...(modifier ? [modifier] : []),
		]
	);

	const orderSpecList: Parser<IAST[]> = binaryOperator(orderSpec, tokens.COMMA, (lhs, rhs) => [
		lhs,
		...rhs.map((x) => x[1]),
	]);

	const orderByClause: Parser<IAST> = then(
		or([
			map(precededMultiple([tokens.ORDER, whitespacePlus], tokens.BY), (_) => false),
			map(
				precededMultiple(
					[tokens.STABLE, whitespacePlus, tokens.ORDER, whitespacePlus],
					tokens.BY
				),
				(_) => true
			),
		]),
		preceded(whitespace, orderSpecList),
		(stable, specList) =>
			['orderByClause', ...(stable ? [['stable']] : []), ...specList] as IAST
	);

	const intermediateClause: Parser<IAST> = or([
		initialClause,
		whereClause,
		groupByClause,
		orderByClause,
	]);

	const returnClause: Parser<IAST> = map(
		precededMultiple([tokens.RETURN, whitespace], exprSingle),
		(x) => ['returnClause', x]
	);

	const flworExpr: Parser<IAST> = then3(
		initialClause,
		star(preceded(whitespace, intermediateClause)),
		preceded(whitespace, returnClause),
		(initial, intermediate, ret) => ['flworExpr', initial, ...intermediate, ret] as IAST
	);

	const sequenceTypeUnion: Parser<IAST> = binaryOperator(
		sequenceType,
		tokens.VERTICAL_BAR,
		(lhs, rhs) =>
			rhs.length === 0
				? ['sequenceType', ...lhs]
				: ([
						'sequenceTypeUnion',
						['sequenceType', ...lhs],
						...rhs.map((x) => ['sequenceType', ...x[1]]),
				  ] as IAST)
	);

	const caseClause: Parser<IAST> = then3(
		precededMultiple(
			[tokens.CASE, whitespace],
			optional(
				preceded(tokens.DOLLAR, followed(followed(varName, whitespacePlus), tokens.AS))
			)
		),
		preceded(whitespace, sequenceTypeUnion),
		precededMultiple([whitespacePlus, tokens.RETURN, whitespacePlus], exprSingle),
		(variableName, sequence, result) =>
			(['typeswitchExprCaseClause'] as IAST)
				.concat(variableName ? [['variableBinding', ...variableName]] : [])
				.concat([sequence])
				.concat([['resultExpr', result]]) as IAST
	);

	const typeswitchExpr: Parser<IAST> = then4(
		preceded(
			tokens.TYPESWITCH,
			surrounded(
				delimited(tokens.BRACE_OPEN, surrounded(expr, whitespace), tokens.BRACE_CLOSE),
				whitespace
			)
		),
		plus(followed(caseClause, whitespace)),
		precededMultiple(
			[tokens.DEFAULT, whitespacePlus],
			optional(preceded(tokens.DOLLAR, followed(varName, whitespacePlus)))
		),
		precededMultiple([tokens.RETURN, whitespacePlus], exprSingle),
		(args, clauses, variableName, result) => [
			'typeswitchExpr',
			['argExpr', args],
			...clauses,
			['typeswitchExprDefaultClause', ...(variableName || []), ['resultExpr', result]],
		]
	);

	const quantifiedExprInClause: Parser<IAST> = then3(
		preceded(tokens.DOLLAR, varName),
		optional(preceded(whitespacePlus, typeDeclaration)),
		preceded(surrounded(tokens.IN, whitespacePlus), exprSingle),
		(variableName, type, source) => [
			'quantifiedExprInClause',
			['typedVariableBinding', ['varName', ...variableName], ...(type ? [type] : [])],
			['sourceExpr', source],
		]
	);

	const quantifiedExprInClauses: Parser<IAST[]> = binaryOperator(
		quantifiedExprInClause,
		tokens.COMMA,
		(lhs, rhs) => [lhs, ...rhs.map((x) => x[1])]
	);

	const quantifiedExpr: Parser<IAST> = then3(
		or([tokens.SOME, tokens.EVERY]),
		preceded(whitespacePlus, quantifiedExprInClauses),
		preceded(surrounded(tokens.SATISFIES, whitespace), exprSingle),
		(kind, clauses, predicatePart) => [
			'quantifiedExpr',
			['quantifier', kind],
			...clauses,
			['predicateExpr', predicatePart],
		]
	);

	const targetExpr: Parser<IAST> = exprSingle;

	const deleteExpr: Parser<IAST> = map(
		precededMultiple(
			[tokens.DELETE, whitespacePlus, or([tokens.NODES, tokens.NODE]), whitespacePlus],
			targetExpr
		),
		(x) => ['deleteExpr', ['targetExpr', x]]
	);

	const replaceExpr: Parser<IAST> = then3(
		precededMultiple(
			[tokens.REPLACE, whitespacePlus],
			optional(precededMultiple([tokens.VALUE, whitespacePlus, tokens.OF], whitespacePlus))
		),
		precededMultiple([tokens.NODE, whitespacePlus], targetExpr),
		preceded(surrounded(tokens.WITH, whitespacePlus), exprSingle),
		(replaceValue, target, replacementExpr) =>
			replaceValue
				? [
						'replaceExpr',
						['replaceValue'],
						['targetExpr', target],
						['replacementExpr', replacementExpr],
				  ]
				: ['replaceExpr', ['targetExpr', target], ['replacementExpr', replacementExpr]]
	);

	const transformCopy: Parser<IAST> = then(
		varRef,
		preceded(surrounded(tokens.WALRUS, whitespace), exprSingle),
		(ref, copySource) => ['transformCopy', ref, ['copySource', copySource]]
	);

	const copyModifyExpr: Parser<IAST> = then3(
		precededMultiple(
			[tokens.COPY, whitespacePlus],
			binaryOperator(transformCopy, tokens.COMMA, (lhs, rhs) => [
				lhs,
				...rhs.map((x) => x[1]),
			])
		),
		precededMultiple([whitespace, tokens.MODIFY, whitespacePlus], exprSingle),
		preceded(surrounded(tokens.RETURN, whitespacePlus), exprSingle),
		(transformExprs, modifyExpr, returnExpr) =>
			[
				'transformExpr',
				['transformCopies', ...transformExprs],
				['modifyExpr', modifyExpr],
				['returnExpr', returnExpr],
			] as IAST
	);

	const sourceExpr: Parser<IAST> = exprSingle;

	const insertExprTargetChoice: Parser<IAST> = or([
		followed(
			map(
				optional(
					followed(
						precededMultiple(
							[tokens.AS, whitespacePlus],
							or([
								map(tokens.FIRST, (_) => ['insertAsFirst']),
								map(tokens.LAST, (_) => ['insertAsLast']),
							])
						),
						whitespacePlus
					)
				),
				(x) => (x ? ['insertInto', x] : ['insertInto']) as IAST
			),
			tokens.INTO
		),
		map(tokens.AFTER, (_) => ['insertAfter']),
		map(tokens.BEFORE, (_) => ['insertBefore']),
	]);

	const insertExpr: Parser<IAST> = then3(
		precededMultiple(
			[tokens.INSERT, whitespacePlus, or([tokens.NODES, tokens.NODE]), whitespacePlus],
			sourceExpr
		),
		preceded(whitespacePlus, insertExprTargetChoice),
		preceded(whitespacePlus, targetExpr),
		(source, ietc, target) => [
			'insertExpr',
			['sourceExpr', source],
			ietc,
			['targetExpr', target],
		]
	);

	const newNameExpr: Parser<IAST> = exprSingle;

	const renameExpr: Parser<IAST> = then(
		precededMultiple([tokens.RENAME, whitespacePlus, tokens.NODE, whitespace], targetExpr),
		precededMultiple([whitespacePlus, tokens.AS, whitespacePlus], newNameExpr),
		(targetExprPart, newNamePart) => [
			'renameExpr',
			['targetExpr', targetExprPart],
			['newNameExpr', newNamePart],
		]
	);

	const switchCaseOperand: Parser<IAST> = exprSingle;

	const switchCaseClause: Parser<IAST> = then(
		plus(
			map(precededMultiple([tokens.CASE, whitespacePlus], switchCaseOperand), (x) => [
				'switchCaseExpr',
				x,
			])
		),
		precededMultiple([whitespacePlus, tokens.RETURN, whitespacePlus], exprSingle),
		(operands, exprPart) =>
			['switchExprCaseClause', ...operands, ['resultExpr', exprPart]] as IAST
	);

	const switchExpr: Parser<IAST> = then3(
		precededMultiple([tokens.SWITCH, whitespace, tokens.BRACE_OPEN], expr),
		precededMultiple(
			[whitespace, tokens.BRACE_CLOSE, whitespace],
			plus(followed(switchCaseClause, whitespace))
		),
		precededMultiple(
			[tokens.DEFAULT, whitespacePlus, tokens.RETURN, whitespacePlus],
			exprSingle
		),
		(exprPart, clauses, resultExpr) => [
			'switchExpr',
			['argExpr', exprPart],
			...clauses,
			['switchExprDefaultClause', ['resultExpr', resultExpr]],
		]
	);

	function exprSingle(input: string, offset: number): ParseResult<IAST> {
		return wrapInStackTrace(
			or([
				flworExpr,
				quantifiedExpr,
				switchExpr,
				typeswitchExpr,
				ifExpr,
				insertExpr,
				deleteExpr,
				renameExpr,
				replaceExpr,
				copyModifyExpr,
				orExpr,
			])
		)(input, offset);
	}

	function expr(input: string, offset: number): ParseResult<IAST> {
		return binaryOperator<IAST, IAST>(exprSingle, tokens.COMMA, (lhs, rhs) => {
			return rhs.length === 0 ? lhs : ['sequenceExpr', lhs, ...rhs.map((x) => x[1])];
		})(input, offset);
	}

	const queryBody: Parser<IAST> = map(expr, (x) => ['queryBody', x]);

	const namespaceDecl: Parser<IAST> = precededMultiple(
		[tokens.DECLARE, whitespacePlus, tokens.NAMESPACE, whitespacePlus],
		then(
			ncName,
			preceded(surrounded(tokens.EQUALS, whitespace), uriLiteral),
			(prefixPart, uri) => ['namespaceDecl', ['prefix', prefixPart], ['uri', uri]]
		)
	);

	const varValue: Parser<IAST> = exprSingle;

	const varDefaultValue: Parser<IAST> = exprSingle;

	const varDecl: Parser<IAST> = then(
		precededMultiple(
			[tokens.VARIABLE, whitespacePlus, tokens.DOLLAR, whitespace],
			then(varName, optional(preceded(whitespace, typeDeclaration)), (namePart, t) => [
				namePart,
				t,
			])
		),
		or([
			map(
				precededMultiple([whitespace, tokens.WALRUS, whitespace], varValue),
				(x) => ['varValue', x] as IAST
			),
			map(
				precededMultiple(
					[whitespacePlus, tokens.EXTERNAL],
					optional(
						precededMultiple([whitespace, tokens.WALRUS, whitespace], varDefaultValue)
					)
				),
				(x) => ['external', ...(x ? [['varValue', x]] : [])] as IAST
			),
		]),
		([namePart, t], value) =>
			['varDecl', ['varName', ...namePart], ...(t !== null ? [t] : []), ...[value]] as IAST
	);

	const functionDecl: Parser<IAST> = then4(
		precededMultiple(
			[
				tokens.FUNCTION,
				whitespacePlus,
				peek(
					not(reservedFunctionNames, ['Cannot use reserved function name'])
				) as Parser<string>,
			],
			eqName
		),
		precededMultiple([whitespace, tokens.BRACE_OPEN, whitespace], optional(paramList)),
		precededMultiple(
			[whitespace, tokens.BRACE_CLOSE],
			optional(precededMultiple([whitespacePlus, tokens.AS, whitespacePlus], sequenceType))
		),
		preceded(
			whitespace,
			or([
				map(functionBody, (x) => ['functionBody', x]),
				map(tokens.EXTERNAL, (_) => ['externalDefinition']),
			])
		),
		(namePart, paramListPart, typeDeclarations, body) =>
			[
				'functionDecl',
				['functionName', ...namePart],
				['paramList', ...(paramListPart || [])],
				...(typeDeclarations ? [['typeDeclaration', ...typeDeclarations]] : []),
				body,
			] as IAST
	);

	const annotatedDecl: Parser<IAST> = precededMultiple(
		[tokens.DECLARE, whitespacePlus],
		then(
			star(followed(or([annotation, compatibilityAnnotation]), whitespacePlus)),
			or([varDecl, functionDecl]),
			(annotations, decl) => [decl[0], ...annotations, ...decl.slice(1)]
		)
	);

	const defaultNamespaceDecl: Parser<IAST> = then(
		precededMultiple(
			[tokens.DECLARE, whitespacePlus, tokens.DEFAULT, whitespacePlus],
			or([tokens.ELEMENT, tokens.FUNCTION])
		),
		precededMultiple([whitespacePlus, tokens.NAMESPACE, whitespacePlus], uriLiteral),
		(elementOrFunction, uri) => [
			'defaultNamespaceDecl',
			['defaultNamespaceCategory', elementOrFunction],
			['uri', uri],
		]
	);

	const schemaPrefix: Parser<IAST> = or([
		map(
			followed(
				precededMultiple([tokens.NAMESPACE, whitespacePlus], ncName),
				preceded(whitespace, tokens.EQUALS)
			),
			(prefixPart) => ['namespacePrefix', prefixPart]
		),
		map(
			precededMultiple(
				[tokens.DEFAULT, whitespacePlus, tokens.ELEMENT, whitespacePlus],
				tokens.NAMESPACE
			),
			(_) => ['defaultElementNamespace'] as IAST
		),
	]);

	const schemaImport: Parser<IAST> = precededMultiple(
		[tokens.IMPORT, whitespacePlus, tokens.SCHEMA],
		then3(
			optional(preceded(whitespacePlus, schemaPrefix)),
			preceded(whitespace, uriLiteral),
			optional(
				then(
					precededMultiple([whitespacePlus, tokens.AT, whitespacePlus], uriLiteral),
					star(precededMultiple([whitespace, tokens.COMMA, whitespace], uriLiteral)),
					(lhs, rhs) => [lhs, ...rhs]
				)
			),
			(prefixPart, namespace, targetLocations) =>
				[
					'schemaImport',
					...(prefixPart ? [prefixPart] : []),
					...[['targetNamespace', namespace]],
					...(targetLocations ? [targetLocations] : []),
				] as IAST
		)
	);

	const moduleImport: Parser<IAST> = precededMultiple(
		[tokens.IMPORT, whitespacePlus, tokens.MODULE],
		then3(
			optional(
				followed(
					precededMultiple([whitespacePlus, tokens.NAMESPACE, whitespacePlus], ncName),
					preceded(whitespace, tokens.EQUALS)
				)
			),
			preceded(whitespace, uriLiteral),
			optional(
				then(
					precededMultiple([whitespacePlus, tokens.AT, whitespacePlus], uriLiteral),
					star(precededMultiple([whitespace, tokens.COMMA, whitespace], uriLiteral)),
					(lhs, rhs) => [lhs, ...rhs]
				)
			),
			(prefixPart, uri, _uris) => [
				// Implementing the uris part into the AST.
				'moduleImport',
				['namespacePrefix', prefixPart],
				['targetNamespace', uri],
			]
		)
	);

	const importExpr: Parser<IAST> = or([schemaImport, moduleImport]);

	const defaultCollationDecl: Parser<IAST> = map(
		precededMultiple(
			[
				tokens.DECLARE,
				whitespacePlus,
				tokens.DEFAULT,
				whitespacePlus,
				tokens.COLLATION,
				whitespacePlus,
			],
			uriLiteral
		),
		(x) => ['defaultCollationDecl', x]
	);

	const baseUriDecl: Parser<IAST> = map(
		precededMultiple(
			[tokens.DECLARE, whitespacePlus, tokens.BASE_URI, whitespacePlus],
			uriLiteral
		),
		(x) => ['baseUriDecl', x]
	);

	const decimalFormatDecl: Parser<IAST> = then(
		precededMultiple(
			[tokens.DECLARE, whitespacePlus],
			or([
				map(precededMultiple([tokens.DECIMAL_FORMAT, whitespacePlus], eqName), (x) => [
					'decimalFormatName',
					...x,
				]),
				map(
					precededMultiple([tokens.DEFAULT, whitespacePlus], tokens.DECIMAL_FORMAT),
					(_) => null
				),
			])
		),
		star(
			then(
				preceded(whitespacePlus, decimalFormatPropertyName),
				preceded(surrounded(tokens.EQUALS, whitespacePlus), stringLiteral),
				(namePart, value) => [
					'decimalFormatParam',
					['decimalFormatParamName', namePart],
					['decimalFormatParamValue', value],
				]
			)
		),
		(decimalFormatName, decimalFormatParams) => [
			'decimalFormatDecl',
			...(decimalFormatName ? [decimalFormatName] : []),
			...decimalFormatParams,
		]
	);

	const setter: Parser<IAST> = or([
		boundarySpaceDecl,
		defaultCollationDecl,
		baseUriDecl,
		constructionDecl,
		orderingModeDecl,
		emptyOrderDecl,
		copyNamespacesDecl,
		decimalFormatDecl,
	]);

	const optionDecl: Parser<IAST> = then(
		precededMultiple([tokens.DECLARE, whitespacePlus, tokens.OPTION, whitespacePlus], eqName),
		preceded(whitespacePlus, stringLiteral),
		(optionName, optionContents) =>
			['optionDecl', ['optionName', optionName], ['optionContents', optionContents]] as IAST
	);

	const contextItemDecl: Parser<IAST> = then(
		precededMultiple(
			[tokens.DECLARE, whitespacePlus, tokens.CONTEXT, whitespacePlus, tokens.ITEM],
			optional(precededMultiple([whitespacePlus, tokens.AS], itemType))
		),
		or([
			map(preceded(surrounded(tokens.WALRUS, whitespace), varValue), (x) => ['varValue', x]),
			map(
				precededMultiple(
					[whitespacePlus, tokens.EXTERNAL],
					optional(preceded(surrounded(tokens.WALRUS, whitespace), varDefaultValue))
				),
				(_) => ['external']
			),
		]),
		(itemTypePart, val) =>
			[
				'contextItemDecl',
				...(itemTypePart ? [['contextItemType', itemTypePart]] : []),
				val,
			] as IAST
	);

	const prolog: Parser<IAST> = then(
		star(
			followed(
				or([defaultNamespaceDecl, setter, namespaceDecl, importExpr]),
				surrounded(separator, whitespace)
			)
		),
		star(
			followed(
				or([contextItemDecl, annotatedDecl, optionDecl]),
				surrounded(separator, whitespace)
			)
		),
		(moduleSettings, declarations) =>
			moduleSettings.length === 0 && declarations.length === 0
				? null
				: ['prolog', ...moduleSettings, ...declarations]
	);

	const moduleDecl: Parser<IAST> = precededMultiple(
		[tokens.MODULE, whitespacePlus, tokens.NAMESPACE, whitespacePlus],
		then(
			followed(ncName, surrounded(tokens.EQUALS, whitespace)),
			followed(uriLiteral, surrounded(separator, whitespace)),
			(prefixPart, uri) => ['moduleDecl', ['prefix', prefixPart], ['uri', uri]]
		)
	);

	const libraryModule: Parser<IAST> = then(
		moduleDecl,
		preceded(whitespace, prolog),
		(moduleDeclPart, prologPart) =>
			['libraryModule', moduleDeclPart, ...(prologPart ? [prologPart] : [])] as IAST
	);

	const mainModule: Parser<IAST> = then(
		prolog,
		preceded(whitespace, queryBody),
		(prologPart, body) => ['mainModule', ...(prologPart ? [prologPart] : []), body]
	);

	const versionDeclaration: Parser<IAST> = map(
		precededMultiple(
			[tokens.XQUERY, whitespace],
			followed(
				or([
					then(
						preceded(tokens.ENCODING, whitespacePlus),
						stringLiteral,
						(encoding) => ['encoding', encoding] as IAST | IAST[]
					),
					then(
						precededMultiple([tokens.VERSION, whitespacePlus], stringLiteral),
						optional(
							precededMultiple(
								[whitespacePlus, tokens.ENCODING, whitespacePlus],
								stringLiteral
							)
						),
						(version, encoding) =>
							[
								['version', version],
								...(encoding ? [['encoding', encoding]] : []),
							] as IAST[]
					),
				]),
				preceded(whitespace, separator)
			)
		),
		(x) => ['versionDecl', ...x]
	);

	const module: Parser<IAST> = then(
		optional(surrounded(versionDeclaration, whitespace)),
		or([libraryModule, mainModule]),
		(versionDecl, modulePart) =>
			['module', ...(versionDecl ? [versionDecl] : []), ...[modulePart]] as IAST
	);

	const completeParser = complete(surrounded(module, whitespace));

	return (xpath: string, offset: number) => {
		stackTraceMap.clear();
		const result = completeParser(xpath, offset);

		let col = 1;
		let line = 1;

		// +1 because we need to look one character ahead
		for (let i = 0; i < xpath.length + 1; i++) {
			if (stackTraceMap.has(i)) {
				const stackTrace = stackTraceMap.get(i);
				stackTrace.line = line;
				stackTrace.column = col;
			}

			const c = xpath[i];
			if (c === '\r' || c === '\n') {
				line++;
				col = 1;
			} else {
				col++;
			}
		}

		return result;
	};
}

const xpathParser = generateParser({ outputDebugInfo: false, xquery: false });
const xpathDebugParser = generateParser({ outputDebugInfo: true, xquery: false });
const xqueryParser = generateParser({ outputDebugInfo: false, xquery: true });
const xqueryDebugParser = generateParser({ outputDebugInfo: true, xquery: true });

export function parseUsingPrsc(
	xpath: string,
	options: { outputDebugInfo: boolean; xquery: boolean }
): ParseResult<IAST> {
	whitespaceCache.clear();
	whitespacePlusCache.clear();
	pathExprCache.clear();

	if (options.xquery) {
		if (options.outputDebugInfo) {
			return xqueryDebugParser(xpath, 0);
		}
		return xqueryParser(xpath, 0);
	}

	if (options.outputDebugInfo) {
		return xpathDebugParser(xpath, 0);
	}
	return xpathParser(xpath, 0);
}
