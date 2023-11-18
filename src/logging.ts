/**
 * Logging module.
 * 
 * This module facilitates an event-driven based logging solution. A logger can emit
 * log events, and log handlers are processing those log events.
 */
import { EventEmitter } from "node:events";

export type LogDataContainer = {[id: string]: string};

type logLevelName = "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";

/**
 * Log levels.
 * 
 * Standard levels of logging. The levels are increasing in value from
 * TRACE up to FATAL.
 */
export class LogLevel {
	public static readonly TRACE = new LogLevel("TRACE", 0, "logTrace");
	public static readonly DEBUG = new LogLevel("DEBUG", 1, "logDebug");
	public static readonly INFO = new LogLevel("INFO", 2, "logInfo");
	public static readonly WARN = new LogLevel("WARN", 3, "logWarn");
	public static readonly ERROR = new LogLevel("ERROR", 4, "logError");
	public static readonly FATAL = new LogLevel("FATAL", 5, "logFatal");

	public readonly name: string;
	public readonly severity: number;
	public readonly eventName: keyof LogEvents;

	private constructor(name: string, severity: number, eventName: keyof LogEvents) {
		this.name = name;
		this.severity = severity;
		this.eventName = eventName;
	}

	public toString(): string {
		return this.name;
	}

	public valueOf(): number {
		return this.severity;
	}

	public static getLogLevelFromName(name: logLevelName): LogLevel {
		switch(name) {
			case "TRACE":
				return LogLevel.TRACE;
			case "DEBUG":
				return LogLevel.DEBUG;
			case "INFO":
				return LogLevel.INFO;
			case "WARN":
				return LogLevel.WARN;
			case "ERROR":
				return LogLevel.ERROR;
			case "FATAL":
				return LogLevel.FATAL;
		}
	}
}

export const allLogLevels: LogLevel[] = [
	LogLevel.TRACE, LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL
];


/**
 * Events for the different log levels defined in the **LogLevel** enum.
 * 
 * The event interface is used in the **Logger** interface. This interface
 * defines the event emitter methods **on()** and **emit()**
 */
export interface LogEvents {
	"logTrace": (message: string, date: Date, loggerName: string, data: LogDataContainer)
		=> void;

	"logDebug": (message: string, date: Date, loggerName: string, data: LogDataContainer)
		=> void;

	"logInfo": (message: string, date: Date, loggerName: string, data: LogDataContainer)
		=> void;

	"logWarn": (message: string, date: Date, loggerName: string, data: LogDataContainer)
		=> void;

	/* Note: Do not rename this event to 'error', even though it would be a nicer event name.
	The 'error' event is a special event that if not handled, will terminate the program. As
	handlers are allowed to be configured to just handle fatal events, the error events are
	not handled and a program can crash. A work-around could be to always let the logger
	itself listen to these events and call a noop function.
	*/
	"logError": (message: string, date: Date, loggerName: string, data: LogDataContainer)
		=> void;

	"logFatal": (message: string, date: Date, loggerName: string, data: LogDataContainer)
		=> void;
}

/**
 * A single instance of a log event.
 * 
 * A log event has al the necessary data to generate an entry in a log.
 */
export interface LogEvent {

	/**
	 * Log level of the event (TRACE, DEBUG, INFO, WARN, ERROR or FATAL).
	 */
	level: LogLevel;

	/**
	 * Log message
	 */
	message: string,

	/**
	 * Date of the event. This date will normally be generated by the logger before emitting a
	 * log event.
	 */
	date: Date,

	/**
	 * Name of the logger that triggered the log event.
	 */
	name: string,

	/**
	 * Optional data container.
	 * 
	 * The data container has a simple flat structure, and can be used to add more info to
	 * a log event, or the logger can inject data for a particular handler.
	 */
	data?: LogDataContainer;
}

/**
 * Logger interface.
 * 
 * The logger interface and logger class are merged, where the interface adds
 * method signatures for all the methods that are implemented in the class, and
 * adds the method signatures for the **EventEmitter.on()** and **EventEmitter.emit()**
 * methods
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface Logger {
	/**
	 * Add an event listener for a particular log event.
	 * 
	 * @param event The log event, a string that equals the log level of the event.
	 * @param listener The listener for a particular log event.
	 */
	on<U extends keyof LogEvents>(
		event: U, listener: LogEvents[U]
	): this;

	/**
	 * The log event emitter.
	 * 
	 * @param event The log event, a string that equals the log level of the event.
	 * @param args The arguments for the log event. For all events these are **message**,
	 * **date** and an optional **data** container which are string key-value pairs.
	 */
	emit<U extends keyof LogEvents>(
		event: U, ...args: Parameters<LogEvents[U]>
	): boolean;

	setName(name: string): void;
	getName(): string;

	getNumberOfHandlers(): number;
	getNumberOfHandlersForLevel(level: LogLevel): number;

	/**
	 * Add a log handler to a logger instance.
	 * 
	 * The configured log level of the handler is used to add the handler's log method
	 * to the various log events. All events that are greater or equal to the handler's
	 * configured log level are in scope (i.e. LogLevel.INFO will result in adding the
	 * handler as listener to the info, warn, error and fatal events.).
	 * 
	 * @param handler A **LogHandler** instance to add to the logger.
	 */
	addLogHandler(handler: LogHandler): void;

	removeLogHandler(name: string): void;
	removeAllLogHandlers(): void;

	/**
	 * Trigger a trace event.
	 * 
	 * @param message Message to log.
	 * @param data Optional data used for logging.
	 */
	trace(message: string, data?: LogDataContainer): void;

	/**
	 * Trigger a debug event.
	 * 
	 * @param message Message to log.
	 * @param data Optional data used for logging.
	 */
	debug(message: string, data?: LogDataContainer): void;

	/**
	 * Trigger a info event.
	 * 
	 * @param message Message to log.
	 * @param data Optional data used for logging.
	 */
	info(message: string, data?: LogDataContainer): void;

	/**
	 * Trigger a warn event.
	 * 
	 * @param message Message to log.
	 * @param data Optional data used for logging.
	 */
	warn(message: string, data?: LogDataContainer): void;

	/**
	 * Trigger a error event.
	 * 
	 * @param message Message to log.
	 * @param data Optional data used for logging.
	 */
	error(message: string, data?: LogDataContainer): void;

	/**
	 * Trigger a fatal event.
	 * 
	 * @param message Message to log.
	 * @param data Optional data used for logging.
	 */
	fatal(message: string, data?: LogDataContainer): void;
}

type LogFunction = (msg: string, date: Date, name: string, data: LogDataContainer) => void;
interface LogEventListener {
	logFunction: LogFunction;
	eventName: keyof LogEvents;
}


// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class Logger extends EventEmitter {

	private name: string = "";
	private handlers: Map<string, LogHandler> = new Map();
	private handlerListeners: Map<string, LogEventListener[]> = new Map();

	private numberOfHandlers: number = 0;
	private numberOfHandlersPerLevel: [number, number, number, number, number, number] =
		[0, 0, 0 ,0 ,0 ,0];

	public constructor(name?: string) {
		super();
		if (name) this.setName(name);
	}

	public setName(name: string) {
		this.name = name;
	}

	public getName(): string {
		return this.name;
	}

	public getNumberOfHandlers(): number {
		return this.numberOfHandlers;
	}

	public getNumberOfHandlersForLevel(level: LogLevel): number {
		return this.numberOfHandlersPerLevel[level.valueOf()];
	}

	public addLogHandler(handler: LogHandler) {
		if (this.handlers.has(handler.name)) {
			this.warn(`Already added the ${handler.name} handler`);
			return;
		}

		this.handlers.set(handler.name, handler);
		this.handlerListeners.set(handler.name, []);

		this.numberOfHandlers++;

		allLogLevels.forEach((level: LogLevel) => {
			if (handler.logLevel <= level) {
				this.addLogListener(handler, level.eventName, level);
				this.numberOfHandlersPerLevel[level.valueOf()]++;
			}
		});
	}

	private addLogListener(handler: LogHandler, event: keyof LogEvents, level: LogLevel) {
		const handlerFunction: LogFunction = (msg, date, name, data) => {
			handler.log({
				level: level,
				message: msg,
				date: date,
				name: name,
				data: data
			});
		};
		this.handlerListeners.get(handler.name).push({
			logFunction: handlerFunction,
			eventName: event,
		});
		this.on(event, handlerFunction);
	}

	public removeLogHandler(handlerOrName: string | LogHandler): void {
		const [name, handler]: [string, LogHandler] = typeof handlerOrName === "string" ?
			[handlerOrName, this.handlers.get(handlerOrName)] :
			[handlerOrName.name, handlerOrName];

		this.numberOfHandlers--;
		allLogLevels.filter(level => level >= handler.logLevel).forEach((level) => {
			this.numberOfHandlersPerLevel[level.valueOf()]--;
		});

		this.handlerListeners.get(name).forEach((logEventListener: LogEventListener) => {
			this.removeListener(
				logEventListener.eventName,
				logEventListener.logFunction
			);
		});

		this.handlers.delete(name);
		this.handlerListeners.delete(name);
	}

	public removeAllLogHandlers(): void {
		this.handlers.forEach((logHandler: LogHandler) => {
			this.removeLogHandler(logHandler);
		});
	}

	public trace(message: string, data?: LogDataContainer): void {
		this.emit("logTrace", message, new Date(), this.getName(), data);
	}

	public debug(message: string, data?: LogDataContainer): void {
		this.emit("logDebug", message, new Date(), this.getName(), data);
	}

	public info(message: string, data?: LogDataContainer): void {
		this.emit("logInfo", message, new Date(), this.getName(), data);
	}

	public warn(message: string, data?: LogDataContainer): void {
		this.emit("logWarn", message, new Date(), this.getName(), data);
	}

	public error(message: string, data?: LogDataContainer): void {
		this.emit("logError", message, new Date(), this.getName(), data);
	}

	public fatal(message: string, data?: LogDataContainer): void {
		this.emit("logFatal", message, new Date(), this.getName(), data);
	}
}

/**
 * Log handler interface.
 * 
 * Log handlers are added to a logger, and are are responsible for the actual logging of
 * a log event.
 */
export interface LogHandler {

	/**
	 * The log level that is in scope for the handler. All events with a log level
	 * equal to or greater than this value will be processed by this handler.
	 */
	logLevel: LogLevel;

	/**
	 * Name of the log handler.
	 */
	readonly name: string;

	/**
	 * Log method.
	 * 
	 * This method implements the logging of the log event.
	 * 
	 * @param logEvent Event to log.
	 */
	log(logEvent: LogEvent): void;
}

/* Section: Logger maintenance.
*/
const loggers: Map<string, Logger> = new Map();
let rootLoggerHasNotBeenSet: boolean = true;

// Default simple root logger. If root logger is added later, this one will be removed.
loggers.set("root", new Logger("root"));

export function addLogger(logger: Logger) {
	if (rootLoggerHasNotBeenSet && (logger.getName() === "root")) {
		loggers.delete("root");
		rootLoggerHasNotBeenSet = false;
	}

	if (loggers.has(logger.getName())) {
		/* Logging should never crash an app, so do not add, do not throw error, but use the
		existing logger to warn that the same logger attempted to add.
		*/
		loggers.get(logger.getName()).warn(
			`Trying to add the same logger with name ${logger.getName()}`
		);
		return;
	}

	loggers.set(logger.getName(), logger);
}

export function getLogger(name?: string) {
	// TODO: (Mischa Reitsma) Could set a 'display name', so we can reuse the root logger but use a different name in the logs. But then we might as well just only have one logger.
	return loggers.get(!name || !loggers.has(name) ? "root" : name);
}

/* Section: Few handlers.
*/
