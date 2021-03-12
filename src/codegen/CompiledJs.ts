import DynamicContext from "../expressions/DynamicContext";
import ExecutionParameters from "../expressions/ExecutionParameters";
import ISequence from "../expressions/dataTypes/ISequence";

class CompiledJs {
	public compiledExpression: string;

	constructor(compiled: string) {
		this.compiledExpression = compiled;
	}

	public evaluateMaybeStatically(
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters
	): ISequence {
		return Function('dynamicContext', this.compiledExpression)(dynamicContext);
	}
}

function blaat(helloworld) {}

export default CompiledJs;
