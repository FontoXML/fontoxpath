// https://stackoverflow.com/a/71553448/433626
const { defineConfig } = require('vite');

module.exports = defineConfig({
  build: {
	emptyOutDir: false,
    rollupOptions: {
      input: {
        chainreaction: './stub_chainreaction.html',
      },
      format: 'iife'
    }
  }
});
