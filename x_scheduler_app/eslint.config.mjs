// @ts-check

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier'; // <-- Correct import for this
import globals from 'globals';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**'],
  },

  // Base ESLint recommended rules
  eslint.configs.recommended,

  // TypeScript-ESLint recommended rules
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  
  // --- PRETTIER CONFIGURATION (THE FIX) ---
  // Yeh ESLint ke un sabhi rules ko disable kar dega jo Prettier ke saath anavashyak ya conflicting hain.
  // Isko hamesha aakhir mein rakhein.
  prettierConfig,
  // ----------------------------------------

  // Main configuration for your project files
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
    },
    // Yeh section 'files' property ke andar hona chahiye taaki yeh sirf .ts files par lage
    files: ['src/**/*.ts'], 
    rules: {
      // Your custom rule overrides
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  },
);