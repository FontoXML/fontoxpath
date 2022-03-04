import { EvaluableExpression } from '../..';
import { printAndRethrowError } from '../../evaluationUtils/printAndRethrowError';
import staticallyCompileXPath from '../../parsing/staticallyCompileXPath';
import createAtomicValue from '../dataTypes/createAtomicValue';
import ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import MapValue from '../dataTypes/MapValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Value, { SequenceMultiplicity, ValueType, valueTypeToString } from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import { BUILT_IN_NAMESPACE_URIS } from '../staticallyKnownNamespaces';
import StaticContext from '../StaticContext';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';
import { IIterator, IterationHint } from '../util/iterators';
import { errXPTY0004 } from '../XPathErrors';
import { BuiltinDeclarationType } from './builtInFunctions';
import FunctionDefinitionType from './FunctionDefinitionType';

function getEvaluableExpressionFromValue(queryValue: Value): EvaluableExpression {
	if (isSubtypeOf(queryValue.type, ValueType.XSSTRING)) {
		// Value is XPath or XQuery source text
		return queryValue.value;
	}

	if (isSubtypeOf(queryValue.type, ValueType.ELEMENT)) {
		// Value is an XQueryX AST
		return queryValue.value.node;
	}

	throw errXPTY0004(
		`Unable to convert selector argument of type ${valueTypeToString(
			queryValue.type
		)} to either an ${valueTypeToString(ValueType.XSSTRING)} or an ${valueTypeToString(
			ValueType.ELEMENT
		)} representing an XQueryX program while calling 'fontoxpath:evaluate'`
	);
}

function buildResultIterator(
	query: ISequence,
	args: ISequence,
	staticContext: StaticContext,
	executionParameters: ExecutionParameters
): { queryValue: Value; resultIterator: IIterator<Value> } {
	const queryValue = query.first();
	const variables = (args.first() as MapValue).keyValuePairs.reduce((expandedArgs, arg) => {
		expandedArgs[arg.key.value] = createDoublyIterableSequence(arg.value());
		return expandedArgs;
	}, Object.create(null));

	// Take off the context item
	const contextItemSequence = variables['.'] ? variables['.']() : sequenceFactory.empty();
	delete variables['.'];

	try {
		const { expression, staticContext: innerStaticContext } = staticallyCompileXPath(
			getEvaluableExpressionFromValue(queryValue),
			{
				allowUpdating: false,
				allowXQuery: true,
				debug: executionParameters.debug,
				// TODO: should we inherit this from the outer evaluation somehow?
				disableCache: false,
			},
			(prefix) => staticContext.resolveNamespace(prefix),
			// Set up temporary bindings for the given variables
			Object.keys(variables).reduce((vars: { [s: string]: string }, varName) => {
				vars[varName] = varName;
				return vars;
			}, {}),
			{},
			BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
			(lexicalName, arity) => staticContext.resolveFunctionName(lexicalName, arity)
		);

		const hasContextItem = !contextItemSequence.isEmpty();
		const innerDynamicContext = new DynamicContext({
			contextItem: hasContextItem ? contextItemSequence.first() : null,
			contextItemIndex: hasContextItem ? 0 : -1,
			contextSequence: contextItemSequence,
			variableBindings: Object.keys(variables).reduce((variableByBindingKey, varName) => {
				variableByBindingKey[innerStaticContext.lookupVariable(null, varName)] =
					variables[varName];
				return variableByBindingKey;
			}, Object.create(null)),
		});

		return {
			resultIterator: expression.evaluate(innerDynamicContext, executionParameters).value,
			queryValue,
		};
	} catch (error) {
		printAndRethrowError(queryValue.value, error);
	}
}

const fontoxpathEvaluate: FunctionDefinitionType = (
	_dynamicContext,
	executionParameters,
	staticContext,
	query,
	args
) => {
	let resultIterator: IIterator<Value>;
	let queryValue: Value;
	return sequenceFactory.create({
		next: () => {
			if (!resultIterator) {
				({ resultIterator, queryValue } = buildResultIterator(
					query,
					args,
					staticContext,
					executionParameters
				));
			}

			try {
				return resultIterator.next(IterationHint.NONE);
			} catch (error) {
				printAndRethrowError(queryValue.value, error);
			}
		},
	});
};

declare const VERSION: string | undefined;

const fontoxpathVersion: FunctionDefinitionType = () => {
	let version: string;
	// TODO: Refactor when https://github.com/google/closure-compiler/issues/1601 is fixed
	version = typeof VERSION === 'undefined' ? 'devbuild' : VERSION;
	return sequenceFactory.singleton(createAtomicValue(version, ValueType.XSSTRING));
};

const declarations: BuiltinDeclarationType[] = [
	{
		argumentTypes: [
			{ type: ValueType.ITEM, mult: SequenceMultiplicity.EXACTLY_ONE },
			{ type: ValueType.MAP, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		callFunction: fontoxpathEvaluate,
		localName: 'evaluate',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FONTOXPATH_NAMESPACE_URI,
		returnType: { type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE },
	},
	{
		argumentTypes: [],
		callFunction: fontoxpathVersion,
		localName: 'version',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FONTOXPATH_NAMESPACE_URI,
		returnType: { type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
	},
];

export default {
	declarations,
};
