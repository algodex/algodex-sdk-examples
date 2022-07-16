module.exports = {
  'globals': {
    'emit': true,
  },
  'env': {
    'browser': true,
    'commonjs': true,
    'es2021': true,
  },
  'extends': [
    'google',
  ],
  'parserOptions': {
    'ecmaVersion': 13,
  },
  'rules': {
    'linebreak-style': 0,
    'arrow-parens': ['error', 'as-needed'],
  },
};
