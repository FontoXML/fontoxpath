import IDomFacade from './domFacade/IDomFacade';
import { PositionedError } from './evaluationUtils/PositionedError';
import { adaptJavaScriptValueToSequence } from './expressions/adaptJavaScriptValueToXPathValue';
import ISequence from './expressions/dataTypes/ISequence';
import isSubtypeOf from './expressions/dataTypes/isSubtypeOf';
import sequenceFactory from './expressions/dataTypes/sequenceFactory';
import {
	SequenceMultiplicity,
	SequenceType,
	stringToSequenceType,
	ValueType,
} from './expressions/dataTypes/Value';
import DynamicContext from './expressions/DynamicContext';
import ExecutionParameters from './expressions/ExecutionParameters';
import { registerFunction } from './expressions/functions/functionRegistry';
import {
	registerStaticallyKnownNamespace,
	staticallyKnownNamespaceByPrefix,
} from './expressions/staticallyKnownNamespaces';
import { IterationHint } from './expressions/util/iterators';
import { errXQST0060 } from './expressions/xquery/XQueryErrors';
import transformXPathItemToJavascriptObject from './transformXPathItemToJavascriptObject';
import { IS_XPATH_VALUE_SYMBOL, TypedExternalValue } from './types/createTypedValueFactory';

type DynamicContextAdapter = {
	currentContext: any;
	domFacade: IDomFacade;
};

class CustomXPathFunctionError extends Error {
	constructor(innerError: Error | PositionedError, localName: string, namespaceURI: string) {
		let stack = innerError.stack;
		if (stack) {
			// On some browsers, error.stack includes error.message, on others it does not. We make sure
			// we only have the stack without message
			if (stack.includes(innerError.message)) {
				stack = stack
					.substr(stack.indexOf(innerError.message) + innerError.message.length)
					.trim();
			}

			// Some browsers show the entire call stack and some browsers only include the last 10
			// calls. We force it at the last 10 calls to prevent that recursive custom xpath
			// functions include the full call stack multiple times.
			let stackLines = stack.split('\n');
			stackLines.splice(10);

			// We always indent our XQuery stack trace lines with 2 spaces. For easier readability
			// we ensure these are indented with 4 spaces (some browsers already do this)
			stackLines = stackLines.map((line) => {
				if (line.startsWith('    ') || line.startsWith('\t')) {
					return line;
				}
				return `    ${line}`;
			});

			stack = stackLines.join('\n');
		}

		const message = `Custom XPath function Q{${namespaceURI}}${localName} raised:\n${innerError.message}\n${stack}`;
		super(message);
	}
}

function adaptXPathValueToJavascriptValue(
	valueSequence: ISequence,
	sequenceType: SequenceType,
	executionParameters: ExecutionParameters
): any | null | any[] {
	if (sequenceType.mult === SequenceMultiplicity.ZERO_OR_ONE) {
		if (valueSequence.isEmpty()) {
			return null;
		}
		return transformXPathItemToJavascriptObject(
			valueSequence.first(),
			executionParameters
		).next(IterationHint.NONE).value;
	}

	if (
		sequenceType.mult === SequenceMultiplicity.ZERO_OR_MORE ||
		sequenceType.mult === SequenceMultiplicity.ONE_OR_MORE
	) {
		return valueSequence.getAllValues().map((value) => {
			if (isSubtypeOf(value.type, ValueType.ATTRIBUTE)) {
				throw new Error('Cannot pass attribute nodes to custom functions');
			}
			return transformXPathItemToJavascriptObject(value, executionParameters).next(
				IterationHint.NONE
			).value;
		});
	}

	return transformXPathItemToJavascriptObject(valueSequence.first(), executionParameters).next(
		IterationHint.NONE
	).value;
}

function splitFunctionName(name: string | { localName: string; namespaceURI: string }): {
	localName: string;
	namespaceURI: string;
} {
	if (typeof name === 'object') {
		return name;
	}
	const parts = name.split(':');
	if (parts.length !== 2) {
		throw new Error('Do not register custom functions in the default function namespace');
	}

	const [prefix, localName] = parts;
	let namespaceURIForPrefix = staticallyKnownNamespaceByPrefix[prefix];
	if (!namespaceURIForPrefix) {
		namespaceURIForPrefix = `generated_namespace_uri_${prefix}`;
		registerStaticallyKnownNamespace(prefix, namespaceURIForPrefix);
	}

	// Register this prefix to a random namespace uri
	return {
		localName,
		namespaceURI: namespaceURIForPrefix,
	};
}

/**
 * Add a custom test for use in xpath-serialized expressions.
 *
 * @public
 *
 * @param  name - The name of this custom function. The string overload is deprecated, please register functions using the object overload
 * @param  signature - The signature of the test, as array of strings (e.g. ['item()', 'node()?', 'xs:numeric'])
 * @param  returnType - The return type of the test, as sequence type (e.g. 'xs:boolean()')
 * @param  callback - The test itself, which gets the dynamicContext and arguments passed
 */
export default function registerCustomXPathFunction(
	name: string | { localName: string; namespaceURI: string },
	signatureNames: string[],
	returnTypeName: string,
	callback: (
		domFacade: { currentContext: any; domFacade: IDomFacade },
		...functionArgs: any[]
	) => any
): void {
	const { namespaceURI, localName } = splitFunctionName(name);

	if (!namespaceURI) {
		throw errXQST0060();
	}

	const signature = signatureNames.map((x) => stringToSequenceType(x));
	const returnType = stringToSequenceType(returnTypeName);

	// tslint:disable-next-line: only-arrow-functions
	const callFunction = function (
		_dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters,
		_staticContext: any
	) {
		// Make arguments a real array instead of a array-like object
		const args = Array.from(arguments);

		args.splice(0, 3);

		const newArguments = args.map((argument, index) => {
			return adaptXPathValueToJavascriptValue(
				argument,
				signature[index],
				executionParameters
			);
		});

		// Adapt the domFacade into another object to prevent passing everything. The closure compiler might rename some variables otherwise.
		// Since the interface for domFacade (IDomFacade) is marked as extern, it will not be changed
		const dynamicContextAdapter: DynamicContextAdapter = {
			['currentContext']: executionParameters.currentContext,
			['domFacade']: executionParameters.domFacade.unwrap(),
		};

		let jsResult;
		try {
			jsResult = callback.apply(undefined, [dynamicContextAdapter, ...newArguments]);
		} catch (error) {
			// We throw our own error here so we can keep the JS stack only for custom XPath
			// functions
			throw new CustomXPathFunctionError(error, localName, namespaceURI);
		}

		if (
			jsResult &&
			typeof jsResult === 'object' &&
			Object.getOwnPropertySymbols(jsResult).includes(IS_XPATH_VALUE_SYMBOL)
		) {
			// If this symbol is present, the value has already undergone type conversion.
			const castedObject = jsResult as TypedExternalValue;
			return sequenceFactory.create(castedObject.convertedValue);
		}

		// The value is not converted yet. Do it just in time.
		const xpathResult = adaptJavaScriptValueToSequence(
			executionParameters.domFacade,
			jsResult,
			returnType
		);

		return xpathResult;
	};

	registerFunction(namespaceURI, localName, signature, returnType, callFunction);
}
