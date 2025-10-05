/** @type {import('prettier').Config} */
module.exports = {
  // Basic formatting
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  tabWidth: 2,
  useTabs: false,

  // Line length
  printWidth: 80,

  // Bracket spacing
  bracketSpacing: true,
  bracketSameLine: false,

  // Arrow functions
  arrowParens: 'avoid',

  // JSX
  jsxSingleQuote: true,

  // End of line
  endOfLine: 'lf',

  // Embedded language formatting
  embeddedLanguageFormatting: 'auto',

  // HTML whitespace sensitivity
  htmlWhitespaceSensitivity: 'css',

  // Prose wrap
  proseWrap: 'preserve',

  // File overrides
  overrides: [
    {
      files: '*.md',
      options: {
        proseWrap: 'always',
        printWidth: 80,
      },
    },
    {
      files: '*.json',
      options: {
        printWidth: 120,
      },
    },
    {
      files: '*.{yml,yaml}',
      options: {
        singleQuote: false,
      },
    },
  ],
};
