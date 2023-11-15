import * as fs from "node:fs";

import * as ansi from "./ansi";

import { LogEvent, LogHandler, LogLevel } from "./logging";
import { HandlerConfiguration } from "./config";

export class ConsoleHandler implements LogHandler {

	public logLevel: LogLevel = LogLevel.INFO;
	public readonly name: string = "ConsoleHandler";
	public readonly useColors: boolean = false;

	constructor(logLevel: LogLevel, useColors?: boolean, name?: string) {
		this.logLevel = logLevel;
		if (name) this.name = name;
		if (useColors) this.useColors = true;
	}

	log(logEvent: LogEvent): void {
		const logMessage = logEvent.date.toISOString() + " - "
			+ this.getLogLevelForMessage(logEvent.level) + " - "
			+ process.pid.toString() + " - "
			+ logEvent.name + " - " + logEvent.message
			+ (logEvent.data ? " - " + JSON.stringify(logEvent.data) : "");
		
		if (logEvent.level < LogLevel.ERROR) {
			console.log(logMessage);
		}
		else {
			console.error(logMessage);
		}
	}

	private getLogLevelForMessage(logLevel: LogLevel): string {
		if (!this.useColors) return logLevel.toString();

		return `${this.colorForLogLevel(logLevel)}${logLevel.toString()}${ansi.ANSI_RESET}`;
	}

	private colorForLogLevel(logLevel: LogLevel): string {
		switch (logLevel) {
			case LogLevel.TRACE:
				return ansi.ANSI_FG_WHITE;
			case LogLevel.DEBUG:
				return ansi.ANSI_FG_GREEN;
			case LogLevel.INFO:
				return ansi.ANSI_FG_BLUE;
			case LogLevel.WARN:
				return ansi.ANSI_FG_YELLOW;
			case LogLevel.ERROR:
				return ansi.ANSI_FG_RED;
			case LogLevel.FATAL:
				return ansi.ANSI_FG_MAGENTA;
			default:
				return ansi.ANSI_FG_WHITE;
		}
	}
}

export class FileHandler implements LogHandler {
	public logLevel: LogLevel;
	public readonly name: string = "FileHandler";
	
	private logFilePath: string;

	constructor(logLevel: LogLevel, logFilePath: string, name?: string) {
		this.logFilePath = logFilePath;
		if (name) this.name = name;
		this.logLevel = logLevel;
	}

	public log(logEvent: LogEvent): void {
		fs.appendFile(
			this.logFilePath,
			logEvent.date.toISOString() + " - " + logEvent.level.toString() + " - " + 
			process.pid.toString() + " - " + logEvent.name + "  " + logEvent.message + 
			(logEvent.data ? " - " + JSON.stringify(logEvent.data) : "") + "\n",
			() => {} // Ignore callback just want it async
		);
	}
	
}

export function getNewLogHandler(handlerOptions: HandlerConfiguration): LogHandler {
	switch (handlerOptions.type) {
		case "FileHandler":
			return new FileHandler(
				handlerOptions.logLevel,
				handlerOptions.logFile,
				handlerOptions.name
			);
		case "ConsoleHandler":
			return new ConsoleHandler(
				handlerOptions.logLevel,
				handlerOptions.useColors,
				handlerOptions.name
			);
	}
}
