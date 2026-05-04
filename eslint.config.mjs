import js from '@eslint/js'
import { defineConfig, globalIgnores, } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default defineConfig([
	globalIgnores(['dist/**', 'node_modules/**',],),

	{
		files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',],
		plugins: { js, },
		extends: ['js/recommended',],
		languageOptions: { globals: globals.browser, },
	},

	tseslint.configs.recommended,

	prettier,

	{
		rules: {
			'prefer-const': 'warn',
			'no-var': 'warn',

			'arrow-parens': ['warn', 'as-needed',],
			'indent': ['warn', 'tab',],
			'comma-dangle': ['warn', 'always',],
		},
	},
],)