import { test, expect, describe } from "@jest/globals";
import { LogEvent, LogHandler, LogLevel, Logger } from "../src";

const allLogLevels: LogLevel[] = [
	LogLevel.TRACE, LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL
];

allLogLevels.forEach((level: LogLevel) => {
	describe("Handler with severity " + level.toString(), () => {
		test("Has the correct number of events", () => {
			const testLogger: Logger = new Logger(`test-${level.toString()}-logger`);
			const testHandler: TestLoggingHandler = new TestLoggingHandler(
				level, `test-${level.toString()}-handler`
			);
			testLogger.addLogHandler(testHandler);

			testLogger.trace("Some trace message");
			testLogger.debug("Some debug message");
			testLogger.info("Some info message");
			testLogger.warn("Some warn message");
			testLogger.error("Some error message");
			testLogger.fatal("Some fatal message");

			expect(testHandler.logEvents.length).toBe(
				LogLevel.FATAL.valueOf() - level.valueOf() + 1
			);

			// Expect that all the log events are the configured severity or higher.
			testHandler.logEvents.forEach((event: LogEvent) => {
				expect(
					event.level.valueOf()
				).toBeGreaterThanOrEqual(
					level.valueOf()
				);
			});
		});
	});
});

class TestLoggingHandler implements LogHandler {

	public logLevel: LogLevel;
	public readonly name: string;
	public logEvents: LogEvent[] = [];

	constructor(logLevel: LogLevel, name: string) {
		this.logLevel = logLevel;
		this.name = name;
	}

	public log(logEvent: LogEvent): void {
		this.logEvents.push(logEvent);
	}
}
