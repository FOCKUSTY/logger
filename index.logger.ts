import Formatter, { Colors } from "f-formatter";

import Configurator from "./configurator";

import { LevelType, LoggerName, Levels } from "./loggers.types";
import LoggersNames from "./loggers.names";

import FileLogger from "./file.logger";

const { config } = new Configurator();

const formatter = new Formatter();
const loggersNames = new LoggersNames(config.logging);

class InitLogger {
	private readonly _name: string;
	private readonly _colors: [Colors, Colors];
	private readonly _log?: FileLogger;

	constructor(dir: string, name: string, colors: [Colors, Colors]) {
		this._name = name;
		this._colors = colors;

		if (config.logging)
			this._log = new FileLogger(dir);
	}

	public readonly execute = (
		text: string,
		color?: Colors,
		level: LevelType = "info"
	): string => {
		const txt = formatter.Color(text, color ? color : this._colors[1]);

		if (Levels[config.level] <= Levels[level])
			console.log(formatter.Color(this._name, this._colors[0]) + ":", txt);

		if (config.logging && this._log)
			this._log.writeFile(text);

		return txt;
	};

	get colors(): [Colors, Colors] {
		return this._colors;
	}

	get name(): string {
		return this._name;
	}
}

const loggers: { [key: LoggerName<string>]: InitLogger } = {};

class Logger<T extends string> {
	private readonly _name: LoggerName<T>;
	private readonly _dir: string;

	private _colors: [Colors, Colors];
	private _logger: InitLogger;

	constructor(name: LoggerName<T>, colors?: [Colors, Colors], dir?: string) {
		this._dir = dir || config.dir;
		this._name = name;

		this._colors = colors
			? colors
			: loggers[name]
				? loggers[name].colors
				: loggersNames.GetNames()[name]?.colors || config.colors;

		this._logger = this.init();
	}

	private readonly init = (): InitLogger => {
		this._logger = new InitLogger(this._dir, this._name, this._colors);

		for (const key in loggersNames.GetNames()) {
			const logger = loggersNames.GetNames()[key];

			loggers[key] = new InitLogger(this._dir, logger.name, logger.colors);
		}

		loggers[this._name] = this._logger;
		loggersNames.SetNames({
			[this._logger.name]: {
				name: this._logger.name,
				colors: this._colors
			}
		});

		if (!this._colors) this._colors = this._logger.colors;

		return this._logger;
	};

	public readonly execute = (text: string, color?: Colors): string => {
		return this._logger.execute(text, color);
	};
}

export default Logger;
