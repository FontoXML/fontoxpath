import Sequence from '../dataTypes/ISequence';

type FunctionDefinitionType = (DynamicContext, ExecutionParameters, StaticContext, ...Sequence) => Sequence;

export default FunctionDefinitionType;
