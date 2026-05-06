import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
	globalIgnores([
		// dependencies
		'node_modules/**',

		// build output
		'dist/**',
		'build/**',
		'coverage/**',

		// env files
		'.env',
		'.env.*',

		// logs
		'logs/*',
		'*.log',
		'npm-debug.log*',
		'yarn-debug.log*',
		'yarn-error.log*',
		'pnpm-debug.log*',

		// OS / editors
		'.DS_Store',
		'Thumbs.db',
		'.vscode/*',
		'.idea/*',

		// misc
		'.tsbuildinfo',

		// prisma
		'prisma/migrations/*',

		// runtime
		'uploads/*',
		'tmp/*',
		'temp/*',

		// docker
		'docker-data/*',

		// generated
		'src/generated/*'
	]),

	{
		files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		plugins: { js },
		extends: ['js/recommended'],
		languageOptions: { globals: globals.browser }
	},

	tseslint.configs.recommended,

	prettier,

	{
		rules: {
			'prefer-const': 'warn',
			'no-var': 'warn',

			'arrow-parens': ['warn', 'as-needed'],
			'comma-dangle': ['warn', 'never']
		}
	}
])
