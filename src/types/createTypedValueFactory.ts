import DomFacade from '../domFacade/DomFacade';
import ExternalDomFacade from '../domFacade/ExternalDomFacade';
import IDomFacade from '../domFacade/IDomFacade';
import { adaptJavaScriptValueToArrayOfXPathValues } from '../expressions/adaptJavaScriptValueToXPathValue';
import Value, { ValueType } from '../expressions/dataTypes/Value';

/**
 * Any type is allowed expect: functions, symbols, undefined, and null
 *
 * @public
 */
export type ValidValue = string | number | boolean | object | Date;

/**
 * @public
 */
export type UntypedExternalValue = ValidValue | ValidValue[] | null;

export const IS_XPATH_VALUE_SYMBOL = Symbol('IS_XPATH_VALUE_SYMBOL');

/**
 * A value converted to a specific type. When passed in other usage of fontoxpath calls it will
 * be handled as the type.
 */
export type TypedExternalValue = {
	[IS_XPATH_VALUE_SYMBOL]: true;
	convertedValue: Value[];
};

/**
 * Generates a factory to create a @see TypedExternalValue for the type @see typeName.
 *
 * @param  typeName  The type into which to convert the values.
 */
export default function createTypedValueFactory(typeName: ValueType) {
	return (value: UntypedExternalValue, domFacade: IDomFacade): TypedExternalValue => {
		const wrappedDomFacade: DomFacade = new DomFacade(
			domFacade === null ? new ExternalDomFacade() : domFacade
		);

		const convertedValue = adaptJavaScriptValueToArrayOfXPathValues(
			wrappedDomFacade,
			value,
			typeName
		);

		return {
			[IS_XPATH_VALUE_SYMBOL]: true,
			convertedValue,
		};
	};
}
