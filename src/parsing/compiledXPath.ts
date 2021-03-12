import CompiledJs from '../codegen/CompiledJs';
import DynamicContext from '../expressions/DynamicContext';
import ExecutionParameters from '../expressions/ExecutionParameters';
import Expression from '../expressions/Expression';
import ISequence from '../expressions/dataTypes/ISequence';

enum TargetKinds {
	EXPRESSION = "expression",
	COMPILED_JS = "compiled_js",
}

interface IExpression {
	kind: TargetKinds.EXPRESSION;
	value: Expression;
}

interface ICompiledJs {
	kind: TargetKinds.COMPILED_JS;
	value: CompiledJs;
}

type CompiledXPath = IExpression | ICompiledJs;

interface ICompiledXPath {
	isUpdating: boolean;
	getBucket(): string | null;
}

export {
	TargetKinds,
	CompiledXPath,
	ICompiledXPath,
};
