import CompiledJs from '../codegen/CompiledJs';
import astHelper, { IAST } from './astHelper';
import { CompiledXPath, TargetKinds } from './compiledXPath';

function compile(ast: IAST): string {
	const name = ast[0];
	console.log('compiler ast node: ', name);

	switch (name) {
		case 'pathExpr':
			return pathExpr(ast);
		default:
			throw new Error(`Unsupported AST node: ${name} `);
	}
}

function pathExpr(ast: IAST): string {
	const rawSteps = astHelper.getChildren(ast, 'stepExpr');

	const steps = rawSteps.map((step) => {
		console.log('step: ', step);
	});

	return "console.log('HELLO WORLD!, dynamicContext');";
}

export {
	CompiledJs
}

export default function(xPathAst: IAST): CompiledXPath {
	console.log('compiling this AST: ', xPathAst);
	const js = compile(xPathAst);
	return { kind: TargetKinds.COMPILED_JS, value: new CompiledJs(js) };
}
