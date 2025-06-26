import { defineConfig } from '@soybeanjs/eslint-config';

export default defineConfig(
  { react: true },
  {
    rules: {
      'max-params': ['error', 4],
      'no-continue': 'off',
      'class-methods-use-this': 'off'
    }
  }
);
