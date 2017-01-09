# fontoxpath

An XPath 3.1 selector engine for (XML) nodes.

To recompile the parser, run the following

```
npm install
npm run build [--skip_parser] [--skip_closure]
```

Note: Rebuilding the closure build depends on Java.

To run the tests, run

```
npm run test [--ci_mode] [--integration_tests]
```

The integration tests run all tests only using the externally public API, using the closure build.
