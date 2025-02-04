import Formatter, { Colors } from "f-formatter";

import Configurator from "../config/configurator";

import { LevelType, LoggerName, Levels } from "../data/loggers.types";
import LoggersNames from "../data/loggers.names";

import FileLogger from "./file.logger";

const { config } = new Configurator();

const formatter = new Formatter();
const loggersNames = new LoggersNames(config.logging);

class InitLogger {
	private readonly _name: string;
	private readonly _colors: [Colors, Colors];
	private readonly _log: FileLogger;

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

		this._log = new FileLogger(dir, data?.filePath, data?.prefix, config.logging);
	}

	public readonly execute = (
		text: string | any[],
		data: {
			color: Colors;
			level: LevelType;
			write: boolean;
		} = {
			color: this._colors[1],
			level: "info",
			write: config.logging
		}
	): string | any[] => {
		const name = formatter.Color(this._name, this._colors[0]) + ":";
		const txt = typeof text === "string"
			? formatter.Color(text, data.color)
			: text;

		if (Levels[config.level] <= Levels[data.level]) {
			if (typeof txt === "string") console.log(name, txt);
			else console.log(name + data.color, ...txt, Colors.reset);
		};

		if ((config.logging && this._log) || data.write) {
			if (typeof text === "string") this._log.writeFile(text);
			else for (const msg of text) this._log.writeFile(msg);
		};

		return txt;
	};

	public get write() {
		return this._log.writeFile;
	}

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
	private readonly _level: LevelType = "info";
	private readonly _write: boolean = config.logging;

	private readonly _fileLog?: { filePath?: string; prefix?: string };

	private _colors: [Colors, Colors];
	private _logger: InitLogger;

	public constructor(
		name: LoggerName<T>,
		data: {
			colors?: [Colors, Colors];
			filePath?: string;
			prefix?: string;

			dir?: string;
			level?: LevelType;
			write?: boolean;
		} = {
			dir: config.dir,
			level: "info",
			write: config.logging
		}
	) {
		this._name = name;
		this._fileLog = data;

		this._dir = data.dir || config.dir;
		this._level = data.level || "info";
		this._write = data.write || config.logging;

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

	public get write() {
		return this._logger.write;
	};

	public readonly execute = (
		text: string | any[],
		data?: {
			color?: Colors;
			level?: LevelType;
			write?: boolean;
		}
	): string | any[] => {
		return this._logger.execute(text, {
			color: data?.color || this._colors[1],
			level: data?.level || this._level,
			write: data?.write || this._write
		});
	};
}

export default Logger;
