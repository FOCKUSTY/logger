import Formatter, { Colors } from "f-formatter";

import path from "path";
import fs from "fs";

import type { Config, SettingKeys, Settings } from "../data/loggers.types";

import { settings } from "../data/data";
import Validator from "./validator";

class Configurator {
	private readonly _dir: string = path.join("./");
	private readonly _config: Config = settings;
	private readonly _path: string;
	private readonly _create_file;

	public constructor(createFile: boolean = false) {
		this._path = path.join(this._dir, ".loggercfg");
		this._create_file = createFile;

		this.init();
	}

	private Create() {
		try {
			const file = JSON.stringify(settings, undefined, 4);
			fs.writeFileSync(this._path, file, "utf-8");

			return settings;
		} catch (err: any) {
			throw new Error(err);
		}
	}

	private Validator(key: SettingKeys, value: Settings): Settings {
		return new Validator(
			key,
			value,
			JSON.stringify(JSON.parse(fs.readFileSync(this._path, "utf-8")), undefined, 0)
		).init();
	}

	private Validate(config: Config) {
		for (const key in settings) {
			const value = this.Validator(key as SettingKeys, config[key]);

			this._config[key] = value;
		}
	}

	private Read() {
		if (!fs.existsSync(this._path) && this._create_file) this.Create();

		if (
			fs.existsSync(this._path) &&
			Object.keys(JSON.parse(fs.readFileSync(this._path, "utf-8") || "{}"))
				.length === 0
		) {
			console.log(
				Colors.brightYellow +
					"Your config is empty, returning to default" +
					Colors.reset
			);

			fs.unlinkSync(this._path);
			this.Create();
		}

		try {
			const config: Config = new Formatter().FromJSONWithPath(this._path);

			this.Validate(config);
		} catch (err: any) {
			if (!fs.existsSync(this._path)) return;

			throw new Error(err);
		}
	}

	private HasPermissions(): boolean {
		if (this._create_file) return true;

		if (fs.existsSync(this._path)) return true;

		return false;
	}

	private readonly init = () => {
		if (this.HasPermissions()) this.Read();
	};

	public get config(): Config {
		return this._config;
	}
}

(() => {
	new Configurator();
})();

export default Configurator;
