// https://stackoverflow.com/a/71553448/433626
const { defineConfig } = require('vite');

module.exports = defineConfig({
  build: {
	emptyOutDir: false,
    rollupOptions: {
      input: {
        tilemathics: './stub_tilemathics.html',
      },
      output:
      {
        format: 'iife'
      }
    }
  }
});
