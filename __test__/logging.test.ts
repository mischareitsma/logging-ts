import { test, expect, describe, jest } from "@jest/globals";
import { LogEvent, LogLevel, Logger, addLogger, allLogLevels, getLogger } from "../src";
import { TestLoggingHandler } from "./testUtils";

describe.each([
	{level: LogLevel.TRACE, name: "TRACE", severity: 0, eventName: "logTrace"},
	{level: LogLevel.DEBUG, name: "DEBUG", severity: 1, eventName: "logDebug"},
	{level: LogLevel.INFO, name: "INFO", severity: 2, eventName: "logInfo"},
	{level: LogLevel.WARN, name: "WARN", severity: 3, eventName: "logWarn"},
	{level: LogLevel.ERROR, name: "ERROR", severity: 4, eventName: "logError"},
	{level: LogLevel.FATAL, name: "FATAL", severity: 5, eventName: "logFatal"},
])("Log level details for $name", ({level, name, severity, eventName}) => {
	test(`name should be ${name}`, () => {
		expect(level.name).toBe(name);
	});
	
	test(`severity should be ${severity}`, () => {
		expect(level.severity).toBe(severity);
	});

	test(`eventName should be ${eventName}`, () => {
		expect(level.eventName).toBe(eventName);
	});
	
	test(`toString() should return ${name}`, () => {
		expect(level.toString()).toBe(name);
	});

	test(`valueOf() should return ${severity}`, () => {
		expect(level.valueOf()).toBe(severity);
	});
});

// FIXME: Stop skipping when fixing the message issue
describe.each([
	{level: LogLevel.TRACE},
	{level: LogLevel.DEBUG},
	{level: LogLevel.INFO},
	{level: LogLevel.WARN},
	{level: LogLevel.ERROR},
	{level: LogLevel.FATAL},
])("Handler with severity $level", ({level}) => {
	
	let testLogger: Logger;
	let testHandler: TestLoggingHandler;

	beforeAll(() => {

		testLogger = new Logger(`test-${level.toString()}-logger`);
		testHandler = new TestLoggingHandler(
			level, `test-${level.toString()}-handler`
		);
		testLogger.addLogHandler(testHandler);

		testLogger.trace("Some trace message");
		testLogger.debug("Some debug message");
		testLogger.info("Some info message");
		testLogger.warn("Some warn message");
		testLogger.error("Some error message");
		testLogger.fatal("Some fatal message");
	});

	test("Has the correct number of events", () => {
		expect(testHandler.logEvents.length).toBe(
			LogLevel.FATAL.valueOf() - level.valueOf() + 1
		);
	});

	test("Has the correct events logged", () => {
		// Expect that all the log events are the configured severity or higher.
		testHandler.logEvents.forEach((event: LogEvent) => {
			expect(
				event.level.valueOf()
			).toBeGreaterThanOrEqual(
				level.valueOf()
			);
		});
	});

	test("Has the correct log messages", () => {
		testHandler.logEvents.forEach((log: LogEvent) => {
			expect(log.message).toBe(`Some ${log.level.name.toLowerCase()} message`);
		});
	});
});

describe("Concerning the names of loggers", () => {
	test("Creating with a name should have that name", () => {
		const logger: Logger = new Logger("Mischa");
		expect(logger.getName()).toBe("Mischa");
	});

	test("Creating without a name should be nameless", () => {
		const logger: Logger = new Logger();
		expect(logger.getName()).toBe("");
	});

	test("Creating with a name and then changing should have a new name", () => {
		const logger: Logger = new Logger("Mischa");
		expect(logger.getName()).toBe("Mischa");

		logger.setName("Reitsma");
		expect(logger.getName()).toBe("Reitsma");
	});
});

describe("Concerning adding and removing log handlers", () => {
	let logger: Logger;
	const testHandler1: TestLoggingHandler = new TestLoggingHandler(LogLevel.TRACE, "t1");
	const testHandler2: TestLoggingHandler = new TestLoggingHandler(LogLevel.INFO, "t2");

	beforeEach(() => {
		logger = new Logger("test-adding-handler-logger");
		testHandler1.logEvents = [];
		testHandler2.logEvents = [];
	});

	test("Adding a log handler should update the number of handlers", () => {
		logger.addLogHandler(testHandler1);
		expect(logger.getNumberOfHandlers()).toBe(1);

		allLogLevels.forEach((level) => {
			expect(logger.getNumberOfHandlersForLevel(level)).toBe(1);
		});
	});

	test("Adding two handlers with different levels should update the number of handlers", () =>
	{
		logger.addLogHandler(testHandler1);
		logger.addLogHandler(testHandler2);
		expect(logger.getNumberOfHandlers()).toBe(2);
		allLogLevels.forEach(level => {
			expect(logger.getNumberOfHandlersForLevel(level)).toBe(
				level < LogLevel.INFO ? 1 : 2
			);
		});
	});

	test("Add, remove, add and remove all handlers should update the numbers", () => {
		logger.addLogHandler(testHandler1);
		logger.removeLogHandler(testHandler1);
		logger.addLogHandler(testHandler2);
		logger.removeAllLogHandlers();

		expect(logger.getNumberOfHandlers()).toBe(0);
		allLogLevels.forEach((level) => {
			expect(logger.getNumberOfHandlersForLevel(level)).toBe(0);
		});
	});

	test.each(["name", "instance"])(
		"Removing a log handler using the %s should update the number of handlers",
		(methodOfRemoval) => {
			logger.addLogHandler(testHandler1);
			logger.addLogHandler(testHandler2);
			logger.removeLogHandler(
				methodOfRemoval === "name" ? testHandler1.name : testHandler1
			);

			expect(logger.getNumberOfHandlers()).toBe(1);
			allLogLevels.forEach(level => {
				expect(logger.getNumberOfHandlersForLevel(level)).toBe(
					level < LogLevel.INFO ? 0 : 1
				);
			});
	});

	test("Removing all handlers should update the number of handlers", () => {
		logger.addLogHandler(testHandler1);
		logger.addLogHandler(testHandler2);
		logger.removeAllLogHandlers();
		expect(logger.getNumberOfHandlers()).toBe(0);
		allLogLevels.forEach(level => {
			expect(logger.getNumberOfHandlersForLevel(level)).toBe(0);
		});
	});
});

describe("Concerning adding and getting loggers", () => {
	test("Getting a logger without a name gives back the root logger", () => {
		expect(getLogger().getName()).toBe("root");
	});

	test("Getting a logger with a names that does not exist gives back the root logger", () => {
		expect(getLogger("someRandomName").getName()).toBe("root");
	});

	test("Adding a logger with a name and getting it should have the correct name", () => {
		addLogger(new Logger("someName"));
		expect(getLogger("someName").getName()).toBe("someName");
	});

	/* Note: if this test starts failing, just remove. Right now no test is setting
	the root logger, only this test, so should be the only one. Instead of removing
	can also use that jest feature that resets a module.
	*/
	test("Adding the root logger once will not trigger a warning", () => {
		const rootLogger: Logger = new Logger("root");
		const testHandler: TestLoggingHandler = new TestLoggingHandler(
			LogLevel.TRACE,
			"test-handler"
		);
		rootLogger.addLogHandler(testHandler);
		addLogger(rootLogger);

		expect(testHandler.logEvents.length).toBe(0);
	});

	test("Adding a logger twice should trigger a warning", () => {
		const logger: Logger = new Logger("test-add-twice");
		const spy = jest.spyOn(logger, "emit");
		addLogger(logger);
		addLogger(logger);
		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith(
			"logWarn",
			"Trying to add the same logger with name test-add-twice",
			expect.anything(),
			"test-add-twice",
			undefined
		);
	});
});
