// eslint-disable-next-line no-undef
const process = require("process");

process.env = Object.assign(process.env, {
	APP_ENV: "jest",
});

// eslint-disable-next-line no-undef
module.exports = {
	preset: "ts-jest",
	setupFiles: ["./jest.env.js"],
	testEnvironment: "jest-environment-node",
	collectCoverage: true,
	globals: {
		NODE_ENV: "test",
	},
};
