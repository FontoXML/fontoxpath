// https://stackoverflow.com/a/71553448/433626
const { defineConfig } = require('vite');

module.exports = defineConfig({
  build: {
    rollupOptions: {
      input: {
        boxup: './stub.html'
      }
    }
  }
});
