import {
	cut,
	delimited,
	filter,
	followed,
	map,
	not,
	optional,
	or,
	Parser,
	peek,
	preceded,
	star,
	then,
} from 'prsc';
import { IAST } from './astHelper';
import { ncName } from './nameParser';
import { alias, precededMultiple, regex, then3, wrapArray } from './parsingFunctions';
import * as tokens from './tokens';
import {
	char,
	explicitWhitespace,
	whitespace,
	whitespaceCharacter,
	whitespacePlus,
} from './whitespaceParser';

// Declare this type to prevent renames down the road
export declare type QNameAST = [{ prefix: string | null; URI: string | null }, string];

export const assertAdjacentOpeningTerminal: Parser<string> = peek(
	or([tokens.BRACE_OPEN, tokens.DOUBLE_QUOTE, tokens.SINGLE_QUOTE, whitespaceCharacter])
);

export const forwardAxis: Parser<string> = map(
	or([
		tokens.CHILD_AXIS,
		tokens.DESCENDANT_AXIS,
		tokens.ATTRIBUTE_AXIS,
		tokens.SELF_AXIS,
		tokens.DESCENDANT_OR_SELF_AXIS,
		tokens.FOLLOWING_SIBLING_AXIS,
		tokens.FOLLOWING_AXIS,
	]),
	(x: string) => x.substring(0, x.length - 2)
);

export const reverseAxis: Parser<string> = map(
	or([
		tokens.PARENT_AXIS,
		tokens.ANCESTOR_AXIS,
		tokens.PRECEDING_SIBLING_AXIS,
		tokens.PRECEDING_AXIS,
		tokens.ANCESTOR_OR_SELF_AXIS,
	]),
	(x: string) => x.substring(0, x.length - 2)
);

export const predefinedEntityRef: Parser<string> = then3(
	tokens.AMPERSAND,
	or([tokens.LT, tokens.GT, tokens.AMP, tokens.QUOT, tokens.APOS]),
	tokens.SEMICOLON,
	(a, b, c) => a + b + c
);

export const charRef: Parser<string> = or([
	then3(tokens.CHAR_REF_HEX, regex(/[0-9a-fA-F]+/), tokens.SEMICOLON, (a, b, c) => a + b + c),
	then3(tokens.CHAR_REF, regex(/[0-9]+/), tokens.SEMICOLON, (a, b, c) => a + b + c),
]);

export const escapeQuot: Parser<string> = alias([tokens.DOUBLE_QUOTE_DOUBLE], '"');
export const escapeApos: Parser<string> = alias([tokens.SINGLE_QUOTE_DOUBLE], "'");

export const commentTest: Parser<IAST> = wrapArray(alias([tokens.COMMENT_TEST], 'commentTest'));
export const textTest: Parser<IAST> = wrapArray(alias([tokens.TEXT_TEST], 'textTest'));
export const namespaceNodeTest: Parser<IAST> = wrapArray(
	alias([tokens.NAMESPACE_NODE_TEST], 'namespaceTest')
);
export const anyKindTest: Parser<IAST> = wrapArray(alias([tokens.ANY_KIND_TEST], 'anyKindTest'));

const digits: Parser<string> = regex(/[0-9]+/);

const doubleLiteral: Parser<IAST> = then(
	or([
		then(tokens.DOT, digits, (dot, digitsParsed) => dot + digitsParsed),
		then(
			digits,
			optional(preceded(tokens.DOT, regex(/[0-9]*/))),
			(a, b) => a + (b !== null ? '.' + b : '')
		),
	]),
	then3(
		or([tokens.E_LOWER, tokens.E_UPPER]),
		optional(or([tokens.PLUS, tokens.MINUS])),
		digits,
		(e, expSign, expDigits) => e + (expSign ? expSign : '') + expDigits
	),
	(base, exponent) => ['doubleConstantExpr', ['value', base + exponent]]
);

const decimalLiteral: Parser<IAST> = or([
	map(preceded(tokens.DOT, digits), (x) => ['decimalConstantExpr', ['value', '.' + x]]),
	then(followed(digits, tokens.DOT), optional(digits), (first, second) => [
		'decimalConstantExpr',
		['value', first + '.' + (second !== null ? second : '')],
	]),
]);

export const integerLiteral: Parser<IAST> = map(
	digits,
	(x) => ['integerConstantExpr', ['value', x]] as IAST
);

export const numericLiteral: Parser<IAST> = followed(
	or([doubleLiteral, decimalLiteral, integerLiteral]),
	peek(not(regex(/[a-zA-Z]/), ['no alphabetical characters after numeric literal']))
);

export const contextItemExpr: Parser<IAST> = map(
	followed(
		tokens.DOT,
		peek(not(tokens.DOT, ['context item should not be followed by another .']))
	),
	(_) => ['contextItemExpr']
);

export const reservedFunctionNames = or([
	tokens.ARRAY,
	tokens.ATTRIBUTE,
	tokens.COMMENT,
	tokens.DOCUMENT_NODE,
	tokens.ELEMENT,
	tokens.EMPTY_SEQUENCE,
	tokens.FUNCTION,
	tokens.IF,
	tokens.ITEM,
	tokens.MAP,
	tokens.NAMESPACE_NODE,
	tokens.NODE,
	tokens.PROCESSING_INSTRUCTION,
	tokens.SCHEMA_ATTRIBUTE,
	tokens.SCHEMA_ELEMENT,
	tokens.SWITCH,
	tokens.TEXT,
	tokens.TYPESWITCH,
]);

export const argumentPlaceholder: Parser<IAST> = wrapArray(
	alias([tokens.QUESTION_MARK], 'argumentPlaceholder')
);

export const occurrenceIndicator: Parser<string> = or([
	tokens.QUESTION_MARK,
	tokens.ASTERIX,
	tokens.PLUS,
]);

export const elementContentChar = preceded(
	peek(not(regex(/[{}<&]/), ['elementContentChar cannot be {, }, <, or &'])),
	char
);

export const cdataSection: Parser<IAST> = map(
	delimited(
		tokens.CDATA_OPEN,
		cut(
			star(
				preceded(
					peek(not(tokens.CDATA_CLOSE, ['CDataSection content may not contain "]]>"'])),
					char
				)
			)
		),
		tokens.CDATA_CLOSE
	),
	(contents) => ['CDataSection', contents.join('')]
);

export const quotAttrValueContentChar: Parser<string> = preceded(
	peek(not(regex(/[\"{}<&]/), ['quotAttrValueContentChar cannot be ", {, }, <, or &'])),
	char
);

export const aposAttrValueContentChar: Parser<string> = preceded(
	peek(not(regex(/[\'{}<&]/), ["aposAttrValueContentChar cannot be ', {, }, <, or &"])),
	char
);

export const dirCommentContents: Parser<string> = map(
	star(
		or([
			preceded(peek(not(tokens.MINUS, [])), char),
			map(
				precededMultiple(
					[tokens.MINUS, peek(not(tokens.MINUS, [])) as Parser<string>],
					char
				),
				(x) => '-' + x
			),
		])
	),
	(x) => x.join('')
);

export const dirCommentConstructor: Parser<IAST> = map(
	delimited(tokens.DIR_COMMENT_OPEN, cut(dirCommentContents), tokens.DIR_COMMENT_CLOSE),
	(x) => ['computedCommentConstructor', ['argExpr', ['stringConstantExpr', ['value', x]]]]
);

// Note: we deviate from the spec here. Processing instruction targets must _always_ be a NCName
const piTarget: Parser<string> = filter(
		ncName,
		(target: string) => {
			return target.toLowerCase() !== 'xml';
		},
		['A processing instruction target cannot be "xml"']
);

const dirPiContents: Parser<string> = map(
	star(preceded(peek(not(tokens.DIR_PI_CLOSE, [])), char)),
	(x) => x.join('')
);

export const dirPiConstructor: Parser<IAST> = then(
	preceded(tokens.DIR_PI_OPEN, cut(piTarget)),
	cut(followed(optional(preceded(explicitWhitespace, dirPiContents)), tokens.DIR_PI_CLOSE)),
	(target, contents) => [
		'computedPIConstructor',
		['piTarget', target],
		['piValueExpr', ['stringConstantExpr', ['value', contents]]],
	]
);

export const locationPathAbbreviation: Parser<IAST> = map(tokens.DOUBLE_SLASH, (_) => [
	'stepExpr',
	['xpathAxis', 'descendant-or-self'],
	['anyKindTest'],
]);

export const validationMode: Parser<string> = or([tokens.LAX, tokens.STRICT]);

export const pragmaContents: Parser<string> = map(
	star(followed(char, peek(not(tokens.PRAGMA_END, ["Pragma contents should not contain '#)'"])))),
	(x) => x.join('')
);

export const valueCompare: Parser<string> = map(
	followed(
		or([tokens.EQ, tokens.NE, tokens.LT, tokens.LE, tokens.GT, tokens.GE]),
		assertAdjacentOpeningTerminal
	),
	(x) => x + 'Op'
);

export const nodeCompare: Parser<string> = or([
	followed(alias([tokens.IS], 'isOp'), assertAdjacentOpeningTerminal),
	alias([tokens.LESS_THAN_DOUBLE], 'nodeBeforeOp'),
	alias([tokens.GREATER_THAN_DOUBLE], 'nodeAfterOp'),
]);

export const generalCompare: Parser<string> = or([
	alias([tokens.EQUALS], 'equalOp'),
	alias([tokens.NOT_EQUALS], 'notEqualOp'),
	alias([tokens.LESS_THAN_EQUALS], 'lessThanOrEqualOp'),
	alias([tokens.LESS_THAN], 'lessThanOp'),
	alias([tokens.GREATER_THAN_EQUALS], 'greaterThanOrEqualOp'),
	alias([tokens.GREATER_THAN], 'greaterThanOp'),
]);

export const compatibilityAnnotation: Parser<IAST> = map(tokens.UPDATING, (_) => [
	'annotation',
	['annotationName', 'updating'],
]);

export const separator: Parser<string> = tokens.SEMICOLON;

const preserveMode: Parser<string> = or([tokens.PRESERVE, tokens.NO_PRESERVE]);

const inheritMode: Parser<string> = or([tokens.INHERIT, tokens.NO_INHERIT]);

export const decimalFormatPropertyName: Parser<string> = or([
	tokens.DECIMAL_SEPARATOR,
	tokens.GROUPING_SEPARATOR,
	tokens.INFINITY,
	tokens.MINUS_SIGN,
	tokens.NAN,
	tokens.PERCENT,
	tokens.PER_MILLE,
	tokens.ZERO_DIGIT,
	tokens.DIGIT,
	tokens.PATTERN_SEPARATOR,
	tokens.EXPONENT_SEPARATOER,
]);

export const boundarySpaceDecl: Parser<IAST> = map(
	precededMultiple(
		[tokens.DECLARE, whitespacePlus, tokens.BOUNDARY_SPACE, whitespacePlus],
		or([tokens.PRESERVE, tokens.STRIP])
	),
	(x) => ['boundarySpaceDecl', x]
);

export const constructionDecl: Parser<IAST> = map(
	precededMultiple(
		[tokens.DECLARE, whitespacePlus, tokens.CONSTRUCTION, whitespacePlus],
		or([tokens.PRESERVE, tokens.STRIP])
	),
	(x) => ['constructionDecl', x]
);

export const orderingModeDecl: Parser<IAST> = map(
	precededMultiple(
		[tokens.DECLARE, whitespacePlus, tokens.ORDERING, whitespacePlus],
		or([tokens.ORDERED, tokens.UNORDERED])
	),
	(x) => ['orderingModeDecl', x]
);

export const emptyOrderDecl: Parser<IAST> = map(
	precededMultiple(
		[
			tokens.DECLARE,
			whitespacePlus,
			tokens.DEFAULT,
			whitespacePlus,
			tokens.ORDER,
			whitespacePlus,
			tokens.EMPTY,
			whitespacePlus,
		],
		or([tokens.GREATEST, tokens.LEAST])
	),
	(x) => ['emptyOrderDecl', x]
);

export const copyNamespacesDecl: Parser<IAST> = then(
	precededMultiple(
		[tokens.DECLARE, whitespacePlus, tokens.COPY_NAMESPACES, whitespacePlus],
		preserveMode
	),
	precededMultiple([whitespace, tokens.COMMA, whitespace], inheritMode),
	(preserveModePart, inheritModePart) => [
		'copyNamespacesDecl',
		['preserveMode', preserveModePart],
		['inheritMode', inheritModePart],
	]
);
