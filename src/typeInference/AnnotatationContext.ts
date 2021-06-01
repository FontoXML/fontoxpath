import { SequenceType } from '../expressions/dataTypes/Value';
import StaticContext from '../expressions/StaticContext';

export class AnnotationContext {
	public staticContext?: StaticContext;

	private _scopeIndex: number = 0;
	private _variableScope: { [key: string]: SequenceType }[];

	constructor(staticContext?: StaticContext) {
		this.staticContext = staticContext;
		this._variableScope = [{}];
	}

	public getVariable(varName: string): SequenceType {
		for (let i = this._scopeIndex; i >= 0; i--) {
			const variableType = this._variableScope[i][varName];
			return variableType;
		}

		throw new Error('XPST0008, The variable ' + varName + ' is not in scope.');
	}

	public insertVariable(varName: string, varType: SequenceType): void {
		if (this._variableScope[this._scopeIndex][varName]) {
			// TODO: change the error being thrown in here to adhere the "error code" code.
			throw new Error(
				`Another variable of in the scope ${this._scopeIndex} with the same name ${varName} already exists`
			);
		}

		this._variableScope[this._scopeIndex][varName] = varType;
	}

	public popScope(): void {
		if (this._scopeIndex > 0) {
			this._scopeIndex--;
			this._variableScope.pop();
			return;
		}

		throw new Error('Variable scope out of bound');
	}

	public pushScope(): void {
		this._scopeIndex++;
		this._variableScope.push({});
	}

	public removeVariable(varName: string): SequenceType {
		for (let i = this._scopeIndex; i >= 0; i--) {
			const variableType = this._variableScope[i][varName];
			if (variableType) {
				// Remove the element here
				delete this._variableScope[i][varName];
				return;
			}
		}

		throw Error('XPST0008, The variable ' + varName + ' is not in scope.');
	}
}
