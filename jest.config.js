module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/test', '<rootDir>/modules/mailer-service/test'],
    testMatch: ['**/*.test.ts'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
};
