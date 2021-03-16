import FunctionDefinitionType from '../functions/FunctionDefinitionType';
import UpdatingExpressionResult from '../UpdatingExpressionResult';
import { IIterator } from '../util/iterators';

type UpdatingFunctionDefinitionType = FunctionDefinitionType<IIterator<UpdatingExpressionResult>>;
export default UpdatingFunctionDefinitionType;
