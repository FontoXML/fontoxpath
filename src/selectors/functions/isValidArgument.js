export default function isValidArgument (argumentTypes, argument) {
	// argumentTypes is something like 'xs:string?' or 'map(*)'
	var parts = argumentTypes.match(/^(.*[^+?*])([\+\*\?])?$/);
	var type = parts[1],
        multiplicity = parts[2];
    switch (multiplicity) {
        case '?':
            if (!argument.isEmpty() && !argument.isSingleton()) {
                return false;
            }
            break;

        case '+':
            if (argument.isEmpty()) {
                return false;
            }
            break;

        case '*':
            break;

        default:
            if (!argument.isSingleton()) {
                return false;
            }
    }

    return argument.value.every(function (argumentItem) {
        return argumentItem.instanceOfType(type);
    });
}
