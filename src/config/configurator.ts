import Formatter, { Colors } from "f-formatter";

import path from "path";
import fs from "fs";

import type {
	Config,
	SettingKeys,
	Settings,
	ExtraneousConfig as ExtraConfig
} from "../data/loggers.types";

import { extraSettings, settings } from "../data/data";
import Validator from "./validator";

class Configurator {
	private readonly _extra_config: ExtraConfig = extraSettings;
	private readonly _config: Config = settings;
	private readonly _path: string;

	public constructor(config?: Partial<Config> & Partial<ExtraConfig>) {
		this.Paste(config);

		this._path = path.join(this._config.dir, ".loggercfg");
		this.init();
	}

	private Paste(config?: Partial<Config> & Partial<ExtraConfig>) {
		if (!config) return;

		for (const key in config) {
			if (!config[key]) continue;

			if (Object.keys(extraSettings).includes(key)) {
				this._extra_config[key] = config[key];
				continue;
			}

			this._config[key] = new Validator(
				key as SettingKeys,
				config[key],
				JSON.stringify(config, undefined, 4)
			).init();
		}
	}

	private Create() {
		try {
			const file = JSON.stringify(this._config, undefined, 4);
			fs.writeFileSync(this._path, file, "utf-8");

			return this._config;
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
		if (!fs.existsSync(this._path) && this._extra_config.create_file) this.Create();

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
		if (this._extra_config.create_file) return true;
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
