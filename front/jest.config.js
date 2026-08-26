module.exports = {
  preset: 'react-native',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(png|jpg|jpeg|gif|webp)$': '<rootDir>/test/fileMock.js',
  },
};
