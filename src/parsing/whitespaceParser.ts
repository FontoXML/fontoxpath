import { delimited, map, not, or, Parser, ParseResult, peek, plus, preceded, star } from 'prsc';
import { cached, regex } from './parsingFunctions';
import * as tokens from './tokens';

export const whitespaceCache = new Map<number, ParseResult<string>>();
export const whitespacePlusCache = new Map<number, ParseResult<string>>();

export const char: Parser<string> = or([
	regex(/[\t\n\r -\uD7FF\uE000\uFFFD]/),
	regex(/[\uD800-\uDBFF][\uDC00-\uDFFF]/),
]);

export const commentContents: Parser<string> = preceded(
	peek(
		not(or([tokens.COMMENT_START, tokens.COMMENT_END]), [
			'comment contents cannot contain "(:" or ":)"',
		]),
	),
	char,
);

function commentIndirect(input: string, offset: number) {
	return comment(input, offset);
}

export const comment: Parser<string> = map(
	delimited(
		tokens.COMMENT_START,
		star(or([commentContents, commentIndirect])),
		tokens.COMMENT_END,
		true,
	),
	(x) => x.join(''),
);

export const whitespaceCharacter: Parser<string> = or([tokens.WHITESPACE, comment]);

export const explicitWhitespace: Parser<string> = map(plus(tokens.WHITESPACE), (x) => x.join(''));

export const whitespace: Parser<string> = cached(
	map(star(whitespaceCharacter), (x) => x.join('')),
	whitespaceCache,
);

export const whitespacePlus: Parser<string> = cached(
	map(plus(whitespaceCharacter), (x) => x.join('')),
	whitespacePlusCache,
);
