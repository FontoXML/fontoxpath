# Contributing to FontoXPath

:+1::tada: First off, thanks for showing interest in contributing to
FontoXPath!:tada::+1:

The XPath engine is not yet complete, though we are striving to the
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
- [The FontoXPath playground](https://xpath.playground.fontoxml.com/).

## Creating an issue

So you've found a bug, a missing feature or you have some
feedback. Great! We appreciate an issue for it on the github
repository. If the issue is a request for a feature, we will implement
it when we get to it, but a pull request would very much speed things
up.

## Creating a pull request

Wow, you actually want to help!? Even better! FontoXPath is a fun
project to work on, with a lot of hard puzzles which were tricky to
solve and even more puzzles lurking in the deep. But do not worry, we
are here to help in any possible way.

### Setting up a development environment

FontoXPath uses [the Google Closure
Compiler](https://github.com/google/closure-compiler) for an optimized
build. This requires a version of Java to be installed and in the
path. For more information on installing and running the closure
compiler, please refer to the
[documentation](https://developers.google.com/closure/compiler/) of
the Google Closure Compiler.

Running the QT3 tests requires a recent version of the QT3 test set to
be installed at `./test/assets/QT3TS-master`. The QT3 test set is
mirrored [here](https://github.com/LeoWoerteler/QT3TS/). I usually use
the following command to check out the latest test set: `curl -L
https://github.com/LeoWoerteler/QT3TS/archive/master.tar.gz | tar -xz
-C ./test/assets`

### Implementing a missing XPath function

XPath functions are an ideal place to start off as a first pull
request. They usually only require some local changes and the spec is
very readable and clear on the intended behaviour. The specification
can be found [here](https://www.w3.org/TR/xpath-functions-31/). The
[QT3 test set](https://dev.w3.org/2011/QT3-test-suite/) set usually
contains a large number of tests.

If you run into any problems when implementing what you want, do not
hesitate to ask for help. Just make the pull request with whatever you
have at that moment and we are happy to assist you in any
difficulties!

The XPath functions are usually located in the
`src/selectors/functions` folder. Just add them to the file that has
the most to do with the function you'd like to implement.

### Datastructures

FontoXPath uses lazy evaluation and we are moving towards asynchronous
evaluation. This means the main datastructure (`Sequence`) is
basically a generator. It has a number of functions which can easily
get the first item, all items, the effective boolean value, etc. We
tend to use the methods like `tryGetFirst()`, the `tryGetLength()`,
`mapCases()` and the `map()` for new code. The array functions located
at `src/selectors/functions/builtInFunctions.arrays.js` are a good
example for new functions.

An iteration item (obtained by iterating over `Sequence#value()`) can
have three forms:

- `{ ready: false, promise: Promise }`: This means the iteration
  result will be available at a later time. This may be the case if
  the iteration requires something asynchronous.
- `{ ready: true, done: false, value: <Anything> }`: We have a value
  that can be worked with.
- `{ ready: true, done: true }`: We are done iterating.

### Running the tests

FontoXPath contains two different test sets: the unit tests which you
can run with `npm run test` and the QT3 tests which you can run with
`npm run qt3tests`. They both run in Node. By running the tests with
the `--inspect` flag, they can be debugged: `npm run test -- --inspect
--inspect-brk`. The tests can also be executed with the built version
of fontoxpath. Use the `--dist` flag to do so: `npm run qt3test --
--dist`. The unit tests can be executed using `npm run integrationtests`

The JavaScript unit tests can be used while developing, since they run
quite fast. The QT3 tests can be used to verify your implementation
but they are quite slow. Running all 20k of them can take up to five
minutes.

New JavaScript tests can be added to a `*.tests.js` file somewhere in
the `test/specs` folder. Try to add a new test in a file with tests
about similar functions.

If you expect new QT3 tests to succeed, remove all except the first 13
lines from the `test/unrunnableTestCases.csv` file. The first 13 lines
are tests which are known to cause timeouts. The test runner will
generate a new version of the `test/unrunnableTestCases.csv` file. Use
`git` to find differences.

If you are adding a new feature, edit the file
`test/runnableTestSets.csv`. This file disables tests for features we
have not yet implemented.

### Building

When the new function seems to work, you can make a build of
FontoXPath. Use the command `npm run build` to make one. The Closure
Compiler may warn about some code constructs. They are usually easy to
fix. If you are running into any problems, do not hesitate to ask for
help!

The build can be double-checked using the `npm run qt3tests -- --dist`
command. The build does not have to be checked in.

### Making a commit

When you make a commit, remember to check in the current build, run
the QT3 tests one last time and paste the results in the
`unrunnableTestCases` file.
