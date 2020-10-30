import {
	complete,
	map,
	optional,
	or,
	Parser,
	preceded,
	recognize,
	followed,
	star,
	then,
	token,
} from 'prsc';

type Program = string[];

// nodeId: uint4(type)uint8(name)uint16(counter)
// functions

/**
 * let $x as item() := if(math:ranodm-number-generator()?value > 0.5) then "poep" else 5 return typeswitch($x) {case xs:integer then 1 default 2}
 */

// child::a/child::b => empty()

type StaticContext = {
	expectedResultKind: 'ebv' | 'first' | 'all'
}

/**
 * (empty (path (step child a) (step child a)))
 */

 type XPathParser = Parser<(st: StaticContext)=>string>


/**
 * (if (empty ...) (...) (...))
 *
 */

type XPathParsert = Parser<{
asEBV: (st: StaticContext) => string,
asEmpty: (st: StaticContext) => string,
asFullSet: (st: StaticContext) => string
}>

/**
 * path -> {
 *
 * function* () {
 *   const contextSequence = [contextItem];
 *   {{steps.reduceRight(step => buildStep(innerStep), 'yield contextItem')}}
 * }
 * }
 *
 * empty = arg -> {
 * {type: 'xs:boolean', value:({{arg}})().next().done === false}
 * }
 *
 * emptyGen = arg -> {
 * (function*(){ yield {type: 'xs:boolean', value:({{arg}})().next().done === false}})
 * }
 *
 *
 * if = cond, then, else -> {
 * if (cond.next().value === true) {}
 * }
 *
 *
 */
function prrt() {
	const contextNode = null;
return (function* ()  {
	for (const child of contextNode.children) {
   		if (child.name !== 'a') { continue;}
	   	for (const grandchild of child.children) {
		  if (grandchild.name !== 'b') continue;
			yield grandchild;
   		}
	}
})().next().done === false
}

// function outputNodeTest (program: Program, index: number, localPart: number|null, namespaceURI: number|null) {
// 	program[index] = (
// 		`contextItem.nodeType === 1 &&
// contextItem.localName === "${localPart}"${
// 			namespaceURI
// 				? ` && domFacade.getNamespaceURI(contextItem)  === "${namespaceURI}"`
// 				: ''
// 		}`);
// 	};
// }


function compileNodeTest (program: Program, name: Name, registerName: (name: string) => number) {
	const localPart = (name.localPart) ? registerName(name.localPart) : null;
	let namespaceURI = (name.namespaceURI) ? registerName(name.namespaceURI) : null;
	const prefix = (name.prefix) ? registerName(name.prefix) : null;

	const programIndex = program.push('TESTPLACEHOLDER');

	return (staticContext) => {
		if (prefix) {
			namespaceURI = staticContext.resolvePrefix(prefix);
		}

		outputNodeTest(program, programIndex, localPart, namespaceURI);
	}
}


const whitespaceCharacter = or([
	token('\u0020'),
	token('\u0009'),
	token('\u000D'),
	token('\u000A'),
]);
const _ = star(whitespaceCharacter);

// Ongeveer:
/**
 * Meerdere implementaties: als we een specifieke positie willen (preceding-sibling::*[1] dus predicate statisch bekend als precies 1 nummer),
 *
 * Dan in reverse document order traversen: van eind naar voor, zoals normaal
 *
 * ANDERS: in normale document order traversen en gewoon meegeven of we empty/singletonnes willen, de eerste willen of alles
 *
 * Hierdoor doen we nesting v loops!
 */
const reverseStep = token('nope');

const mapSingle = (parser: Parser<any>, value: any) => map(parser, () => value);

const wildCard = token('*');

const regexToken: (regex: RegExp) => Parser<string> = (regex: RegExp) => (input, offset) => {
	if (input.length <= offset) {
		return {
			success: false,
			fatal: false,
			offset,
			expected: [regex + ''],
		};
	}
	return regex.test(input[offset])
		? {
				offset: offset + 1,
				success: true,
				value: input[offset],
		  }
		: {
				success: false,
				fatal: false,
				offset,
				expected: [regex + ''],
		  };
};

const ncNameStartChar = regexToken(
	/[A-Z_a-z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/
);

const ncNameChar = or([ncNameStartChar, regexToken(/[\-\.0-9\xB7\u0300-\u036F\u203F\u2040]/)]);

const ncName = recognize(preceded(ncNameStartChar, star(ncNameChar)));

const prefix = ncName;

const localPart = ncName;

const prefixedName: Parser<Name> = then(
	prefix,
	preceded(token(':'), localPart),
	(prefixPart, local) => ({
		prefix: prefixPart,
		localPart: local,
	})
);

const unPrefixedName: Parser<Name> = map(localPart, (local) => ({
	localPart: local,
}));

const QName: Parser<Name> = or([prefixedName, unPrefixedName]);
const eQName = QName;

const nameTest = or([
	mapSingle(wildCard, 'true'),
	map(
		eQName,
		(name: Name) => `contextItem.nodeType === 1 &&
		 contextItem.localName === "${name.localPart}"${
		 			name.namespaceURI
		 				? ` && domFacade.getNamespaceURI(contextItem)  === "${name.namespaceURI}"`
		 				: ''
		 		}`
	),
]);

const kindTest = or([mapSingle(token('element()'), 'contextItem.nodeType === 1')]);
const nodeTest = or([kindTest, nameTest]);

type Name = {
	prefix?: string;
	localPart?: string;
	namespaceURI?: string;
};

type JSExpression = string;
type JSStatements = string;


const predicateList = token('nope');
const forwardAxis: Parser<(test: JSExpression) => (st: StaticContext, innerStep: JSStatements) => string> = or([
	mapSingle(
		token('self::'),
		(test: JSExpression) => (staticContext, innerStep: JSStatements) => `
	if (${test}) {
	${innerStep}
	}`
	),
	mapSingle(
		token('parent::'),
		(test: JSExpression) => (staticContext, innerStep: JSStatements) => `

	const parentContextItem = domFacade.getParentNode(contextItem);
	{
		let contextItem = parentContextItem;
		if (${test}) {
			${innerStep}
		}
	}

`
	),
	mapSingle(
		token('child::'),
		(test: JSExpression) => (staticContext, innerStep: JSStatements) => `
	for (let item = domFacade.getFirstChild(contextItem); item; item = domFacade.getNextSibling(contextItem)) {
		const contextItem = item;
		if (${test}) {
			${innerStep}
		}
	}
`
	),
]);

const forwardStep: Parser<string> = then(forwardAxis, nodeTest, (axis, nodeTest: string) =>
	axis(nodeTest)
);



const axisStep: Parser<string> = then(
	or([reverseStep, forwardStep]),
	optional(predicateList),
	(stepExpr, predicates) => {
		return stepExpr;
	}
);


const path: Parser<any> = then(axisStep, star(preceded(token("/"), axisStep)), (firstStep, restSteps)=> {
	const steps = [firstStep, ...restSteps];

	return (staticContext) => {
		let innerStep = '';
		let preamble = '';

		switch(staticContext.expectedResultKind) {

			// TODO: we hebben het nu alleen over nodes. elke sequence van 1 of meer nodes is true.
			case 'ebv': {
				preamble = 'let result = false;';
				innerStep = 'result = true; break;'
				break;
			}
			case 'first': {
				preamble = 'let result = null;';
				innerStep = 'result = contextItem; break;'
				break;
			}
			case 'all': {
				preamble = 'const result = [];';
				innerStep = 'result.push(contextItem)'
				break;
			}
		}

		const stepProgram = steps.reduceRight((childStep: string, buildStepProgram) => buildStepProgram(staticContext, childStep), innerStep);

		return `${preamble}
		do {

			${stepProgram}
		}while (false)`;
	};
})


export const parse = (source: string): string => {
	const parser = complete(path);
	const parseResult = parser(source, 0);
	if (!parseResult.success) {
		return parseResult;
	}

	return `
${parseResult.value({expectedResultKind: 'first'})}
return result
`;
};
