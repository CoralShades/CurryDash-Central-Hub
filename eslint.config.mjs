import coreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  ...coreWebVitals,
  ...nextTypescript,
  {
    // Downgrade new react-hooks v5 strict rules that catch pre-existing patterns.
    // These were not enforced under eslint-config-next@15 / ESLint 8.
    // Address in a dedicated cleanup sprint.
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/immutability': 'warn',
    },
  },
]

export default eslintConfig
