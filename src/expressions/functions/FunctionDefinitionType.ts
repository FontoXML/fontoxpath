import ISequence from '../dataTypes/ISequence';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import StaticContext from '../StaticContext';

type FunctionDefinitionType<FunctionReturnType = ISequence> = (
	dynamicContext: DynamicContext,
	executionParameters: ExecutionParameters,
	staticContext: StaticContext,
	...Sequence: ISequence[]
) => FunctionReturnType;

export default FunctionDefinitionType;
