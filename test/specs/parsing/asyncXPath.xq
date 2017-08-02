let $baseUrl := 'https://raw.githubusercontent.com/LeoWoerteler/QT3TS/master/',
  $catalog := fontoxpath:fetch($baseUrl || 'catalog.xml') => trace('catalog'),
	$environmentsByName := $catalog/*:catalog/*:environment ! map:entry(@name => string() => trace("env"), .) => map:merge(),
	$testSets := $catalog/*:catalog/*:test-set/@file/string()!fontoxpath:fetch($baseUrl || .) => head() => trace("$testSets")
return for $testSet in $testSets return
	for $test in $testSet/*:test-set/*:test-case return fontoxpath:evaluate($test/*:test, map{})
