import ISequence from '../dataTypes/ISequence';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import StaticContext from '../StaticContext';

type FunctionDefinitionType = (
	dynamicContext: DynamicContext,
	executionParameters: ExecutionParameters,
	staticContext: StaticContext,
	...Sequence: ISequence[]
) => ISequence;

export default FunctionDefinitionType;
