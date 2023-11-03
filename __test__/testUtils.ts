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

/**
 * Sleep for a number of milliseconds.
 * 
 * @param ms Number of milliseconds to sleep. Default: 1000ms. If <= 0, doesn't sleep.
 */
export async function sleep(ms: number = 1000): Promise<void> {
	if (ms <= 0) return;
	await new Promise(f => setTimeout(f, ms));
}
