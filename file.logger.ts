import Formatter from "f-formatter";

import path from "path";
import fs from "fs";

import Deleter from "./deleter.logger";

const cache = new Map();
const formatter = new Formatter();

class Log {
	private readonly _dir: string = path.join("./");
	private readonly _prefix: string = "";
	private readonly _date = formatter.date.Date(new Date(), "dd.MM.yyyy");
	private readonly _file_path: string = "";
	private readonly _deleter: Deleter;

	private _cache: string = "";

	public constructor(dir: string, filePath?: string, prefix?: string) {
		this._prefix = prefix ? prefix + "-" : "";

		this._file_path = filePath
			? filePath
			: path.join(dir, "log", this._prefix + this._date) + ".log";

		this._dir = path.join(dir);
		this._deleter = new Deleter(dir);

		this.init();

		this._cache = this.ReadFile();
		cache.set(this._file_path, this._cache);
	}

	private CreateFile() {
		if (
			!fs
				.readdirSync(path.join(this._dir, "log"))
				.includes(this._prefix + this._date + ".log")
		) {
			fs.writeFileSync(
				this._file_path,
				`====---- Hello! This is log file of ${this._date} ! ----====`
			);
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
			path.join("./log", this._prefix + this._date + ".log"),
			"utf-8"
		);
	}

	private WriteFile = () => {
		fs.writeFileSync(this._file_path, cache.get(this._file_path), {
			encoding: "utf-8"
		});
	};

	private readonly init = () => {
		this.CreateFolder();
		this._deleter.init();
	};

	public writeFile(text: string) {
		cache.set(
			this._file_path,
			cache.get(this._file_path) +
				"\n" +
				"[" +
				formatter.date.Date(new Date(), "HH:mm:ss") +
				"] " +
				text
		);

		this.WriteFile();
	}

	public get file() {
		return this.ReadFile();
	}
}

export default Log;
