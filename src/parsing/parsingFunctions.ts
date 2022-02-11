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
} from 'prsc';

export function cached<T>(parser: Parser<T>, cache: Map<number, ParseResult<T>>): Parser<T> {
	return (input: string, offset: number): ParseResult<T> => {
		if (cache.has(offset)) {
			return cache.get(offset);
		}

		const result = parser(input, offset);
		cache.set(offset, result);
		return result;
	};
}

export function surrounded<T, S>(parser: Parser<T>, around: Parser<S>): Parser<T> {
	return delimited(around, parser, around);
}

export function precededMultiple<T, S>(before: Parser<S>[], parser: Parser<T>): Parser<T> {
	return before.reverse().reduce((prev, curr) => preceded(curr, prev), parser);
}

export function then3<T, S, U, V>(
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

export function then4<T, S, U, V, P>(
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

export function then5<T, S, U, V, W, P>(
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

export function wrapArray<T>(parser: Parser<T>): Parser<[T]> {
	return map(parser, (x) => [x]);
}

export function alias(tokenNames: Parser<string>[], aliasedName: string): Parser<string> {
	return map(or(tokenNames), (_) => aliasedName);
}

export function regex(reg: RegExp): Parser<string> {
	return (input: string, offset: number): ParseResult<string> => {
		const match = reg.exec(input.substring(offset));
		if (match && match.index === 0) {
			return okWithValue(offset + match[0].length, match[0]);
		} else {
			return error(offset, [reg.source], false);
		}
	};
}
