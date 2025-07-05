module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/apps/**/services/**/*.test.ts',
    '<rootDir>/apps/**/src/**/*.spec.ts',
  ],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  roots: ['<rootDir>/apps'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/apps/web/tsconfig.json',
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/apps/web/$1',
  },
};
