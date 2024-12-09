import { Colors } from "f-formatter/colors";
import Formatter from "f-formatter";

import type {
	Config,
	LoggersNameType
} from "./loggers.types";

import { join, parse } from "path";
import { existsSync, writeFileSync } from "fs";

const formatter = new Formatter();
const cache: LoggersNameType = {
	Success: { name: "Success", colors: [Colors.red, Colors.green] },
	Fail: { name: "Fail", colors: [Colors.red, Colors.red] }
};

class LoggersNames {
	private readonly _standart: LoggersNameType = cache;

	private readonly _default_path = join("./loggers.json");
	private readonly _path = this._default_path;
	private readonly _create_file: boolean

	public constructor(createFile: boolean) {
		this._create_file = createFile;
		this._path = this.ChoosePath();
	}

	private readonly ChoosePath = (): string => {
		if (existsSync(join("./.loggercfg"))) return join("./.loggercfg");
		else if (existsSync(this._default_path)) return this._default_path;
		else {
			if (this._create_file)
				writeFileSync(
					this._default_path,
					JSON.stringify(this._standart, undefined, 4),
					"utf-8"
				);

			return this._default_path;
		}
	};

	public readonly SetNames = (names: LoggersNameType) => {
		const existingNames = this.GetNames();
		const output: LoggersNameType = {};

		for (const key in names) {
			output[key] = names[key];
			cache[key] = names[key];
		}

		for (const key in existingNames) {
			const existingValue = existingNames[key];
			const value = names[key];

			if (
				value &&
				value.colors.toString() != [Colors.reset, Colors.reset].toString()
			) {
				output[key] = value;
				cache[key] = value;
			} else {
				output[key] = existingValue;
				cache[key] = existingValue;
			}
		}

		if (!this._create_file && !existsSync(this._path))
			return names;

		if (parse(this._path).base === ".loggercfg") {
			const file: Config = formatter.FromJSONWithPath(this._path);
			file.loggers = output;

			writeFileSync(this._path, JSON.stringify(file, undefined, 4), "utf-8");
		} else {
			writeFileSync(this._path, JSON.stringify(output, undefined, 4), "utf-8");
		}

		return names;
	};

	public readonly GetNames = (): LoggersNameType => {
		if (!existsSync(this._path)) return cache;

		if (parse(this._path).base === ".loggercfg") {
			const file: Config = formatter.FromJSONWithPath(this._path);

			return file.loggers || this._standart;
		} else {
			const file = formatter.FromJSONWithPath(this._path);

			return file;
		}
	};

	get standart() {
		return this._standart;
	}
}

export default LoggersNames;
