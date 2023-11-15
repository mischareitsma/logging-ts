import { LogEvent, LogLevel, LogHandler } from "../src";

export class TestLoggingHandler implements LogHandler {

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
