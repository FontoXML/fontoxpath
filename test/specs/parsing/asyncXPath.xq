let $baseUrl := 'https://raw.githubusercontent.com/LeoWoerteler/QT3TS/master/',
	$catalog := fontoxpath:fetch($baseUrl || 'catalog.xml'),
	$environmentsByName := $catalog/*:catalog/*:environment ! map:entry(@name => string(), .) => map:merge(),
	$testSets := $catalog/*:catalog/*:test-set/@file/string()!fontoxpath:fetch($baseUrl || .) => head()
return for $test in $testSets/*:test-set/*:test-case return fontoxpath:evaluate($test/*:test => string(), map{})
