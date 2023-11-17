/**
 * Test for the configParsers module. All tests JSON files should be stored in the
 * configParsersJsons directory. Every JSON has it's own describe, and each describe
 * has a test per assert.
 * 
 * The beforeAll of this module will mock stderr (console.error()), as invalid config
 * will write an error message to console.error(). The assertConsoleError() function can
 * be used to assert this error message. This function takes a list of invalid loggers
 * and handlers as input.
 */
import { test, expect, describe } from "@jest/globals";
import { loadLoggingConfiguration } from "../src/configParser";
import {
	ConsoleHandlerConfiguration,
	FileHandlerConfiguration,
	HandlerConfiguration,
	LoggerConfiguration,
	LoggingConfiguration
} from "../src/config";

function jsonConfigPath(jsonName: string) {
	return `${__dirname}/configParserJsons/${jsonName}.json`;
}

function assertConsoleError(spy: jest.SpyInstance, loggers: string[], handlers: string[]) {
	const expectedError = "Could not parse entire configuration: Error: Invalid config for " +
		`handlers: [${handlers.toString()}], invalid config for ` +
		`loggers: [${loggers.toString()}]`;

	expect(spy).toHaveBeenCalledTimes(1);

	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	expect(spy.mock.calls[0][0]).toBe(expectedError);
}

interface InvalidTestInput {
	jsonName: string;
	loggers: string[];
	handlers: string[];
	invalidHandlers: string[];
	invalidLoggers: string[];

}

describe.each<InvalidTestInput>([
	{
		jsonName: "invalid-handler-and-logger-load-partially",
		loggers: ["root"],
		handlers: ["validHandler"],
		invalidHandlers: ["invalidHandler"],
		invalidLoggers: ["invalidLogger"]
	},
	{
		jsonName: "invalid-handler-console-handler-useColors-string",
		loggers: [],
		handlers: [],
		invalidLoggers: [],
		invalidHandlers: ["console"]
	},
	{
		jsonName: "invalid-handler-file-missing-logfile",
		loggers: [],
		handlers: [],
		invalidLoggers: [],
		invalidHandlers: ["fileHandler"]
	},
	{
		jsonName: "invalid-handler-invalid-log-level",
		loggers: [],
		handlers: [],
		invalidLoggers: [],
		invalidHandlers: ["someHandlerThatLogsAll"]
	},
	{
		jsonName: "invalid-handler-invalid-type",
		loggers: [],
		handlers: [],
		invalidLoggers: [],
		invalidHandlers: ["someUnknownHandler"]
	},
	{
		jsonName: "invalid-logger-handlers-string",
		loggers: [],
		handlers: [],
		invalidLoggers: ["handlerAsStringLogger"],
		invalidHandlers: []
	},
	{
		jsonName: "invalid-logger-unknown-handler",
		loggers: ["root"],
		handlers: [],
		invalidLoggers: [],
		invalidHandlers: ["unknownHandler"]
	}
])("Loading config from $jsonName", (testInput) => {

	let config: LoggingConfiguration;

	let spy: jest.SpyInstance;

	beforeAll(() => {
		spy = jest.spyOn(console, "error").mockImplementation(() => {});
		config = loadLoggingConfiguration(jsonConfigPath(testInput.jsonName));
	});

	afterAll(() => {
		spy.mockRestore();
	});

	test("Config should have correct handlers", () => {
		expect(config.handlers.length).toBe(testInput.handlers.length);
		
		if (testInput.handlers.length > 0) {
			const handlerNames: string[] = config.handlers.map(cfg => cfg.name);
			testInput.handlers.forEach((handlerName) => {
				expect(handlerNames.includes(handlerName)).toBe(true);
			});
		}
	});

	test("Config should have correct loggers", () => {
		expect(config.loggers.length).toBe(testInput.loggers.length);
		
		if (testInput.loggers.length > 0) {
			const loggerNamers: string[] = config.loggers.map(cfg => cfg.name);
			testInput.loggers.forEach((handlerName) => {
				expect(loggerNamers.includes(handlerName)).toBe(true);
			});
		}
	});

	test("Should generate error message", () => {
		assertConsoleError(spy, testInput.invalidLoggers, testInput.invalidHandlers);
	});
});

/**
 * Get a logger from the configuration using the name of the logger.
 * 
 * @param config Configuration that contains configured loggers and handlers
 * @param name Name of the logger to get from the configuration.
 * 
 * @returns The configured logger if found, else undefined.
 */
function getLoggerByName(config: LoggingConfiguration, name: string): LoggerConfiguration {
	const loggingConfigsWithName: LoggerConfiguration[] = 
		config.loggers.filter((loggerCfg) => loggerCfg.name === name);

	if (loggingConfigsWithName.length === 0) return undefined;

	return loggingConfigsWithName[0];
}

/**
 * Get a handler from the configuration using the name of the handler.
 * 
 * @param config Configuration that contains configured loggers and handlers
 * @param name Name of the handler to get from the configuration.
 * 
 * @returns The configured handler if found, else undefined.
 */
function getHandlerByName(config: LoggingConfiguration, name: string): HandlerConfiguration {
	const handlerConfigsWithName: HandlerConfiguration[] = 
		config.handlers.filter((handlerCfg) => handlerCfg.name === name);

	if (handlerConfigsWithName.length === 0) return undefined;

	return handlerConfigsWithName[0];
}

describe("Loading configuration with a valid and complete JSON", () => {
	const config: LoggingConfiguration = loadLoggingConfiguration(
		jsonConfigPath("valid-complete")
	);

	describe("Should have the root logger", () => {
		const rootLogger: LoggerConfiguration = getLoggerByName(config, "root");
	
		expect(rootLogger).toBeDefined();
	
		test ("Should have the correct handlers configured", () => {
			expect(rootLogger.handlers.length).toBe(2);
			expect(rootLogger.handlers.includes("handler1")).toBe(true);
			expect(rootLogger.handlers.includes("handler2")).toBe(true);
		});
	});

	describe("Should have the app logger", () => {
		const appLogger: LoggerConfiguration = getLoggerByName(config, "app");
	
		expect(appLogger).toBeDefined();

		if (appLogger) {
			test ("Should have the correct handlers configured", () => {
				expect(appLogger.handlers.length).toBe(1);
				expect(appLogger.handlers.includes("handler2")).toBe(true);
			});
		}
	});

	describe("Should have the ConsoleHandler handler1", () => {
		const handler1: HandlerConfiguration = getHandlerByName(config, "handler1");

		expect(handler1).toBeDefined();

		test("Should have correct properties", () => {
			expect(handler1.logLevel).toBe("TRACE");
			expect(handler1.type).toBe("ConsoleHandler");
			// Previous expect makes sure this is a ConsoleHandlerConfiguration.
			expect((handler1 as ConsoleHandlerConfiguration).useColors).toBe(true);
		});
	});

	describe("Should have the ConsoleHandler handler1", () => {
		const handler2: HandlerConfiguration = getHandlerByName(config, "handler2");

		expect(handler2).toBeDefined();

		test("Should have correct properties", () => {
			expect(handler2.logLevel).toBe("WARN");
			expect(handler2.type).toBe("FileHandler");
			// Previous expect makes sure this is a FileHandlerConfiguration.
			expect((handler2 as FileHandlerConfiguration).logFile)
				.toBe("/var/log/some-file.log");
		});
	});
});

describe("Loading config with the console handler without optionals", () => {
	const config: LoggingConfiguration = loadLoggingConfiguration(
		jsonConfigPath("valid-handler-console-without-optionals")
	);

	const handler: HandlerConfiguration = getHandlerByName(config, "consoleHandler");

	expect(handler).toBeDefined();

	test("Should have correct properties", () => {
		expect(handler.logLevel).toBe("INFO");
		expect(handler.type).toBe("ConsoleHandler");
		expect((handler as ConsoleHandlerConfiguration).useColors).toBeFalsy();
	});
});

describe("Loading config with a handlers per severity", () => {
	const config: LoggingConfiguration = loadLoggingConfiguration(
		jsonConfigPath("valid-handlers-all-log-levels")
	);

	const logger: LoggerConfiguration = getLoggerByName(config, "root");

	expect(logger).toBeDefined();

	describe.each<string>(
		["TRACE", "DEBUG", "INFO", "WARN", "ERROR", "FATAL"]
	)("For level %s", (logLevel) => {
		const handlerName = `${logLevel.toLowerCase()}Handler`;

		const handler: HandlerConfiguration = getHandlerByName(config, handlerName);

		expect(handler).toBeDefined();

		test("Handler has the correct log level", () => {
			expect(handler.logLevel).toBe(logLevel);
		});

		test("Handler is added to logger", () => {
			expect(logger.handlers.includes(handlerName));
		});
	});
});

describe("Loading config with only valid handlers", () => {
	const config: LoggingConfiguration = loadLoggingConfiguration(
		jsonConfigPath("valid-handlers-only")
	);

	test.each<string>(["handler1", "handler2"])("Loaded handler %s", (handlerName) => {
		expect(getHandlerByName(config, handlerName)).toBeDefined();
	});
});

describe("Loading config with only valid loggers", () => {
	const config: LoggingConfiguration = loadLoggingConfiguration(
		jsonConfigPath("valid-loggers-only")
	);

	test.each<string>(["root", "app"])("Loaded logger %s", (loggerName) => {
		expect(getLoggerByName(config, loggerName)).toBeDefined();
	});
});
