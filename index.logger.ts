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

	public constructor(
		dir: string,
		data: {
			name: string;
			colors: [Colors, Colors];
			filePath?: string;
			prefix?: string;
		}
	) {
		this._name = data.name;
		this._colors = data.colors;

		if (config.logging) this._log = new FileLogger(dir, data?.filePath, data?.prefix);
	}

	public readonly execute = (
		text: string,
		color: Colors = this._colors[1],
		level: LevelType = "info"
	): string => {
		const txt = formatter.Color(text, color);

		if (Levels[config.level] <= Levels[level])
			console.log(formatter.Color(this._name, this._colors[0]) + ":", txt);

		if (config.logging && this._log) this._log.writeFile(text);

		return txt;
	};

	public get colors(): [Colors, Colors] {
		return this._colors;
	}

	public get name(): string {
		return this._name;
	}
}

const loggers: { [key: LoggerName<string>]: InitLogger } = {};

class Logger<T extends string> {
	private readonly _name: LoggerName<T>;
	private readonly _dir: string;
	private readonly _fileLog?: { filePath?: string; prefix?: string };

	private _colors: [Colors, Colors];
	private _logger: InitLogger;

	public constructor(
		name: LoggerName<T>,
		data?: {
			colors?: [Colors, Colors];
			dir?: string;
			filePath?: string;
			prefix?: string;
		}
	) {
		this._dir = data?.dir || config.dir;
		this._name = name;
		this._fileLog = { filePath: data?.filePath, prefix: data?.prefix };

		this._colors = data?.colors
			? data?.colors
			: loggers[name]
				? loggers[name].colors
				: loggersNames.GetNames()[name]?.colors || config.colors;

		this._logger = this.init();
	}

	private readonly init = (): InitLogger => {
		this._logger = new InitLogger(this._dir, {
			name: this._name,
			colors: this._colors,
			...this._fileLog
		});

		for (const key in loggersNames.GetNames()) {
			const logger = loggersNames.GetNames()[key];

			loggers[key] = new InitLogger(this._dir, {
				name: logger.name,
				colors: logger.colors
			});
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

	public readonly execute = (
		text: string,
		data?: { color?: Colors; level?: LevelType }
	): string => {
		return this._logger.execute(text, data?.color, data?.level);
	};
}

export default Logger;
