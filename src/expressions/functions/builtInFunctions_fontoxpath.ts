import { printAndRethrowError } from '../../evaluationUtils/printAndRethrowError';
import astHelper from '../../parsing/astHelper';
import compileAstToExpression from '../../parsing/compileAstToExpression';
import parseExpression from '../../parsing/parseExpression';
import processProlog from '../../parsing/processProlog';
import annotateAst from '../../typeInference/annotateAST';
import { AnnotationContext } from '../../typeInference/AnnotationContext';
import createAtomicValue from '../dataTypes/createAtomicValue';
import MapValue from '../dataTypes/MapValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Value, { SequenceMultiplicity, ValueType } from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionSpecificStaticContext from '../ExecutionSpecificStaticContext';
import { BUILT_IN_NAMESPACE_URIS } from '../staticallyKnownNamespaces';
import StaticContext from '../StaticContext';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';
import { IIterator, IterationHint } from '../util/iterators';
import { BuiltinDeclarationType } from './builtInFunctions';
import FunctionDefinitionType from './FunctionDefinitionType';

const fontoxpathEvaluate: FunctionDefinitionType = (
	_dynamicContext,
	executionParameters,
	staticContext,
	query,
	args
) => {
	let resultIterator: IIterator<Value>;
	let queryString: string;
	return sequenceFactory.create({
		next: () => {
			if (!resultIterator) {
				const queryValue = query.value.next(IterationHint.NONE);
				queryString = queryValue.value.value;
				const variables = (args.first() as MapValue).keyValuePairs.reduce(
					(expandedArgs, arg) => {
						expandedArgs[arg.key.value] = createDoublyIterableSequence(arg.value());
						return expandedArgs;
					},
					Object.create(null)
				);

				// Take off the context item
				const contextItemSequence = variables['.']
					? variables['.']()
					: sequenceFactory.empty();
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

				const ast = parseExpression(queryString, {
					allowXQuery: false,
					debug: executionParameters.debug,
				});

				if (executionParameters.annotateAst) {
					annotateAst(ast, new AnnotationContext(innerStaticContext));
				}

				const prolog = astHelper.followPath(ast, ['mainModule', 'prolog']);
				if (prolog) {
					processProlog(prolog, innerStaticContext);
				}
				const queryBodyContents = astHelper.followPath(ast, [
					'mainModule',
					'queryBody',
					'*',
				]);

				const selector = compileAstToExpression(queryBodyContents, {
					allowUpdating: false,
					allowXQuery: true,
				});

				try {
					selector.performStaticEvaluation(innerStaticContext);
				} catch (error) {
					printAndRethrowError(queryString, error);
				}

				const variableBindings = Object.keys(variables).reduce(
					(variablesByBindingKey, varName) => {
						variablesByBindingKey[
							executionSpecificStaticContext.lookupVariable(null, varName)
						] = variables[varName];
						return variablesByBindingKey;
					},
					Object.create(null)
				);

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
					resultIterator = selector.evaluate(
						innerDynamicContext,
						executionParameters
					).value;
				} catch (error) {
					printAndRethrowError(queryString, error);
				}
			}

			try {
				return resultIterator.next(IterationHint.NONE);
			} catch (error) {
				printAndRethrowError(queryString, error);
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
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
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
