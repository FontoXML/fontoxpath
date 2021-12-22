import {
	complete,
	delimited,
	error,
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
	token,
} from 'prsc';
import { ASTAttributes, IAST } from './astHelper';

function generateParser(options: { outputDebugInfo: boolean; xquery: boolean }): Parser<IAST> {
	function cached<T>(parser: Parser<T>): Parser<T> {
		let cache: { [key: number]: ParseResult<T> } = {};
		return (input: string, offset: number): ParseResult<T> => {
			if (cache[offset]) {
				return cache[offset];
			}

			const result = parser(input, offset);
			cache[offset] = result;
			return result;
		};
	}

	const char: Parser<string> = or([
		regex(/[\t\n\r -\uD7FF\uE000\uFFFD]/),
		regex(/[\uD800-\uDBFF][\uDC00-\uDFFF]/),
	]);

	const commentContents: Parser<string> = preceded(
		peek(not(or([token('(:'), token(':)')]), ['comment contents cannot contain "(:" or ":)"'])),
		char
	);

	const comment: Parser<string> = map(
		delimited(token('(:'), star(or([commentContents, commentIndirect])), token(':)')),
		(x) => x.join('')
	);

	function commentIndirect(input: string, offset: number) {
		return comment(input, offset);
	}

	const explicitWhitespace: Parser<string> = map(
		plus(or(['\u0020', '\u0009', '\u000D', '\u000A'].map(token))),
		(x) => x.join('')
	);

	const whitespaceCharacter: Parser<string> = or([
		or(['\u0020', '\u0009', '\u000D', '\u000A'].map(token)),
		comment,
	]);

	const whitespace: Parser<string> = cached(map(star(whitespaceCharacter), (x) => x.join('')));

	const whitespacePlus: Parser<string> = cached(
		map(plus(whitespaceCharacter), (x) => x.join(''))
	);

	function surrounded<T, S>(parser: Parser<T>, around: Parser<S>): Parser<T> {
		return delimited(around, parser, around);
	}

	function precededMultiple<T, S>(before: Parser<S>[], parser: Parser<T>): Parser<T> {
		return before.reverse().reduce((prev, curr) => preceded(curr, prev), parser);
	}

	function then3<T, S, U, V>(
		aParser: Parser<T>,
		bParser: Parser<S>,
		cParser: Parser<U>,
		func: (aValue: T, bValue: S, cValue: U) => V
	): Parser<V> {
		return then(
			then(aParser, bParser, (a, b): [T, S] => [a, b]),
			cParser,
			([a, b], c) => func(a, b, c)
		);
	}

	function then4<T, S, U, V, P>(
		aParser: Parser<T>,
		bParser: Parser<S>,
		cParser: Parser<U>,
		dParser: Parser<V>,
		func: (aValue: T, bValue: S, cValue: U, dValue: V) => P
	): Parser<P> {
		return then(
			then(
				then(aParser, bParser, (a, b) => [a, b]),
				cParser,
				([a, b], c) => [a, b, c]
			),
			dParser,
			([a, b, c]: [T, S, U], d) => func(a, b, c, d)
		);
	}

	function then5<T, S, U, V, W, P>(
		aParser: Parser<T>,
		bParser: Parser<S>,
		cParser: Parser<U>,
		dParser: Parser<V>,
		eParser: Parser<W>,
		func: (aValue: T, bValue: S, cValue: U, dValue: V, eValue: W) => P
	): Parser<P> {
		return then(
			then(
				then(
					then(aParser, bParser, (a, b) => [a, b]),
					cParser,
					([a, b], c) => [a, b, c]
				),
				dParser,
				([a, b, c]: [T, S, U], d) => [a, b, c, d]
			),
			eParser,
			([a, b, c, d]: [T, S, U, V], e) => func(a, b, c, d, e)
		);
	}

	function wrapArray<T>(parser: Parser<T>): Parser<[T]> {
		return map(parser, (x) => [x]);
	}

	function defaultBinaryOperatorFn(lhs: IAST, rhs: [string, IAST][]): IAST {
		return rhs.reduce((lh, rh) => [rh[0], ['firstOperand', lh], ['secondOperand', rh[1]]], lhs);
	}

	function binaryOperator<T>(
		exp: Parser<IAST>,
		operator: Parser<string>,
		constructionFn: (lhs: IAST, rhs: [string, IAST][]) => T
	): Parser<T> {
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

	function alias(tokenNames: string[], name: string): Parser<string> {
		return map(or(tokenNames.map(token)), (_) => name);
	}

	function regex(reg: RegExp): Parser<string> {
		return (input: string, offset: number): ParseResult<string> => {
			const match = reg.exec(input.substring(offset));
			if (match && match.index === 0) {
				return okWithValue(offset + match[0].length, match[0]);
			} else {
				return error(offset, [reg.source], false);
			}
		};
	}

	function isAttributeTest(test: IAST): boolean {
		return test[0] === 'attributeTest' || test[0] === 'schemaAttributeTest';
	}

	function assertValidCodePoint(codePoint: number) {
		if (
			(codePoint >= 0x1 && codePoint <= 0xd7ff) ||
			(codePoint >= 0xe000 && codePoint <= 0xfffd) ||
			(codePoint >= 0x10000 && codePoint <= 0x10ffff)
		) {
			return;
		}
		throw new Error(
			'XQST0090: The character reference ' +
				codePoint +
				' (' +
				codePoint.toString(16) +
				') does not reference a valid codePoint.'
		);
	}

	function parseCharacterReferences(input: string): string {
		if (!options.xquery) {
			return input;
		}

		return input.replace(/(&[^;]+);/g, (match) => {
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
					return String.fromCharCode(34);
				case '&apos;':
					return String.fromCharCode(39);
			}
			throw new Error('XPST0003: Unknown character reference: "' + match + '"');
		});
	}

	function wrapInSequenceExprIfNeeded(exp: IAST): IAST {
		switch (exp[0]) {
			// These expressions do not have to be wrapped (are allowed in a filterExpr)
			case 'constantExpr':
			case 'varRef':
			case 'contextItemExpr':
			case 'functionCallExpr':
			case 'sequenceExpr':
			case 'elementConstructor':
			case 'computedElementConstructor':
			case 'computedAttributeConstructor':
			case 'computedDocumentConstructor':
			case 'computedTextConstructor':
			case 'computedCommentConstructor':
			case 'computedNamespaceConstructor':
			case 'computedPIConstructor':
			case 'orderedExpr':
			case 'unorderedExpr':
			case 'namedFunctionRef':
			case 'inlineFunctionExpr':
			case 'dynamicFunctionInvocationExpr':
			case 'mapConstructor':
			case 'arrayConstructor':
			case 'stringConstructor':
			case 'unaryLookup':
				return exp;
		}
		return ['sequenceExpr', exp];
	}

	function accumulateDirContents(
		parts: any | any[],
		expressionsOnly: boolean,
		normalizeWhitespace: boolean
	) {
		if (!parts.length) {
			return [];
		}
		var result = [parts[0]];
		for (var i = 1; i < parts.length; ++i) {
			if (typeof result[result.length - 1] === 'string' && typeof parts[i] === 'string') {
				result[result.length - 1] += parts[i];
				continue;
			}
			result.push(parts[i]);
		}

		if (typeof result[0] === 'string' && result.length === 0) {
			return [];
		}

		result = result.reduce(function (filteredItems, item, i) {
			if (typeof item !== 'string') {
				filteredItems.push(item);
			} else if (!normalizeWhitespace || !/^\s*$/.test(item)) {
				// Not only whitespace
				filteredItems.push(parseCharacterReferences(item));
			} else {
				var next = result[i + 1];
				if (next && next[0] === 'CDataSection') {
					filteredItems.push(parseCharacterReferences(item));
				} else {
					var previous = result[i - 1];
					if (previous && previous[0] === 'CDataSection') {
						filteredItems.push(parseCharacterReferences(item));
					}
				}
			}
			return filteredItems;
		}, []);

		if (!result.length) {
			return result;
		}

		if (result.length > 1 || expressionsOnly) {
			for (var i = 0; i < result.length; i++) {
				if (typeof result[i] === 'string') {
					result[i] = ['stringConstantExpr', ['value', result[i]]];
				}
			}
		}
		return result;
	}

	function getLineData(input: string, offset: number): [number, number] {
		let col = 1;
		let line = 1;
		for (let i = 0; i < offset; i++) {
			const c = input[i];
			if (c === '\r\n' || c === '\r' || c === '\n') {
				line++;
				col = 1;
			} else {
				col++;
			}
		}
		return [col, line];
	}

	function wrapInStackTrace(parser: Parser<IAST>): Parser<IAST> {
		if (!options.outputDebugInfo) {
			return parser;
		}

		return (input: string, offset: number): ParseResult<IAST> => {
			const result = parser(input, offset);
			if (!result.success) {
				return result;
			}

			const [startCol, startLine] = getLineData(input, offset);
			const [endCol, endLine] = getLineData(input, result.offset);

			return okWithValue(result.offset, [
				'x:stackTrace',
				{
					start: {
						offset: offset,
						line: startLine,
						column: startCol,
					},
					end: {
						offset: result.offset,
						line: endLine,
						column: endCol,
					},
				},
				result.value,
			] as unknown as IAST);
		};
	}

	const assertAdjacentOpeningTerminal: Parser<string> = peek(
		or([token('('), token('"'), token("'"), whitespaceCharacter])
	);

	const unimplemented: Parser<IAST> = wrapArray(token('unimplemented'));

	const predicate: Parser<IAST> = preceded(
		token('['),
		followed(surrounded(expr, whitespace), token(']'))
	);

	const forwardAxis: Parser<string> = map(
		or(
			[
				'child::',
				'descendant::',
				'attribute::',
				'self::',
				'descendant-or-self::',
				'following-sibling::',
				'following::',
			].map(token)
		),
		(x: string) => x.substring(0, x.length - 2)
	);

	const reverseAxis: Parser<string> = map(
		or(
			[
				'parent::',
				'ancestor::',
				'preceding-sibling::',
				'preceding::',
				'ancestor-or-self::',
			].map(token)
		),
		(x: string) => x.substring(0, x.length - 2)
	);

	const ncNameStartChar: Parser<string> = or([
		regex(
			/[A-Z_a-z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/
		),
		then(regex(/[\uD800-\uDB7F]/), regex(/[\uDC00-\uDFFF]/), (a, b) => a + b),
	]);

	const ncNameChar: Parser<string> = or([
		ncNameStartChar,
		regex(/[\-\.0-9\xB7\u0300-\u036F\u203F\u2040]/),
	]);

	const ncName: Parser<string> = then(
		ncNameStartChar,
		star(ncNameChar),
		(a, b) => a + b.join('')
	);

	const escapeQuot: Parser<string> = alias(['""'], '"');

	const escapeApos: Parser<string> = alias(["''"], "'");

	const predefinedEntityRef: Parser<string> = then3(
		token('&'),
		or(['lt', 'gt', 'amp', 'quot', 'apos'].map(token)),
		token(';'),
		(a, b, c) => a + b + c
	);

	const charRef: Parser<string> = or([
		then3(token('&#x'), regex(/[0-9a-fA-F]+/), token(';'), (a, b, c) => a + b + c),
		then3(token('&#'), regex(/[0-9]+/), token(';'), (a, b, c) => a + b + c),
	]);

	const stringLiteral: Parser<string> = options.xquery
		? or([
				map(
					surrounded(
						star(or([predefinedEntityRef, charRef, escapeQuot, regex(/[^\"]/)])),
						token('"')
					),
					(x) => x.join('')
				),
				map(
					surrounded(
						star(or([predefinedEntityRef, charRef, escapeApos, regex(/[^']/)])),
						token("'")
					),
					(x) => x.join('')
				),
		  ])
		: or([
				map(surrounded(star(or([escapeQuot, regex(/[^\"]/)])), token('"')), (x) =>
					x.join('')
				),
				map(surrounded(star(or([escapeApos, regex(/[^']/)])), token("'")), (x) =>
					x.join('')
				),
		  ]);

	const localPart: Parser<string> = ncName;

	const unprefixedName: Parser<IAST> = wrapArray(localPart);

	const xmlPrefix: Parser<string> = ncName;

	const prefixedName: Parser<(string | ASTAttributes)[]> = then(
		xmlPrefix,
		preceded(token(':'), localPart),
		(prefix, local) => [{ ['prefix']: prefix }, local]
	);

	const qName: Parser<IAST | (string | ASTAttributes)[]> = or([
		prefixedName as Parser<IAST | (string | ASTAttributes)[]>,
		unprefixedName,
	]);

	const bracedURILiteral: Parser<string> = followed(
		precededMultiple(
			[token('Q'), whitespace, token('{')],
			// TODO: add xquery version
			map(star(regex(/[^{}]/)), (x) => x.join(''))
		),
		token('}')
	);

	const uriQualifiedName: Parser<IAST> = then(bracedURILiteral, ncName, (uri, localName) => [
		uri,
		localName,
	]);

	const eqName: Parser<IAST | [ASTAttributes, string]> = or([
		map(
			uriQualifiedName,
			(x) => [{ ['prefix']: null, ['URI']: x[0] }, x[1]] as [ASTAttributes, string]
		),
		qName as Parser<IAST | [ASTAttributes, string]>,
	]);

	const elementName = eqName;

	const elementNameOrWildCard: Parser<IAST> = or([
		map(elementName, (name) => ['QName', ...name]),
		map(token('*'), (_token) => ['star']),
	]);

	const typeName: Parser<IAST | [ASTAttributes, string]> = eqName;

	const elementTest: Parser<IAST> = or([
		map(
			precededMultiple(
				[token('element'), whitespace],
				delimited(
					token('('),
					then(
						elementNameOrWildCard,
						precededMultiple([whitespace, token(','), whitespace], typeName),
						(elementName, typeName) =>
							[
								['elementName', elementName],
								['typeName', ...typeName],
							] as [IAST, IAST]
					),
					token(')')
				)
			),
			([nameOrWildcard, typeName]) => ['elementTest', nameOrWildcard, typeName] as IAST
		),
		map(
			precededMultiple(
				[token('element'), whitespace],
				delimited(token('('), elementNameOrWildCard, token(')'))
			),
			(nameOrWildcard) => ['elementTest', ['elementName', nameOrWildcard]] as IAST
		),
		map(
			precededMultiple(
				[token('element'), whitespace],
				delimited(token('('), whitespace, token(')'))
			),
			(_) => ['elementTest']
		),
	]);
	const attribNameOrWildCard: Parser<IAST> = or([
		map(elementName, (name) => ['QName', ...name]),
		map(token('*'), (_token) => ['star']),
	]);
	const attributeTest: Parser<IAST> = or([
		map(
			precededMultiple(
				[token('attribute'), whitespace],
				delimited(
					token('('),
					then(
						attribNameOrWildCard,
						precededMultiple([whitespace, token(','), whitespace], typeName),
						(attributeName, typeName) =>
							[
								['attributeName', attributeName],
								['typeName', ...typeName],
							] as [IAST, IAST]
					),
					token(')')
				)
			),
			([nameOrWildcard, typeName]) => ['attributeTest', nameOrWildcard, typeName] as IAST
		),
		map(
			precededMultiple(
				[token('attribute'), whitespace],
				delimited(token('('), attribNameOrWildCard, token(')'))
			),
			(nameOrWildcard) => ['attributeTest', ['attributeName', nameOrWildcard]] as IAST
		),
		map(
			precededMultiple(
				[token('attribute'), whitespace],
				delimited(token('('), whitespace, token(')'))
			),
			(_) => ['attributeTest']
		),
	]);

	const elementDeclaration: Parser<IAST | [ASTAttributes, string]> = elementName;

	const schemaElementTest: Parser<IAST> = map(
		precededMultiple(
			[token('schema-element'), whitespace, token('(')],
			followed(elementDeclaration, token(')'))
		),
		(x) => ['schemaElementTest', ...x]
	);

	const documentTest: Parser<IAST> = map(
		preceded(
			token('document-node('),
			followed(
				surrounded(optional(or([elementTest, schemaElementTest])), whitespace),
				token(')')
			)
		),
		(x) => ['documentTest', ...(x ? [x] : [])]
	);

	const piTest: Parser<IAST> = or([
		map(
			preceded(
				token('processing-instruction('),
				followed(surrounded(or([ncName, stringLiteral]), whitespace), token(')'))
			),
			(piTarget) => ['piTest', ['piTarget', piTarget]] as IAST
		),

		wrapArray(alias(['processing-instruction()'], 'piTest')),
	]);

	const commentTest: Parser<IAST> = wrapArray(alias(['comment()'], 'commentTest'));

	const textTest: Parser<IAST> = wrapArray(alias(['text()'], 'textTest'));

	const namespaceNodeTest: Parser<IAST> = wrapArray(alias(['namespace-node()'], 'namespaceTest'));

	const anyKindTest: Parser<IAST> = wrapArray(alias(['node()'], 'anyKindTest'));

	const kindTest: Parser<IAST> = or([
		documentTest,
		elementTest,
		attributeTest,
		schemaElementTest,
		piTest,
		commentTest,
		textTest,
		namespaceNodeTest,
		anyKindTest,
	]);

	const wildcard: Parser<IAST> = or([
		map(preceded(token('*:'), ncName), (x) => [
			'Wildcard',
			['star'],
			['NCName', x],
		]) as Parser<IAST>,
		wrapArray(alias(['*'], 'Wildcard')),
		map(followed(bracedURILiteral, token('*')), (x) => ['Wildcard', ['uri', x], ['star']]),
		map(followed(ncName, token(':*')), (x) => [
			'Wildcard',
			['NCName', x],
			['star'],
		]) as Parser<IAST>,
	]);

	const nameTest: Parser<IAST> = or([wildcard, map(eqName, (x) => ['nameTest', ...x])]);

	const nodeTest: Parser<IAST> = or([kindTest, nameTest]);

	const abbrevForwardStep: Parser<IAST> = then(optional(token('@')), nodeTest, (a, b) => {
		return a !== null || isAttributeTest(b)
			? ['stepExpr', ['xpathAxis', 'attribute'], b]
			: ['stepExpr', ['xpathAxis', 'child'], b];
	});

	const forwardStep: Parser<IAST> = or([
		then(forwardAxis, nodeTest, (axis, test) => ['stepExpr', ['xpathAxis', axis], test]),
		abbrevForwardStep,
	]);

	const abbrevReverseStep: Parser<IAST> = map(token('..'), (_) => [
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

	const digits: Parser<string> = regex(/[0-9]+/);

	const doubleLiteral: Parser<IAST> = then(
		or([
			then(token('.'), digits, (dot, digits) => dot + digits),
			then(
				digits,
				optional(preceded(token('.'), digits)),
				(a, b) => a + (b !== null ? '.' + b : '')
			),
		]),
		then3(
			or([token('e'), token('E')]),
			optional(or([token('+'), token('-')])),
			digits,
			(e, expSign, expDigits) => e + (expSign ? expSign : '') + expDigits
		),
		(base, exponent) => ['doubleConstantExpr', ['value', base + exponent]]
	);

	const decimalLiteral: Parser<IAST> = or([
		map(preceded(token('.'), digits), (x) => ['decimalConstantExpr', ['value', '.' + x]]),
		then(followed(digits, token('.')), optional(digits), (first, second) => [
			'decimalConstantExpr',
			['value', first + '.' + (second !== null ? second : '')],
		]),
	]);

	const integerLiteral: Parser<IAST> = map(
		digits,
		(x) => ['integerConstantExpr', ['value', x]] as IAST
	);

	const numericLiteral: Parser<IAST> = followed(
		or([doubleLiteral, decimalLiteral, integerLiteral]),
		peek(not(regex(/[a-zA-Z]/), ['no alphabetical characters after numeric literal']))
	);

	const literal: Parser<IAST> = or([
		numericLiteral,
		map(stringLiteral, (x) => ['stringConstantExpr', ['value', parseCharacterReferences(x)]]),
	]);

	const varName: Parser<IAST | [ASTAttributes, string]> = eqName;

	const varRef: Parser<IAST> = map(preceded(token('$'), varName), (x) => [
		'varRef',
		['name', ...x],
	]);

	const parenthesizedExpr: Parser<IAST> = or([
		delimited(token('('), surrounded(expr, whitespace), token(')')),
		map(delimited(token('('), whitespace, token(')')), (_) => ['sequenceExpr']),
	]);

	const contextItemExpr: Parser<IAST> = map(
		followed(
			token('.'),
			peek(not(token('.'), ['context item should not be followed by another .']))
		),
		(_) => ['contextItemExpr']
	);

	const reservedFunctionNames = or(
		[
			'array',
			'attribute',
			'comment',
			'document-node',
			'element',
			'empty-sequence',
			'function',
			'if',
			'item',
			'map',
			'namespace-node',
			'node',
			'processing-instruction',
			'schema-attribute',
			'schema-element',
			'switch',
			'text',
			'typeswitch',
		].map(token)
	);

	const argumentPlaceholder: Parser<IAST> = wrapArray(alias(['?'], 'argumentPlaceholder'));

	const argument: Parser<IAST> = or([exprSingle, argumentPlaceholder]);

	const argumentList: Parser<IAST[]> = map(
		delimited(
			token('('),
			surrounded(
				optional(
					then(
						argument,
						star(preceded(surrounded(token(','), whitespace), argument)),
						(first, following) => [first, ...following]
					)
				),
				whitespace
			),
			token(')')
		),
		(x) => (x !== null ? x : [])
	);

	const functionCall: Parser<IAST> = preceded(
		not(
			then3(reservedFunctionNames, whitespace, token('('), (_a, _b, _c) => undefined),
			['cannot use reseved keyword for function names']
		),
		then(eqName, preceded(whitespace, argumentList), (name, args) => [
			'functionCallExpr',
			['functionName', ...name],
			args !== null ? ['arguments', ...args] : ['arguments'],
		])
	);

	const namedFunctionRef: Parser<IAST> = then(
		eqName,
		preceded(token('#'), integerLiteral),
		(name, integer) => ['namedFunctionRef', ['functionName', ...name], integer]
	);

	const enclosedExpr: Parser<IAST | null> = delimited(
		token('{'),
		surrounded(optional(expr), whitespace),
		token('}')
	);

	const functionBody: Parser<IAST> = map(enclosedExpr, (x) => (x ? x : ['sequenceExpr']));

	const occurrenceIndicator: Parser<string> = or(['?', '*', '+'].map(token));

	const atomicOrUnionType: Parser<IAST> = map(eqName, (x) => ['atomicType', ...x]);

	// TODO: add other tests
	const itemType: Parser<IAST> = or([
		kindTest,
		wrapArray(alias(['item()'], 'anyItemType')),
		atomicOrUnionType,
	]);

	const sequenceType: Parser<any> = or([
		map(token('empty-sequence()'), (_) => [['voidSequenceType']]),
		then(itemType, optional(preceded(whitespace, occurrenceIndicator)), (type, occurrence) => [
			type,
			...(occurrence !== null ? [['occurrenceIndicator', occurrence]] : []),
		]),
	]);

	const typeDeclaration: Parser<IAST> = map(
		precededMultiple([token('as'), whitespacePlus], sequenceType),
		(x) => ['typeDeclaration', ...x]
	);

	const param: Parser<IAST> = then(
		preceded(token('$'), eqName),
		optional(preceded(whitespacePlus, typeDeclaration)),
		(varName, typeDeclaration) => [
			'param',
			['varName', ...varName],
			...(typeDeclaration ? [typeDeclaration] : []),
		]
	);

	const paramList: Parser<IAST[]> = binaryOperator(param, token(', '), (lhs, rhs) => [
		lhs,
		...rhs.map((x) => x[1]),
	]);

	const annotation: Parser<IAST> = then(
		precededMultiple([token('%'), whitespace], eqName),
		optional(
			followed(
				then(
					precededMultiple([token('('), whitespace], literal),
					star(precededMultiple([token(','), whitespace], literal)),
					(lhs, rhs) => lhs.concat(rhs)
				),
				token(')')
			)
		),
		(annotation, params) =>
			[
				'annotation',
				['annotationName', ...annotation],
				...(params ? ['arguments', params] : []),
			] as IAST
	);

	const inlineFunctionExpr: Parser<IAST> = then4(
		star(annotation),
		precededMultiple(
			[token('function'), whitespace, token('('), whitespace],
			optional(paramList)
		),
		precededMultiple(
			[whitespace, token(')'), whitespace],
			optional(
				map(
					precededMultiple([token('as'), whitespace], followed(sequenceType, whitespace)),
					(x) => ['typeDeclaration', ...x]
				)
			)
		),
		functionBody,
		(annotations, params, typeDeclaration, body) =>
			[
				'inlineFunctionExpr',
				...annotations,
				['paramList', ...(params ? params : [])],
				...(typeDeclaration ? [typeDeclaration] : []),
				['functionBody', body],
			] as IAST
	);

	const functionItemExpr: Parser<IAST> = or([namedFunctionRef, inlineFunctionExpr]);

	const mapKeyExpr: Parser<IAST> = map(exprSingle, (x) => ['mapKeyExpr', x]);
	const mapValueExpr: Parser<IAST> = map(exprSingle, (x) => ['mapValueExpr', x]);

	const mapConstructorEntry: Parser<IAST> = then(
		mapKeyExpr,
		preceded(surrounded(token(':'), whitespace), mapValueExpr),
		(k, v) => ['mapConstructorEntry', k, v]
	);

	const mapConstructor: Parser<IAST> = preceded(
		token('map'),
		delimited(
			surrounded(token('{'), whitespace),
			map(
				optional(
					binaryOperator(
						mapConstructorEntry,
						surrounded(token(','), whitespace),
						(lhs, rhs) => [lhs, ...rhs.map((x) => x[1])]
					)
				),
				(entries) => (entries ? ['mapConstructor', ...entries] : ['mapConstructor'])
			),
			preceded(whitespace, token('}'))
		)
	);

	const squareArrayConstructor: Parser<IAST> = map(
		delimited(
			token('['),
			surrounded(
				optional(
					binaryOperator(exprSingle, token(','), (lhs, rhs) =>
						[lhs, ...rhs.map((x) => x[1])].map((x) => ['arrayElem', x])
					)
				),
				whitespace
			),
			token(']')
		),
		// TODO: this null seems weird, try the query `[]`
		(x) => ['squareArray', ...(x !== null ? x : [null])] as IAST
	);

	const curlyArrayConstructor: Parser<IAST> = map(
		preceded(token('array'), preceded(whitespace, enclosedExpr)),
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
		token('*'),
	]);

	const unaryLookup: Parser<IAST> = map(
		preceded(token('?'), preceded(whitespace, keySpecifier)),
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
		alias(['{{'], '{') as Parser<IAST | string>,
		alias(['}}'], '}'),
		map(enclosedExpr, (x) => x || ['sequenceExpr']),
	]);

	const elementContentChar = preceded(
		peek(not(regex(/[{}<&]/), ['elementContentChar cannot be {, }, <, or &'])),
		char
	);

	const cdataSection: Parser<IAST> = map(
		delimited(
			token('<![CDATA['),
			star(
				preceded(
					peek(not(token(']]>'), ['CDataSection content may not contain "]]>"'])),
					char
				)
			),
			token(']]>')
		),
		(contents) => ['CDataSection', contents.join('')]
	);

	const dirElemContent: Parser<IAST | string> = or([
		cdataSection,
		directConstructorIndirect,
		commonContent,
		elementContentChar,
	]);

	const quotAttrValueContentChar: Parser<string> = preceded(
		peek(not(regex(/[\"{}<&]/), ['quotAttrValueContentChar cannot be ", {, }, <, or &'])),
		char
	);

	const aposAttrValueContentChar: Parser<string> = preceded(
		peek(not(regex(/[\'{}<&]/), ["aposAttrValueContentChar cannot be ', {, }, <, or &"])),
		char
	);

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

	// TODO: determine type of accumulateDirContents
	const dirAttributeValue: Parser<any[]> = map(
		or([
			surrounded(star(or([escapeQuot, quotAttrValueContent])), token('"')),
			surrounded(star(or([escapeApos, aposAttrValueContent])), token("'")),
		]),
		(x: (IAST | string)[]) => accumulateDirContents(x, false, false)
	);

	const attribute: Parser<IAST> = then(
		qName,
		preceded(surrounded(token('='), optional(explicitWhitespace)), dirAttributeValue),
		(name, value) => {
			if (name.length === 1 && name[0] === 'xmlns') {
				if (value.length && typeof value[0] !== 'string') {
					// TODO: These could get replaced with a fatal parse error
					throw new Error(
						'XQST0022: A namespace declaration may not contain enclosed expressions'
					);
				}
				return ['namespaceDeclaration', value.length ? ['uri', value[0]] : ['uri']];
			}
			if ((name[0] as ASTAttributes).prefix === 'xmlns') {
				if (value.length && typeof value[0] !== 'string') {
					throw new Error(
						"XQST0022: The namespace declaration for 'xmlns:" +
							name[1] +
							"' may not contain enclosed expressions"
					);
				}
				return [
					'namespaceDeclaration',
					['prefix', name[1]],
					value.length ? ['uri', value[0]] : ['uri'],
				] as IAST;
			}
			return [
				'attributeConstructor',
				['attributeName'].concat(name as string[]),
				value.length === 0
					? ['attributeValue']
					: value.length === 1 && typeof value[0] === 'string'
					? ['attributeValue', value[0]]
					: ['attributeValueExpr'].concat(value),
			] as IAST;
		}
	);

	const dirAttributeList: Parser<IAST[]> = map(
		star(preceded(explicitWhitespace, optional(attribute))),
		(x) => x.filter(Boolean)
	);

	const dirElemConstructor: Parser<IAST> = then3(
		preceded(token('<'), qName),
		dirAttributeList,
		or([
			map(token('/>'), (_) => null),
			then(
				preceded(token('>'), star(dirElemContent)),
				precededMultiple(
					[whitespace, token('</')],
					followed(
						qName,
						then(optional(explicitWhitespace), token('>'), (_) => null)
					)
				),
				(contents, _endName) => {
					//TODO: add assertEqualNames(name, endName);
					return accumulateDirContents(contents, true, true);
				}
			),
		]),
		(name, attList, contents) =>
			[
				'elementConstructor',
				['tagName', ...name],
				...(attList.length ? [['attributeList', ...attList]] : []),
				...(contents && contents.length ? [['elementContent', ...contents]] : []),
			] as IAST
	);

	const dirCommentContents: Parser<string> = map(
		star(
			or([
				preceded(peek(not(token('-'), [])), char),
				map(
					precededMultiple(
						[token('-'), peek(not(token('-'), [])) as Parser<string>],
						char
					),
					(x) => '-' + x
				),
			])
		),
		(x) => x.join('')
	);

	const dirCommentConstructor: Parser<IAST> = map(
		delimited(token('<!--'), dirCommentContents, token('-->')),
		(x) => ['computedCommentConstructor', ['argExpr', ['stringConstantExpr', ['value', x]]]]
	);

	const nameStartChar: Parser<string> = or([ncNameStartChar, token(':')]);

	const nameChar: Parser<string> = or([ncNameChar, token(':')]);

	const name: Parser<string> = then(
		nameStartChar,
		star(nameChar),
		(start, rest) => start + rest.join('')
	);

	const piTarget: Parser<string> = preceded(
		peek(
			not(
				then3(
					or(['X', 'x'].map(token)),
					or(['M', 'm'].map(token)),
					or(['L', 'l'].map(token)),
					(_a, _b, _c) => []
				),
				[]
			)
		),
		name
	);

	const dirPiContents: Parser<string> = map(
		star(preceded(peek(not(token('?>'), [])), char)),
		(x) => x.join('')
	);

	const dirPiConstructor: Parser<IAST> = then(
		preceded(token('<?'), piTarget),
		followed(optional(preceded(explicitWhitespace, dirPiContents)), token('?>')),
		(target, contents) => [
			'computedPIConstructor',
			['piTarget', target],
			['piValueExpr', ['stringConstantExpr', ['value', contents]]],
		]
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
		precededMultiple([token('document'), whitespace], enclosedExpr),
		(x) => ['computedDocumentConstructor', ...(x ? [['argExpr', x]] : [])] as IAST
	);

	const enclosedContentExpr: Parser<IAST[]> = map(enclosedExpr, (x) =>
		x ? [['contentExpr', x]] : []
	);

	const compElemConstructor: Parser<IAST> = then(
		precededMultiple(
			[token('element'), whitespace],
			or([
				map(eqName, (x) => ['tagName', ...x]),
				map(delimited(token('{'), surrounded(expr, whitespace), token('}')), (x) => [
					'tagNameExpr',
					x,
				]),
			])
		),
		preceded(whitespace, enclosedContentExpr),
		(tagName, content) => ['computedElementConstructor', tagName, ...content] as IAST
	);

	const compAttrConstructor: Parser<IAST> = then(
		preceded(
			token('attribute'),
			or([
				map(precededMultiple([assertAdjacentOpeningTerminal, whitespace], eqName), (x) => [
					'tagName',
					...x,
				]),
				map(
					preceded(
						whitespacePlus,
						delimited(token('{'), surrounded(expr, whitespace), token('}'))
					),
					(x) => ['tagNameExpr', x]
				),
			])
		),
		preceded(whitespace, enclosedExpr),
		(name, expr) =>
			[
				'computedAttributeConstructor',
				name,
				['valueExpr', expr ? expr : ['sequenceExpr']],
			] as IAST
	);

	const prefix: Parser<IAST> = map(ncName, (x) => ['prefix', x]);

	const enclosedPrefixExpr: Parser<IAST[]> = map(enclosedExpr, (x) =>
		x ? [['prefixExpr', x]] : []
	);

	const enclosedUriExpr: Parser<IAST[]> = map(enclosedExpr, (x) => (x ? [['URIExpr', x]] : []));

	const compNamespaceConstructor: Parser<IAST> = then(
		precededMultiple(
			[token('namespace'), whitespace],
			or([prefix as Parser<IAST[] | IAST>, enclosedPrefixExpr])
		),
		preceded(whitespace, enclosedUriExpr),
		(prefix, uri) => ['computedNamespaceConstructor', ...prefix, ...uri]
	);

	const compTextConstructor: Parser<IAST> = map(
		precededMultiple([token('text'), whitespace], enclosedExpr),
		(x) => ['computedTextConstructor', ...(x ? [['argExpr', x]] : [])] as IAST
	);

	const compCommentConstructor: Parser<IAST> = map(
		precededMultiple([token('comment'), whitespace], enclosedExpr),
		(x) => ['computedCommentConstructor', ...(x ? [['argExpr', x]] : [])] as IAST
	);

	const compPiConstructor: Parser<IAST> = precededMultiple(
		[token('processing-instruction'), whitespace],
		then(
			or([
				map(ncName, (x) => ['piTarget', x]),
				map(delimited(token('{'), surrounded(expr, whitespace), token('}')), (x) => [
					'piTargetExpr',
					x,
				]),
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

	// TODO: add other variants
	const primaryExpr: Parser<IAST> = or([
		literal,
		varRef,
		parenthesizedExpr,
		contextItemExpr,
		functionCall,
		nodeConstructor,
		functionItemExpr,
		mapConstructor,
		arrayConstructor,
		unaryLookup,
	]);

	const lookup: Parser<IAST> = map(
		precededMultiple([token('?'), whitespace], keySpecifier),
		(x) =>
			x === '*'
				? ['lookup', ['star']]
				: typeof x === 'string'
				? ['lookup', ['NCName', x]]
				: ['lookup', x]
	);

	const locationPathAbbreviation: Parser<IAST> = map(token('//'), (_) => [
		'stepExpr',
		['xpathAxis', 'descendant-or-self'],
		['anyKindTest'],
	]);

	const postfixExprWithStep: Parser<IAST> = then(
		map(primaryExpr, (x) => wrapInSequenceExprIfNeeded(x)),
		star(
			or([
				map(preceded(whitespace, predicate), (x) => ['predicate', x] as IAST),
				map(preceded(whitespace, argumentList), (x) => ['argumentList', x] as IAST),
				preceded(whitespace, lookup),
			])
		),
		(expression, postfixExpr) => {
			let toWrap: any = expression;

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
						toWrap = ['sequenceExpr', toWrap];
					}
					toWrap = [['filterExpr', toWrap], ...filters];
					filters.length = 0;
				} else if (ensureFilter) {
					toWrap = [['filterExpr', toWrap]];
				} else {
					toWrap = [toWrap];
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
						];
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
			preceded(surrounded(token('/'), whitespace), relativePathExprWithForcedStepIndirect),
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
			preceded(surrounded(token('/'), whitespace), relativePathExprWithForcedStepIndirect),
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
		map(precededMultiple([token('/'), whitespace], relativePathExprWithForcedStep), (x) => [
			'pathExpr',
			['rootExpr'],
			...x,
		]),
		then(
			locationPathAbbreviation,
			preceded(whitespace, relativePathExprWithForcedStep),
			(abbrev, path) => ['pathExpr', ['rootExpr'], abbrev, ...path]
		),
		// TODO: add xquery check
		map(
			followed(
				token('/'),
				not(preceded(whitespace, or([regex(/[*<a-zA-Z]/), regex(/[*a-zA-Z]/)])), [
					'Single rootExpr cannot be by followed by something that can be interpreted as a relative path',
				])
			),
			(_) => ['pathExpr', ['rootExpr']] as IAST
		),
	]);

	const pathExpr: Parser<IAST> = cached(or([relativePathExpr, absoluteLocationPath]));

	const validationMode: Parser<string> = or([token('lax'), token('strict')]);

	const validateExpr: Parser<IAST> = then(
		optional(
			preceded(
				token('validate'),
				or([
					map(preceded(whitespace, validationMode), (x) => ['validationMode', x]),
					map(
						precededMultiple([whitespace, token('type'), whitespace], typeName),
						(x) => ['type', ...x]
					),
				])
			)
		),
		preceded(whitespace, delimited(token('{'), surrounded(expr, whitespace), token('}'))),
		(modeOrType, expr) =>
			['validateExpr', ...(modeOrType ? [modeOrType] : []), ['argExpr', expr]] as IAST
	);

	const pragmaContents: Parser<string> = map(
		star(followed(char, peek(not(token('#)'), ["Pragma contents should not contain '#)'"])))),
		(x) => x.join('')
	);

	const pragma: Parser<IAST> = delimited(
		token('(#'),
		then(
			// TODO: isn't an optional whitespacePlus just a whitespace?
			preceded(optional(whitespacePlus), eqName),
			optional(preceded(whitespacePlus, pragmaContents)),
			(name, contents) =>
				(contents
					? ['pragma', ['pragmaName', name], ['pragmaContents', contents]]
					: ['pragma', ['pragmaName', name]]) as IAST
		),
		token('#)')
	);

	const extensionExpr: Parser<IAST> = map(
		followed(
			plus(pragma),
			preceded(
				whitespace,
				delimited(token('{'), surrounded(optional(expr), whitespace), token('}'))
			)
		),
		(pragma) => ['extensionExpr', ...pragma] as IAST
	);

	const simpleMapExpr: Parser<IAST> = wrapInStackTrace(
		binaryOperator(pathExpr, token('!'), (lhs: IAST, rhs: [string, IAST][]) => {
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
			or([alias(['-'], 'unaryMinusOp'), alias(['+'], 'unaryPlusOp')]),
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
				[whitespace, token('=>'), whitespace],
				then(
					arrowFunctionSpecifier,
					preceded(whitespace, argumentList),
					(specifier: IAST, argumentList: IAST[]) => [specifier, argumentList]
				)
			)
		),
		(argExpr, functionParts: [IAST, IAST[]][]) =>
			functionParts.reduce(
				(arg, part) => ['arrowExpr', ['argExpr', arg], part[0], ['arguments', ...part[1]]],
				argExpr
			)
	);

	const simpleTypeName: Parser<IAST | [ASTAttributes, string]> = typeName;

	const singleType: Parser<IAST> = then(simpleTypeName, optional(token('?')), (type, opt) =>
		opt !== null
			? ['singleType', ['atomicType', ...type], ['optional']]
			: ['singleType', ['atomicType', ...type]]
	);

	const castExpr: Parser<IAST> = then(
		arrowExpr,
		optional(
			precededMultiple(
				[
					whitespace,
					token('cast'),
					whitespacePlus,
					token('as'),
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
					token('castable'),
					whitespacePlus,
					token('as'),
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
					token('treat'),
					whitespacePlus,
					token('as'),
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
					token('instance'),
					whitespacePlus,
					token('of'),
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
			or([alias(['intersect'], 'intersectOp'), alias(['except'], 'exceptOp')]),
			assertAdjacentOpeningTerminal
		),
		defaultBinaryOperatorFn
	);

	const unionExpr: Parser<IAST> = binaryOperator(
		intersectExpr,
		or([
			alias(['|'], 'unionOp'),
			followed(alias(['union'], 'unionOp'), assertAdjacentOpeningTerminal),
		]),
		defaultBinaryOperatorFn
	);

	const multiplicativeExpr: Parser<IAST> = binaryOperator(
		unionExpr,
		or([
			alias(['*'], 'multiplyOp'),
			followed(alias(['div'], 'divOp'), assertAdjacentOpeningTerminal),
			followed(alias(['idiv'], 'idivOp'), assertAdjacentOpeningTerminal),
			followed(alias(['mod'], 'modOp'), assertAdjacentOpeningTerminal),
		]),
		defaultBinaryOperatorFn
	);

	const additiveExpr: Parser<IAST> = binaryOperator(
		multiplicativeExpr,
		or([alias(['-'], 'subtractOp'), alias(['+'], 'addOp')]),
		defaultBinaryOperatorFn
	);

	const rangeExpr: Parser<IAST> = nonRepeatableBinaryOperator(
		additiveExpr,
		followed(alias(['to'], 'rangeSequenceExpr'), assertAdjacentOpeningTerminal),
		'startExpr',
		'endExpr'
	);

	const stringConcatExpr: Parser<IAST> = binaryOperator(
		rangeExpr,
		alias(['||'], 'stringConcatenateOp'),
		defaultBinaryOperatorFn
	);

	const valueCompare: Parser<string> = map(
		followed(
			or([token('eq'), token('ne'), token('lt'), token('le'), token('gt'), token('ge')]),
			assertAdjacentOpeningTerminal
		),
		(x) => x + 'Op'
	);

	const nodeCompare: Parser<string> = or([
		followed(alias(['is'], 'isOp'), assertAdjacentOpeningTerminal),
		alias(['<<'], 'nodeBeforeOp'),
		alias(['>>'], 'nodeAfterOp'),
	]);

	const generalCompare: Parser<string> = or([
		alias(['='], 'equalOp'),
		alias(['!='], 'notEqualOp'),
		alias(['<='], 'lessThanOrEqualOp'),
		alias(['<'], 'lessThanOp'),
		alias(['>='], 'greaterThanOrEqualOp'),
		alias(['>'], 'greaterThanOp'),
	]);

	const comparisonExpr: Parser<IAST> = nonRepeatableBinaryOperator(
		stringConcatExpr,
		or([valueCompare, nodeCompare, generalCompare])
	);

	const andExpr: Parser<IAST> = binaryOperator(
		comparisonExpr,
		followed(alias(['and'], 'andOp'), assertAdjacentOpeningTerminal),
		defaultBinaryOperatorFn
	);

	const orExpr: Parser<IAST> = binaryOperator(
		andExpr,
		followed(alias(['or'], 'orOp'), assertAdjacentOpeningTerminal),
		defaultBinaryOperatorFn
	);

	const ifExpr: Parser<IAST> = then(
		then(
			precededMultiple([token('if'), whitespace, token('('), whitespace], expr),
			precededMultiple(
				[
					whitespace,
					token(')'),
					whitespace,
					token('then'),
					assertAdjacentOpeningTerminal,
					whitespace,
				],
				exprSingle
			),
			(ifClause, thenClause) => [ifClause, thenClause]
		),
		precededMultiple(
			[whitespace, token('else'), assertAdjacentOpeningTerminal, whitespace],
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

	const allowingEmpty: Parser<string> = delimited(
		token('allowing'),
		whitespacePlus,
		token('empty')
	);

	const positionalVar: Parser<IAST> = map(
		precededMultiple([token('at'), whitespacePlus, token('$')], varName),
		(x) => ['positionalVariableBinding', ...x]
	);

	const forBinding: Parser<IAST> = then5(
		preceded(token('$'), varName),
		preceded(whitespace, optional(typeDeclaration)),
		preceded(whitespace, optional(allowingEmpty)),
		preceded(whitespace, optional(positionalVar)),
		preceded(surrounded(token('in'), whitespace), exprSingle),
		(varName, typeDecl, empty, pos, expr) =>
			[
				'forClauseItem',
				['typedVariableBinding', ['varName', ...varName, ...(typeDecl ? [typeDecl] : [])]],
				...(empty ? [['allowingEmpty']] : []),
				...(pos ? [pos] : []),
				['forExpr', expr],
			] as IAST
	);

	const forClause: Parser<IAST> = precededMultiple(
		[token('for'), whitespacePlus],
		binaryOperator(forBinding, token(','), (lhs, rhs) => [
			'forClause',
			lhs,
			...rhs.map((x) => x[1]),
		])
	);

	const letBinding: Parser<IAST> = then3(
		preceded(token('$'), varName),
		preceded(whitespace, optional(typeDeclaration)),
		preceded(surrounded(token(':='), whitespace), exprSingle),
		(name, typeDecl, expr) => [
			'letClauseItem',
			['typedVariableBinding', ['varName', ...name], ...(typeDecl ? [typeDecl] : [])],
			['letExpr', expr],
		]
	);

	const letClause: Parser<IAST> = map(
		precededMultiple(
			[token('let'), whitespace],
			binaryOperator(letBinding, token(','), (lhs, rhs) => [lhs, ...rhs.map((x) => x[1])])
		),
		(x) => ['letClause', ...x]
	);

	const initialClause: Parser<IAST> = or([forClause, letClause]);

	const whereClause: Parser<IAST> = map(
		precededMultiple([token('where'), assertAdjacentOpeningTerminal, whitespace], exprSingle),
		(x) => ['whereClause', x]
	);

	const uriLiteral: Parser<string> = stringLiteral;

	const groupingVariable: Parser<IAST> = map(preceded(token('$'), varName), (x) => [
		'varName',
		...x,
	]);

	const groupVarInitialize: Parser<IAST> = then(
		preceded(whitespace, optional(typeDeclaration)),
		preceded(surrounded(token(':='), whitespace), exprSingle),
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
			map(preceded(surrounded(token('collation'), whitespace), uriLiteral), (x) => [
				'collation',
				x,
			])
		),
		(varName, init, col) =>
			['groupingSpec', varName, ...(init ? [init] : []), ...(col ? [col] : [])] as IAST
	);

	const groupingSpecList: Parser<IAST[]> = binaryOperator(
		groupingSpec,
		token(','),
		(lhs, rhs) => [lhs, ...rhs.map((x) => x[1])]
	);

	const groupByClause: Parser<IAST> = map(
		precededMultiple(
			[token('group'), whitespacePlus, token('by'), whitespace],
			groupingSpecList
		),
		(x) => ['groupByClause', ...x]
	);

	const orderModifier: Parser<IAST | null> = then3(
		optional(or(['ascending', 'descending'].map(token))),
		optional(
			precededMultiple(
				[token('empty'), whitespace],
				or([alias(['greatest'], 'empty greatest'), alias(['least'], 'empty least')])
			)
		),
		preceded(
			whitespace,
			optional(precededMultiple([token('collation'), whitespace], uriLiteral))
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
		(expr, modifier) => ['orderBySpec', ['orderByExpr', expr], ...(modifier ? [modifier] : [])]
	);

	const orderSpecList: Parser<IAST[]> = binaryOperator(orderSpec, token(','), (lhs, rhs) => [
		lhs,
		...rhs.map((x) => x[1]),
	]);

	const orderByClause: Parser<IAST> = then(
		or([
			// TODO: the `order by` part is common so this could be simplified
			map(precededMultiple([token('order'), whitespacePlus], token('by')), (_) => false),
			map(
				precededMultiple(
					[token('stable'), whitespacePlus, token('order'), whitespacePlus],
					token('by')
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
		precededMultiple([token('return'), whitespace], exprSingle),
		(x) => ['returnClause', x]
	);

	const flworExpr: Parser<IAST> = then3(
		initialClause,
		star(preceded(whitespace, intermediateClause)),
		preceded(whitespace, returnClause),
		(initial, intermediate, ret) => ['flworExpr', initial, ...intermediate, ret] as IAST
	);

	const sequenceTypeUnion: Parser<IAST> = binaryOperator(sequenceType, token('|'), (lhs, rhs) =>
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
			[token('case'), whitespace],
			optional(preceded(token('$'), followed(followed(varName, whitespacePlus), token('as'))))
		),
		preceded(whitespace, sequenceTypeUnion),
		precededMultiple([whitespacePlus, token('return'), whitespacePlus], exprSingle),
		(varName, sequence, expr) =>
			(['typeswitchExprCaseClause'] as IAST)
				.concat(varName ? [['variableBinding', ...varName]] : [])
				.concat([sequence])
				.concat([['resultExpr', expr]]) as IAST
	);

	const typeswitchExpr: Parser<IAST> = then4(
		preceded(
			token('typeswitch'),
			surrounded(delimited(token('('), surrounded(expr, whitespace), token(')')), whitespace)
		),
		plus(followed(caseClause, whitespace)),
		precededMultiple(
			[token('default'), whitespacePlus],
			optional(preceded(token('$'), followed(varName, whitespacePlus)))
		),
		precededMultiple([token('return'), whitespacePlus], exprSingle),
		(expr, clauses, varName, resultExpr) => [
			'typeswitchExpr',
			['argExpr', expr],
			...clauses,
			['typeswitchExprDefaultClause', ...(varName || []), ['resultExpr', resultExpr]],
		]
	);

	const quantifiedExprInClause: Parser<IAST> = then3(
		preceded(token('$'), varName),
		optional(preceded(whitespacePlus, typeDeclaration)),
		preceded(surrounded(token('in'), whitespacePlus), exprSingle),
		(varName, type, exprSingle) => [
			'quantifiedExprInClause',
			['typedVariableBinding', ['varName', ...varName], ...(type ? [type] : [])],
			['sourceExpr', exprSingle],
		]
	);

	const quantifiedExprInClauses: Parser<IAST[]> = binaryOperator(
		quantifiedExprInClause,
		token(','),
		(lhs, rhs) => [lhs, ...rhs.map((x) => x[1])]
	);

	const quantifiedExpr: Parser<IAST> = then3(
		or([token('some'), token('every')]),
		preceded(whitespacePlus, quantifiedExprInClauses),
		preceded(surrounded(token('satisfies'), whitespace), exprSingle),
		(kind, clauses, predicate) => [
			'quantifiedExpr',
			['quantifier', kind],
			...clauses,
			['predicateExpr', predicate],
		]
	);

	const targetExpr: Parser<IAST> = exprSingle;

	const deleteExpr: Parser<IAST> = map(
		precededMultiple(
			[token('delete'), whitespacePlus, or(['node', 'nodes'].map(token)), whitespacePlus],
			targetExpr
		),
		(x) => ['deleteExpr', ['targetExpr', x]]
	);

	const replaceExpr: Parser<IAST> = then3(
		precededMultiple(
			[token('replace'), whitespacePlus],
			optional(
				precededMultiple([token('value'), whitespacePlus, token('of')], whitespacePlus)
			)
		),
		precededMultiple([token('node'), whitespacePlus], targetExpr),
		preceded(surrounded(token('with'), whitespacePlus), exprSingle),
		(replaceValue, targetExpr, replacementExpr) =>
			replaceValue
				? [
						'replaceExpr',
						['replaceValue'],
						['targetExpr', targetExpr],
						['replacementExpr', replacementExpr],
				  ]
				: ['replaceExpr', ['targetExpr', targetExpr], ['replacementExpr', replacementExpr]]
	);

	const transformCopy: Parser<IAST> = then(
		varRef,
		preceded(surrounded(token(':='), whitespace), exprSingle),
		(varRef, copySource) => ['transformCopy', varRef, ['copySource', copySource]]
	);

	const copyModifyExpr: Parser<IAST> = then3(
		precededMultiple(
			[token('copy'), whitespacePlus],
			binaryOperator(transformCopy, token(','), (lhs, rhs) => [lhs, ...rhs.map((x) => x[1])])
		),
		precededMultiple([whitespace, token('modify'), whitespacePlus], exprSingle),
		preceded(surrounded(token('return'), whitespacePlus), exprSingle),
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
							[token('as'), whitespacePlus],
							or([
								map(token('first'), (_) => ['insertAsFirst']),
								map(token('last'), (_) => ['insertAsLast']),
							])
						),
						whitespacePlus
					)
				),
				(x) => (x ? ['insertInto', x] : ['insertInto']) as IAST
			),
			token('into')
		),
		map(token('after'), (_) => ['insertAfter']),
		map(token('before'), (_) => ['insertBefore']),
	]);

	const insertExpr: Parser<IAST> = then3(
		precededMultiple(
			[token('insert'), whitespacePlus, or(['nodes', 'node'].map(token)), whitespacePlus],
			sourceExpr
		),
		preceded(whitespacePlus, insertExprTargetChoice),
		preceded(whitespacePlus, targetExpr),
		(sourceExpr, ietc, targetExpr) => [
			'insertExpr',
			['sourceExpr', sourceExpr],
			ietc,
			['targetExpr', targetExpr],
		]
	);

	const newNameExpr: Parser<IAST> = exprSingle;

	const renameExpr: Parser<IAST> = then(
		precededMultiple([token('rename'), whitespacePlus, token('node'), whitespace], targetExpr),
		precededMultiple([whitespacePlus, token('as'), whitespacePlus], newNameExpr),
		(targetExpr, newNameExpr) => [
			'renameExpr',
			['targetExpr', targetExpr],
			['newNameExpr', newNameExpr],
		]
	);

	const switchCaseOperand: Parser<IAST> = exprSingle;

	const switchCaseClause: Parser<IAST> = then(
		plus(
			map(precededMultiple([token('case'), whitespacePlus], switchCaseOperand), (x) => [
				'switchCaseExpr',
				x,
			])
		),
		precededMultiple([whitespacePlus, token('return'), whitespacePlus], exprSingle),
		(operands, expr) => ['switchExprCaseClause', ...operands, ['resultExpr', expr]] as IAST
	);

	const switchExpr: Parser<IAST> = then3(
		precededMultiple([token('switch'), whitespace, token('(')], expr),
		precededMultiple(
			[whitespace, token(')'), whitespace],
			plus(followed(switchCaseClause, whitespace))
		),
		precededMultiple(
			[token('default'), whitespacePlus, token('return'), whitespacePlus],
			exprSingle
		),
		(expr, clauses, resultExpr) => [
			'switchExpr',
			['argExpr', expr],
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
		return binaryOperator<IAST>(exprSingle, token(','), (lhs, rhs) => {
			return rhs.length === 0 ? lhs : ['sequenceExpr', lhs, ...rhs.map((x) => x[1])];
		})(input, offset);
	}

	const queryBody: Parser<IAST> = map(expr, (x) => ['queryBody', x]);

	const namespaceDecl: Parser<IAST> = precededMultiple(
		[token('declare'), whitespacePlus, token('namespace'), whitespacePlus],
		then(ncName, preceded(surrounded(token('='), whitespace), uriLiteral), (prefix, uri) => [
			'namespaceDecl',
			['prefix', prefix],
			['uri', uri],
		])
	);

	const varValue: Parser<IAST> = exprSingle;

	const varDefaultValue: Parser<IAST> = exprSingle;

	const varDecl: Parser<IAST> = then(
		precededMultiple(
			[token('variable'), whitespacePlus, token('$'), whitespace],
			then(varName, optional(preceded(whitespace, typeDeclaration)), (name, t) => [name, t])
		),
		or([
			map(
				precededMultiple([whitespace, token(':='), whitespace], varValue),
				(x) => ['varValue', x] as IAST
			),
			map(
				precededMultiple(
					[whitespacePlus, token('external')],
					optional(
						precededMultiple([whitespace, token(':='), whitespace], varDefaultValue)
					)
				),
				(x) => ['external', ...(x ? [['varValue', x]] : [])] as IAST
			),
		]),
		([name, t], value) =>
			['varDecl', ['varName', ...name], ...(t !== null ? [t] : []), ...[value]] as IAST
	);

	const functionDecl: Parser<IAST> = then4(
		precededMultiple(
			[
				token('function'),
				whitespacePlus,
				peek(
					not(reservedFunctionNames, ['Cannot use reserved function name'])
				) as Parser<string>,
			],
			eqName
		),
		precededMultiple([whitespace, token('('), whitespace], optional(paramList)),
		precededMultiple(
			[whitespace, token(')')],
			optional(precededMultiple([whitespacePlus, token('as'), whitespacePlus], sequenceType))
		),
		preceded(
			whitespace,
			or([
				map(functionBody, (x) => ['functionBody', x]),
				map(token('external'), (_) => ['externalDefinition']),
			])
		),
		(name, paramList, typeDeclarations, body) =>
			[
				'functionDecl',
				['functionName', ...name],
				['paramList', ...(paramList || [])],
				...(typeDeclarations ? [['typeDeclaration', ...typeDeclarations]] : []),
				body,
			] as IAST
	);

	const compatibilityAnnotation: Parser<IAST> = map(token('updating'), (_) => [
		'annotation',
		['annotationName', 'updating'],
	]);

	// 	AnnotatedDecl
	//  = "declare" S annotations:(a:(Annotation / CompatibilityAnnotation) S {return a})* decl:(VarDecl / FunctionDecl)
	//    {return [decl[0]].concat(annotations).concat(decl.slice(1))}
	const annotatedDecl: Parser<IAST> = precededMultiple(
		[token('declare'), whitespacePlus],
		then(
			star(followed(or([annotation, compatibilityAnnotation]), whitespacePlus)),
			or([varDecl, functionDecl]),
			(annotations, decl) => [decl[0], ...annotations, ...decl.slice(1)]
		)
	);

	const defaultNamespaceDecl: Parser<IAST> = then(
		precededMultiple(
			[token('declare'), whitespacePlus, token('default'), whitespacePlus],
			or([token('element'), token('function')])
		),
		precededMultiple([whitespacePlus, token('namespace'), whitespacePlus], uriLiteral),
		(elementOrFunction, uri) => [
			'defaultNamespaceDecl',
			['defaultNamespaceCategory', elementOrFunction],
			['uri', uri],
		]
	);

	const separator: Parser<string> = token(';');

	// 	SchemaPrefix
	//  = "namespace" S prefix:NCName _ "=" {return ["namespacePrefix", prefix]}
	//  / ("default" S "element" S "namespace" AssertAdjacentOpeningTerminal) {return ["defaultElementNamespace"]}
	
	const schemaPrefix: Parser<IAST> = or([
		map(precededMultiple([token('namespace'), whitespacePlus], ncName), (prefix) => [
			'namespacePrefix',
			prefix,
		]),
		map(
			precededMultiple(
				[token('default'), whitespacePlus, token('element'), whitespacePlus],
				token('namespace')
			),
			(_) => ['defaultElementNamespace'] as IAST
		),
	]);

	const schemaImport: Parser<IAST> = precededMultiple(
		[token('import'), whitespacePlus, token('schema')],
		then3(
			optional(preceded(whitespacePlus, schemaPrefix)),
			preceded(whitespace, uriLiteral),
			optional(
				then(
					precededMultiple([whitespacePlus, token('at'), whitespacePlus], uriLiteral),
					star(precededMultiple([whitespace, token(','), whitespace], uriLiteral)),
					(lhs, rhs) => [lhs, ...rhs]
				)
			),
			(prefix, namespace, targetLocations) =>
				[
					'schemaImport',
					...(prefix ? [prefix] : []),
					...[['targetNamespace', namespace]],
					...(targetLocations ? [targetLocations] : []),
				] as IAST
		)
	);

	const moduleImport: Parser<IAST> = precededMultiple(
		[token('import'), whitespacePlus, token('module')],
		then3(
			optional(
				followed(
					precededMultiple([whitespacePlus, token('namespace'), whitespacePlus], ncName),
					preceded(whitespace, token('='))
				)
			),
			preceded(whitespace, uriLiteral),
			optional(
				then(
					precededMultiple([whitespacePlus, token('at'), whitespacePlus], uriLiteral),
					star(precededMultiple([whitespace, token(','), whitespace], uriLiteral)),
					(lhs, rhs) => [lhs, ...rhs]
				)
			),
			(prefix, uri, uris) => [
				// Implementing the uris part into the AST.
				'moduleImport',
				['namespacePrefix', prefix],
				['targetNamespace', uri],
			]
		)
	);

	const importExpr: Parser<IAST> = or([schemaImport, moduleImport]);

	const prolog: Parser<IAST> = then(
		star(
			followed(
				or([namespaceDecl, defaultNamespaceDecl, importExpr]),
				surrounded(separator, whitespace)
			)
		),
		star(followed(or([annotatedDecl]), surrounded(separator, whitespace))),
		(moduleSettings, declarations) =>
			moduleSettings.length === 0 && declarations.length === 0
				? null
				: ['prolog', ...moduleSettings, ...declarations]
	);

	const moduleDecl: Parser<IAST> = precededMultiple(
		[token('module'), whitespacePlus, token('namespace'), whitespacePlus],
		then(
			followed(ncName, surrounded(token('='), whitespace)),
			followed(uriLiteral, surrounded(separator, whitespace)),
			(prefix, uri) => ['moduleDecl', ['prefix', prefix], ['uri', uri]]
		)
	);

	const libraryModule: Parser<IAST> = then(
		moduleDecl,
		preceded(whitespace, prolog),
		(moduleDecl, prolog) => ['libraryModule', moduleDecl, ...(prolog ? [prolog] : [])] as IAST
	);

	const mainModule: Parser<IAST> = then(
		prolog,
		preceded(whitespace, queryBody),
		(prolog, body) => ['mainModule', ...(prolog ? [prolog] : []), body]
	);

	const versionDeclaration: Parser<IAST> = map(
		precededMultiple(
			[token('xquery'), whitespace],
			followed(
				or([
					then(
						preceded(token('encoding'), whitespacePlus),
						stringLiteral,
						(encoding) => ['encoding', encoding] as IAST | IAST[]
					),
					then(
						precededMultiple([token('version'), whitespacePlus], stringLiteral),
						optional(
							precededMultiple(
								[whitespacePlus, token('encoding'), whitespacePlus],
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
				separator
			)
		),
		(x) => ['versionDecl', ...x]
	);

	const module: Parser<IAST> = then(
		optional(surrounded(versionDeclaration, whitespace)),
		or([libraryModule, mainModule]),
		(versionDecl, module) =>
			['module', ...(versionDecl ? [versionDecl] : []), ...[module]] as IAST
	);

	return surrounded(module, whitespace);
}

export function parseUsingPrsc(
	xpath: string,
	options: { outputDebugInfo: boolean; xquery: boolean },
	shouldConsumeAll: boolean = true
): ParseResult<IAST> {
	return (shouldConsumeAll ? complete(generateParser(options)) : generateParser(options))(
		xpath,
		0
	);
}
