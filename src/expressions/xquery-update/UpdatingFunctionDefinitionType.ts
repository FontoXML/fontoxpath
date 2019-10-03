import FunctionDefinitionType from '../functions/FunctionDefinitionType';
import UpdatingExpressionResult from '../UpdatingExpressionResult';
import { IAsyncIterator } from '../util/iterators';

type UpdatingFunctionDefinitionType = FunctionDefinitionType<
	IAsyncIterator<UpdatingExpressionResult>
>;
export default UpdatingFunctionDefinitionType;
