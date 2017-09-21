module.exports = {
  extends: ['airbnb-base', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'no-use-before-define': ['error', { functions: false }],
    'no-underscore-dangle': 'off',
    'no-param-reassign': 'off',
    'max-len': [
      'error',
      {
        code: 80,
        tabWidth: 2,
        ignoreComments: true,
        ignoreUrls: true
      }
    ],
    'prettier/prettier': [
      'error',
      {
        singleQuote: true
      }
    ],
    'import/prefer-default-export': 0
  },
  globals: {
    describe: true,
    beforeEach: true,
    inject: true,
    it: true,
    expect: true,
    afterEach: true
  },
  parser: 'babel-eslint',
  parserOptions: {
    allowImportExportEverywhere: true,
    ecmaFeatures: {
      ecmaVersion: 2017,
      impliedStrict: true
    }
  },
  env: {
    browser: true,
    jest: true
  },
  settings: {
    'import/resolver': {
      webpack: {
        config: 'webpack.config.js'
      }
    }
  }
};
