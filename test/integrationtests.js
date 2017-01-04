chai.config.truncateThreshold = 0;

const context = require.context('./specs/parsing', true, /\.tests.js$/);
context.keys().forEach(context);
