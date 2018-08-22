const chai = require('chai');

chai.config.truncateThreshold = 0;

const context = require.context('./specs', true, /\.tests.js$/);
context.keys().forEach(context);
