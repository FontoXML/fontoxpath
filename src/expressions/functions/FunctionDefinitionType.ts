import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import StaticContext from '../StaticContext';
import ISequence from '../dataTypes/ISequence';

type FunctionDefinitionType = (
	dynamicContext: DynamicContext,
	executionParameters: ExecutionParameters,
	staticContext: StaticContext,
	...Sequence: Array<ISequence>
) => ISequence;

export default FunctionDefinitionType;
