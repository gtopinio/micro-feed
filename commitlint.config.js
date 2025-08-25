module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'update', // Update existing feature
        'fix', // Bug fix
        'docs', // Documentation
        'style', // Formatting, missing semicolons, etc
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'test', // Adding missing tests
        'chore', // Maintain, build, CI, dependencies
        'perf', // Performance improvements
        'build', // Changes to build system
        'ci', // Changes to CI configuration
        'revert', // Revert a previous commit
      ],
    ],
    'subject-case': [2, 'never', ['upper-case']],
    'subject-max-length': [2, 'always', 72],
    'header-max-length': [2, 'always', 100],
  },
};
