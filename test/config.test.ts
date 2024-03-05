import { test, expect, describe } from "@jest/globals";
import { Logger } from "../src/logging";
import { loadLoggersAndHandlers } from "../src/config";

const TEST_CONFIG_FILE: string = `${__dirname}/test-logging-config.json`;
const TEST_INVALID_FILE_HANDLER_FILE: string = `${__dirname}/test-config-invalid-file-handler.json`;
const TEST_VALID_FILE_HANDLER_FILE: string = `${__dirname}/test-config-valid-file-handler.json`;

/* Just used for this test, might be a smarter way to do this?
For now this works to not disable too much eslint stuff, although hacking around
to make the linter green is also not a good practices, shouldn't do this too often.
*/
interface ConfigModuleTestInterface {
	loadLoggersAndHandlers: (path?: string) => void;
}

interface LoggingModuleTestInterface {
	getLogger: (name?: string) => Logger;
}

describe.each<boolean>([true, false])("Test loading logger with useEnv as %s", (useEnv) => {
	let logging: LoggingModuleTestInterface;

	beforeAll(() => {
		// TODO: See how this works again.
		jest.resetModules();
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
		const config: ConfigModuleTestInterface = require("../src/config");
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		logging = require("../src/logging");

		if (useEnv) {
			process.env["LOGGING_CONFIGURATION_PATH"] = TEST_CONFIG_FILE;
			config.loadLoggersAndHandlers();
		}
		else {
			delete process.env["LOGGING_CONFIGURATION_PATH"];
			config.loadLoggersAndHandlers(TEST_CONFIG_FILE);
		}
	});

	type LoggerTestInput = {
		name: string,
		nTrace: number,
		nDebug: number,
		nInfo: number,
		nWarn: number,
		nError: number,
		nFatal: number
	};

	describe.each<LoggerTestInput>([
		{name: "logger1", nTrace: 0, nDebug: 0, nInfo: 1, nWarn: 1, nError: 2, nFatal: 2},
		{name: "logger2", nTrace: 0, nDebug: 0, nInfo: 0, nWarn: 0, nError: 1, nFatal: 1},
	])("Checking logger %s", (testInput: LoggerTestInput) => {

		let logger: Logger;
		let stdoutSpy: jest.SpyInstance;
		let stderrSpy: jest.SpyInstance;

		beforeAll(() => {
			stdoutSpy = jest.spyOn(console, "log").mockImplementation(() => {});
			stderrSpy = jest.spyOn(console, "error").mockImplementation(() => {});
			logger = logging.getLogger(testInput.name);
			logger.trace("Some trace message");
			logger.debug("Some debug message");
			logger.info("Some info message");
			logger.warn("Some warn message");
			logger.error("Some error message");
			logger.fatal("Some fatal message");
		});

		afterAll(() => {
			stdoutSpy.mockClear();
			stderrSpy.mockClear();
		});

		// Seems trivial, but name is 'root' if not loaded.
		test("Logger name should be correct", () => {
			expect(logger.getName()).toBe(testInput.name);
		});

		test("console.log should have been called the correct number of times", () => {
			expect(stdoutSpy).toHaveBeenCalledTimes(
				testInput.nTrace + testInput.nDebug + testInput.nInfo +
				testInput.nWarn
			);
		});

		test("console.error should have been called the correct number of times", () => {
			expect(stderrSpy).toHaveBeenCalledTimes(
				testInput.nError + testInput.nFatal
			);
		});
	});
});

describe("Configured fileHandler", () => {
	let stderrSpy: jest.SpyInstance;

	beforeEach(() => {
		stderrSpy = jest.spyOn(console, "error").mockImplementation(() => {});
	});

	afterAll(() => {
		stderrSpy.mockClear();
	});

	test("With correct config has no errors", () => {
		loadLoggersAndHandlers(TEST_VALID_FILE_HANDLER_FILE);
		expect(stderrSpy).not.toHaveBeenCalled();
	});

	test("With incorrect handler config has an error on stderr", () => {
		loadLoggersAndHandlers(TEST_INVALID_FILE_HANDLER_FILE);
		expect(stderrSpy).toHaveBeenCalled();
	});

});
