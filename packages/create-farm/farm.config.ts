import { defineConfig } from '@farmfe/core';

export default defineConfig({
  compilation: {
    output: {
      targetEnv: 'node'
    },
    sourcemap: false,
    presetEnv: false
  }
});
