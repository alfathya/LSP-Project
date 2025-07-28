module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'controller/**/*.js',
    'model/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**',
    '!coverage/**'
  ],
  testMatch: [
    '**/__test__/**/*.test.js'
  ],
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};