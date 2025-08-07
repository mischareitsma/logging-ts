import * as fs from "node:fs";

import { test, expect, describe } from "@jest/globals";

import { ANSI_RESET } from "../src/ansi";
import { ConsoleHandler, FileHandler } from "../src/handlers";
import { LogEvent, LogLevel } from "../src/logging";

const infoEvent: LogEvent = {
	level: LogLevel.INFO,
	message: "Some info message",
	date: new Date(),
	name: "myLogger",
	data: {"someKey": "someValue"}
};

const errorEvent: LogEvent = {
	level: LogLevel.ERROR,
	message: "Some error message",
	date: new Date(),
	name: "myLogger"
};

describe.each<LogEvent>(
	[infoEvent, errorEvent]
)("Logging am message with LogEvent: %s", (logEvent) => {

	describe.each<boolean>([false, true])("Using a ConsoleHandler with useColors %s",
		(useColors) => {

		const handler: ConsoleHandler = new ConsoleHandler(LogLevel.TRACE, useColors);

		let consoleSpy: jest.SpyInstance;

		let capturedArg: string;

		beforeAll(() => {
			consoleSpy = jest.spyOn(
				console,
				logEvent.level === LogLevel.INFO ? "log" : "error"
			).mockImplementation((args: string) => { capturedArg = args; });

			handler.log(logEvent);
		});

		test("Mock is called once", () => {
			expect(consoleSpy).toHaveBeenCalledTimes(1);
		});

		test("Log message is in logged line", () => {
			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining(logEvent.message)
			);
		});

		test("Log severity is in logged line", () => {
			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining(logEvent.level.toString())
			);
		});

		test("Datetime format is correct", () => {
			const dt: string = capturedArg.split(" - ")[0];

			// Assert full length, year and length of all the other pieces.
			expect(dt.length).toBe(25);

			const date: string = dt.slice(0, 10);
			const t: string = dt[10];
			const time: string = dt.slice(11, 19);
			const diff = dt[19];
			const offset: string = dt.slice(20);

			expect(date).toEqual(new Date().toISOString().slice(0, 10));
			expect(t).toEqual("T");
			expect(time).toMatch(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/);
			expect(["+", "-"]).toContain(diff);
			expect(offset).toMatch(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/);
		});

		if (useColors) {
			test("ANSI reset is in logged line", () => {
				expect(consoleSpy).toHaveBeenCalledWith(
					expect.stringContaining(ANSI_RESET)
				);
			});
		}

		if (logEvent.data) {
			test("Extra data is in logged line", () => {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				expect(consoleSpy).toHaveBeenCalledWith(
					expect.stringContaining(JSON.stringify(logEvent.data))
				);
			});
		}

		afterAll(() => {
			consoleSpy.mockRestore();
		});
	});

	describe("Using a FileHandler", () => {
		const handler: FileHandler = new FileHandler(LogLevel.TRACE, "/tmp/file.log");

		let fsSpy: jest.SpyInstance;

		beforeAll(() => {
			fsSpy = jest.spyOn(fs, "appendFile").mockImplementation(() => {});

			handler.log(logEvent);
		});

		test("Mock is called once", () => {
			expect(fsSpy).toHaveBeenCalledTimes(1);
		});

		test("Log file is correct", () => {
			expect(fsSpy).toHaveBeenCalledWith(
				"/tmp/file.log",
				expect.anything(), // Message (parts) are covered in other tests
				expect.anything() // The () => {} anonymous function
			);
		});

		test("Log message is in logged line", () => {
			expect(fsSpy).toHaveBeenCalledWith(
				"/tmp/file.log",
				expect.stringContaining(logEvent.message),
				expect.anything() // The () => {} anonymous function
			);
		});

		test("Log severity is in logged line", () => {
			expect(fsSpy).toHaveBeenCalledWith(
				"/tmp/file.log",
				expect.stringContaining(logEvent.level.toString()),
				expect.anything() // The () => {} anonymous function
			);
		});

		if (logEvent.data) {
			test("Extra data is in logged line", () => {
				expect(fsSpy).toHaveBeenCalledWith(
					"/tmp/file.log",
					expect.stringContaining(JSON.stringify(logEvent.data)),
					expect.anything() // The () => {} anonymous function
				);
			});
		}

		afterAll(() => {
			fsSpy.mockRestore();
		});
	});
});
