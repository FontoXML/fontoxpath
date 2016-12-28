export default function argumentListToString (argumentList) {
    return argumentList.map(function (argument) {
        if (argument.isEmpty()) {
            return 'item()?';
        }

        if (argument.isSingleton()) {
            return argument.value[0].primitiveTypeName;
        }
        return argument.value[0].primitiveTypeName + '+';
    }).join(', ');
}
