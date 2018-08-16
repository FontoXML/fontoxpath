import DomFacade from '../../DomFacade';
import ExecutionParameters from '../ExecutionParameters';
import DynamicContext from '../DynamicContext';
import StaticContext from '../StaticContext';

import Sequence from '../dataTypes/Sequence';

/**
 * @typedef {function(!DynamicContext, !ExecutionParameters, !StaticContext, ...!Sequence):!Sequence}
 */
let FunctionDefinitionType;

export default FunctionDefinitionType;
