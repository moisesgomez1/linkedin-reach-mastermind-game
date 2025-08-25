import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import configPrettier from 'eslint-config-prettier';

export default defineConfig([
    { ignores: ['dist/**', 'build/**', 'node_modules/**'] },

    ...tseslint.configs.recommended,

    configPrettier,
    {
        plugins: { prettier },
        rules: {
            'prettier/prettier': 'error',
        },
    },
]);
