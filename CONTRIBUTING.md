# Contributing to FontoXPath

:+1::tada: First off, thanks for showing interest in contributing to
FontoXPath!:tada::+1:

The XPath/XQuery engine is not yet complete, though we are striving to the
highest grade of usability. This means that functions get to be
implemented as soon as we want to use them. The [XPath 3.1
spec](https://www.w3.org/TR/xpath-31/) and the accompanying [XPath
functions spec](https://www.w3.org/TR/xpath-functions-31/) are quite
large and intricate and we do not have nearly enough time to implement
all of it. We would love some help from you!

Here are some important resources:

- [The XPath 3.1 spec](https://www.w3.org/TR/xpath-31/).
- [The XPath functions
  spec](https://www.w3.org/TR/xpath-functions-31/).
- [The XQuery 3.1 spec](https://www.w3.org/TR/xquery-31/).
- [The XQuery Update Facility 3.0
  spec](https://www.w3.org/TR/xquery-update-30/).
- [The FontoXPath playground](https://xpath.playground.fontoxml.com/).

## Creating an issue

So you've found a bug, a missing feature or you have some
feedback. Great! We appreciate an issue for it on the GitHub
repository. If the issue is a request for a feature, we will implement
it when we get to it, but a pull request would very much speed things
up.

## Creating a pull request

Wow, you actually want to help!? Even better! FontoXPath is a fun
project to work on, with a lot of hard puzzles which were tricky to
solve and even more puzzles lurking in the deep. But do not worry, we
are here to help in any possible way.

### Setting up a development environment

FontoXPath is written in
[TypeScript](https://www.typescriptlang.org/), which is transformed to
JavaScript using [tsickle](https://github.com/angular/tsickle) and
compiled with [the Google Closure
Compiler](https://github.com/google/closure-compiler) for an optimized
build.

Running the XML Query Test suite (QT3) requires a recent version of
the QT3 test set to be installed at `./test/assets/QT3TS`. The QT3
test set is mirrored
[here](https://github.com/LeoWoerteler/QT3TS/). Running the tests for
XQuery Update Facility requires a recent version of the XQUTS test set
to be installed at `./test/assets/XQUTS`. There exists a mirror
[here](https://github.com/LeoWoerteler/XQUTS).

FontoXPath uses XQueryX as a parser format, this can be tested using
the XQueryX test set which is included in the QT3 test set. To be able
to run these tests, extract the `xqueryx.zip` file to the
`test/assets/QT3-master/xqueryx` folder.

In short, execute the following commands on Linux:

```sh
 mkdir -p ./test/assets/XQUTS ./test/assets/QT3TS
 curl -L https://github.com/LeoWoerteler/QT3TS/archive/master.tar.gz | tar -xz -C ./test/assets/QT3TS --strip-components=1
 curl -L https://github.com/LeoWoerteler/XQUTS/archive/master.tar.gz | tar -xz -C ./test/assets/XQUTS --strip-components=1
 unzip -q test/assets/QT3TS/xqueryx.zip -d ./test/assets/QT3TS/
```

Or on Windows:

```posh
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest "https://github.com/LeoWoerteler/QT3TS/archive/master.zip" -Out ./test/assets/QT3TS.zip
Invoke-WebRequest "https://github.com/LeoWoerteler/XQUTS/archive/master.zip" -Out ./test/assets/XQUTS.zip
Expand-Archive ./test/assets/QT3TS.zip -DestinationPath ./test/assets/QT3TS-extracted -Force
Move-Item ./test/assets/QT3TS-extracted/QT3TS-master ./test/assets/QT3TS
Expand-Archive ./test/assets/QT3TS/xqueryx.zip -DestinationPath ./test/assets/QT3TS/xqueryx-extracted -Force
Move-Item ./test/assets/QT3TS/xqueryx-extracted/xqueryx ./test/assets/QT3TS/xqueryx
Expand-Archive ./test/assets/XQUTS.zip -DestinationPath ./test/assets/XQUTS-extracted -Force
Move-Item ./test/assets/XQUTS-extracted/XQUTS-master ./test/assets/XQUTS
Remove-Item ./test/assets/QT3TS.zip
Remove-Item ./test/assets/XQUTS.zip
Remove-Item ./test/assets/QT3TS-extracted
Remove-Item ./test/assets/QT3TS/xqueryx-extracted
Remove-Item ./test/assets/XQUTS-extracted
```

And to run the tests:

```sh
npm run test
# Or
npm run qt3tests
# Or
npm run xqutstests
```

### Implementing a missing XPath function

XPath functions are an ideal place to start off as a first pull
request. They usually only require some local changes and the spec is
very readable and clear on the intended behaviour. The specification
can be found [here](https://www.w3.org/TR/xpath-functions-31/). The
[QT3 test set](https://dev.w3.org/2011/QT3-test-suite/) set usually
contains tests which cover the function.

If you run into any problems when implementing what you want, do not
hesitate to ask for help. Just make the pull request with whatever you
have at that moment and we are happy to assist you in any
difficulties!

The XPath functions are usually located in the
`src/selectors/functions` folder. Just add them to the file that has
the most to do with the function you'd like to implement.

### Data structures

FontoXPath uses lazy evaluation. This means the main data structure (`Sequence`) is
basically a generator. It has a number of functions which can easily
get the first item, all items, the effective boolean value, etc. We
tend to use the methods like `first()`, `length()`,
`mapCases()` and `map()` for new code. The array functions located
at `src/selectors/functions/builtInFunctions.arrays.ts` are a good
example for new functions.

An iteration item (obtained by iterating over `Sequence#value`) can
have three forms:

- `{ done: false, value: <any> }`: We have a value.
- `{ done: true }`: We are done iterating.

### Debugging

You can run a [demo page (http://localhost:8080)](http://localhost:8080)
which can be used for debugging. This page is in it's own subpackage
in the demo folder. This page aims to do as little code transpilation as
possible in order to make debugging easy. Run it by cd-ing into it,
running `npm install`, followed by an `npm start`.

This script runs the typescript compiler in watch mode and serves a simple test application.

### Running the tests

FontoXPath contains different test sets:

|Tests|Run command|
|-|-|
|The unit tests|`npm run test`|
|The QT3 tests|`npm run qt3tests`|
|The QT3 XQueryX tests|`npm run qt3testsxqueryx`|
|The XQUTS tests|`npm run xqutstests`|
|The XQUTS XQueryX tests|`npm run xqutstestsxqueryx`|

They all run in Node. By running the tests with the `--inspect` flag,
they can be debugged by the browser: `npm run test -- --inspect
--inspect-brk`. The tests can also be executed with the built version
of fontoxpath. Use the `--dist` flag to do so: `npm run qt3test --
--dist`. The unit tests can be executed using `npm run
integrationtests`

The JavaScript unit tests can be used while developing, since they run
quite fast. The other tests can be used to verify your implementation
but they are quite slow. Running all of them will likely take several
minutes.

New JavaScript tests can be added to a `*.tests.ts` file somewhere in
the `test/specs` folder. Try to add a new test in a file with tests
about similar functions.

If you want to create a new test file, it should be placed in
the`test/specs/expressions` folder if the tests can only be ran
against the unminified code. If they do not require minified code
(ie. use only public, external API, they can be placed in the
`test/specs/parsing` folder.

If you expect new tests to succeed run `npm run alltests --
--regenerate`, this will update the csv files which contain failing
tests. Use `git` to find differences.

If you are adding a new feature, don't forget to edit the file
`test/runnableTestSets.csv`. This file disables tests for features we
have not yet implemented.

### Running benchmarks

FontoXPath has 2 options to run benchmarks.

In one we run benchmarks over scenarios defined in javascript which are located in the directory
`/performance`. These can be run using [fonto-benchmark-runner commands](https://www.npmjs.com/package/@fontoxml/fonto-benchmark-runner)
which will run the benchmarks in the console. Note that some tests use assets from the QT3TS, see
the steps in [Setting up a development environment](#setting-up-a-development-environment).

To check the performance of fontoxpath with the qt3tests, we pick a random subset of the qt3tests as
running all will take too long (hours). This random subset is not checked in but can be generated
using `npm run qt3performance -- --regenerate [<number-of-tests>]`, this will create and populate
`test/runnablePerformanceTestNames.csv`. You can manually edit this file to run specific tests. By
storing these in a file you can run the same set even when switching between different commits. With
the generated file present you can run the tests using `npm run qt3performance`, this will run a
benchmark for each qt3 test using [benchmarkjs](https://benchmarkjs.com/).

### Running the fuzzer

FontoXPath comes with a fuzzer that can find bugs automatically. The fuzzer has a corpus of ~200 XPath expressions which are randomly mutated.

To run the fuzzer, run the following command in the root of this repository:

```
npm run fuzzer
```

The fuzzer is located in the `./fuzzer/` directory. The fuzzer is split across several components:

1. `fuzzer.ts` - provides abstractions to support different type of fuzzer implementations.
1. `engine.ts` - contains the runner which scales, monitors and reports progress of a fuzzer.
1. `corpus_based_fuzzer.ts` - well, the name says it all.
1. `index.ts` - main entry point for the `npm run fuzzer` command, currently executes a `CorpusBasedFuzzer` with the `iso_corpus.ts`.

### Building

When the new function seems to work, you can make a build of
FontoXPath. Use the command `npm run build` to make one. The Closure
Compiler may warn about some code constructs. They are usually easy to
fix. If you are running into any problems, do not hesitate to ask for
help!

The build can be double-checked using:

```sh
npm run qt3tests -- --dist
npm run qt3testsxqueryx -- --dist
npm run xqutstests -- --dist
npm run xqutstestsxqueryx -- --dist
```

The build does not have to be checked in.

### Publishing

First and foremost, you'll need to have publish access to the
FontoXPath NPM repository. If you have that, you can publish using the
following steps:

```sh
npm version (major|minor|patch|prerelease);
git push;
git push --tags;
npm publish;
```
