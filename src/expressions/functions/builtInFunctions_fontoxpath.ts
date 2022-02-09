import { ElementNodePointer } from '../../domClone/Pointer';
import { printAndRethrowError } from '../../evaluationUtils/printAndRethrowError';
import astHelper, { IAST } from '../../parsing/astHelper';
import compileAstToExpression from '../../parsing/compileAstToExpression';
import convertXmlToAst from '../../parsing/convertXmlToAst';
import parseExpression from '../../parsing/parseExpression';
import processProlog from '../../parsing/processProlog';
import annotateAst from '../../typeInference/annotateAST';
import { AnnotationContext } from '../../typeInference/AnnotationContext';
import createAtomicValue from '../dataTypes/createAtomicValue';
import ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import MapValue from '../dataTypes/MapValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Value, { SequenceMultiplicity, ValueType, valueTypeToString } from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import ExecutionSpecificStaticContext from '../ExecutionSpecificStaticContext';
import { BUILT_IN_NAMESPACE_URIS } from '../staticallyKnownNamespaces';
import StaticContext from '../StaticContext';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';
import { IIterator, IterationHint } from '../util/iterators';
import { errXPTY0004 } from '../XPathErrors';
import { BuiltinDeclarationType } from './builtInFunctions';
import FunctionDefinitionType from './FunctionDefinitionType';

function createAstFromValue(queryValue: Value, debug: boolean): IAST {
	if (isSubtypeOf(queryValue.type, ValueType.XSSTRING)) {
		return parseExpression(queryValue.value as string, {
			allowXQuery: false,
			debug,
		});
	}

	if (isSubtypeOf(queryValue.type, ValueType.ELEMENT)) {
		const nodePointer: ElementNodePointer = queryValue.value;

		try {
			return convertXmlToAst(nodePointer.node);
		} catch (error) {
			throw errXPTY0004(
				'The XML structure passed as an XQueryX program was not valid XQueryX'
			);
		}
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

	const executionSpecificStaticContext = new ExecutionSpecificStaticContext(
		(prefix) => staticContext.resolveNamespace(prefix),
		Object.keys(variables).reduce((vars: { [s: string]: string }, varName) => {
			vars[varName] = varName;
			return vars;
		}, {}),
		BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		(lexicalName, arity) => staticContext.resolveFunctionName(lexicalName, arity)
	);
	const innerStaticContext = new StaticContext(executionSpecificStaticContext);

	const ast = createAstFromValue(queryValue, executionParameters.debug);

	const prolog = astHelper.followPath(ast, ['mainModule', 'prolog']);
	if (prolog) {
		processProlog(prolog, innerStaticContext);
	}

	annotateAst(ast, new AnnotationContext(innerStaticContext));

	const queryBodyContents = astHelper.followPath(ast, ['mainModule', 'queryBody', '*']);

	const selector = compileAstToExpression(queryBodyContents, {
		allowUpdating: false,
		allowXQuery: true,
	});

	try {
		selector.performStaticEvaluation(innerStaticContext);
	} catch (error) {
		printAndRethrowError(queryValue.value, error);
	}

	const variableBindings = Object.keys(variables).reduce((variablesByBindingKey, varName) => {
		variablesByBindingKey[executionSpecificStaticContext.lookupVariable(null, varName)] =
			variables[varName];
		return variablesByBindingKey;
	}, Object.create(null));

	const context = contextItemSequence.isEmpty()
		? {
				contextItem: null,
				contextItemIndex: -1,
				contextSequence: contextItemSequence,
				variableBindings,
		  }
		: {
				contextItem: contextItemSequence.first(),
				contextItemIndex: 0,
				contextSequence: contextItemSequence,
				variableBindings,
		  };

	const innerDynamicContext = new DynamicContext(context);

	try {
		return {
			resultIterator: selector.evaluate(innerDynamicContext, executionParameters).value,
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
