export default {
    testEnvironment: 'node',
    roots: ['<rootDir>/__tests__'],
    transform: {},
    moduleFileExtensions: ['js', 'mjs'],
    testPathIgnorePatterns: ['/node_modules/'],
    collectCoverageFrom: ['src/**/*.js'],
  };