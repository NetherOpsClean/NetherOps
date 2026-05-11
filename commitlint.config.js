module.exports = {
  extends: [require.resolve('@commitlint/config-conventional')],
  rules: {
    'scope-enum': [
      2,
      'always',
      ['server', 'docker', 'auth', 'infra', 'ci', 'deps'],
    ],
  },
};
