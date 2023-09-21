import { IAST } from './astHelper';
import { QNameAST } from './literalParser';

export function isAttributeTest(test: IAST): boolean {
	return test[0] === 'attributeTest' || test[0] === 'schemaAttributeTest';
}

export function wrapInSequenceExprIfNeeded(exp: IAST): IAST {
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
			') does not reference a valid codePoint.',
	);
}

export function parseCharacterReferences(input: string): string {
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

export function accumulateDirContents(
	parts: (IAST | string)[],
	expressionsOnly: boolean,
	normalizeWhitespace: boolean,
) {
	if (!parts.length) {
		return [];
	}
	let result = [parts[0]];
	for (let i = 1; i < parts.length; ++i) {
		const prevResult = result[result.length - 1];
		if (typeof prevResult === 'string' && typeof parts[i] === 'string') {
			result[result.length - 1] = prevResult + parts[i];
			continue;
		}
		result.push(parts[i]);
	}

	if (typeof result[0] === 'string' && result.length === 0) {
		return [];
	}

	result = result.reduce((filteredItems, item, i) => {
		if (typeof item !== 'string') {
			filteredItems.push(item);
		} else if (!normalizeWhitespace || !/^\s*$/.test(item)) {
			// Not only whitespace
			filteredItems.push(parseCharacterReferences(item));
		} else {
			const next = result[i + 1];
			if (next && next[0] === 'CDataSection') {
				filteredItems.push(parseCharacterReferences(item));
			} else {
				const previous = result[i - 1];
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
		for (let i = 0; i < result.length; i++) {
			if (typeof result[i] === 'string') {
				result[i] = ['stringConstantExpr', ['value', result[i]]];
			}
		}
	}
	return result;
}

function getQName(qname: QNameAST): string {
	return qname[0].prefix ? qname[0].prefix + ':' + qname[1] : qname[1];
}

export function assertEqualQNames(a: QNameAST, b: QNameAST) {
	const nameA = getQName(a);
	const nameB = getQName(b);
	if (nameA !== nameB) {
		throw new Error(
			'XQST0118: The start and the end tag of an element constructor must be equal. "' +
				nameA +
				'" does not match "' +
				nameB +
				'"',
		);
	}
}
