import Configurator from "../config/configurator";
const { config } = new Configurator();

import { Config } from "../data/loggers.types";
import Formatter from "f-formatter";

import path from "path";
import fs from "fs";

import Deleter from "./deleter.logger";

const cache = new Map();
const formatter = new Formatter();

class Log {
	private readonly _date: Date;
	private readonly _date_string: string;
	private readonly _dir: string = config.dir;
	private readonly _deleter: Deleter;
	private readonly _hello: string;
	private readonly _init: boolean = true;

	private readonly _config: {
		file_path: string;
		prefix: string;
	} & Config;

	private _cache: string = "";

	public constructor(
		dir: string,
		data: {
			filePath?: string;
			prefix?: string;
		} & Partial<Config>,
		init: boolean = true
	) {
		const prefix = data.prefix ? data.prefix + "-" : "";

		this._date = new Date();
		this._date_string = formatter.date.Date(this._date, "yyyy.MM.dd");
		this._config = {
			...data,
			prefix: data.prefix ? data.prefix + "-" : "",
			file_path: data.filePath
				? data.filePath
				: path.join(dir, "log", prefix + this._date_string) + ".log",
			logging: data.logging || config.logging,
			dir: data.dir || config.dir,
			level: data.level || config.level,
			deletion_interval: data.deletion_interval || config.deletion_interval,
			date: data.date || config.date,
			date_format: data.date_format || config.date_format,
			colors: data.colors || config.colors,
			loggers: data.loggers || config.loggers
		};

		this._init = init;
		this._dir = path.join(dir);
		this._deleter = new Deleter(dir);
		this._hello = `====---- Hello! This is log file of ${this._date_string} ! ----====`;

		if (init) {
			this.init();

			this._cache = this.ReadFile();
			cache.set(this._config.file_path, this._cache);
		}
	}

	private CreateFile() {
		if (
			!fs
				.readdirSync(path.join(this._dir, "log"))
				.includes(this._config.prefix + this._date_string + ".log")
		) {
			fs.writeFileSync(this._config.file_path, this._hello);
		}
	}

	private CreateFolder() {
		if (!fs.readdirSync(this._dir).includes("log")) {
			fs.mkdirSync(path.join(this._dir, "log"));
		}

		this.CreateFile();
	}

	private ReadFile() {
		return fs.readFileSync(
			path.join(
				this._dir,
				"./log",
				this._config.prefix + this._date_string + ".log"
			),
			"utf-8"
		);
	}

	private WriteFile = () => {
		fs.writeFileSync(this._config.file_path, cache.get(this._config.file_path), {
			encoding: "utf-8"
		});
	};

	private readonly init = () => {
		this.CreateFolder();
		this._deleter.init();
	};

	public writeFile(text: string) {
		if (!this._init) {
			this.init();

			this._cache = this.ReadFile();
			cache.set(this._config.file_path, this._cache);
		}

		cache.set(
			this._config.file_path,
			(cache.get(this._config.file_path) || this._hello) +
				`\n[${this._date.toISOString()}]: ` +
				text
		);

		this.WriteFile();
	}

	public get file() {
		return this.ReadFile();
	}
}

export default Log;
