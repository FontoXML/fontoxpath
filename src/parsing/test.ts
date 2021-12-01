import { parseUsingPrsc } from './prscParser';
import { parse } from './xPathParser';

const query = 'if (3) then 3 else 5';

const prscResult = parseUsingPrsc(query);

if (prscResult.success === true) {
	const old = parse(query, { outputDebugInfo: false, xquery: true });
	const prsc = prscResult.value;
	if (JSON.stringify(old) !== JSON.stringify(prsc)) {
		console.log('DIFFER');
		console.log('OLD');
		console.log(JSON.stringify(old, null, 4));
		console.log('PRSC');
		console.log(JSON.stringify(prsc, null, 4));
	} else {
		console.log('CORRECT!');
		console.log(JSON.stringify(prsc, null, 4));
	}
} else {
	console.log('Failed to parse:');
	console.log(prscResult.expected);
}
