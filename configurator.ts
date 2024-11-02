import Formatter from "f-formatter";
import { Colors } from "f-formatter/colors";

import path from "path";
import fs from "fs";

type Settings = string | null | [Colors, Colors];

type Config = {
	[key: string]: Settings;

	dir: string;
	level: "info" | "warn" | "err";
	colors: [Colors, Colors];
};

const allowed: { [key: string]: string[] } = {
	level: ["info", "warn", "err"]
};

const settings: Config = {
	dir: "./",
	level: "info",
	colors: [Colors.reset, Colors.reset]
};

class Validator {
	private readonly _key: string;
	private readonly _value: Settings;
	private readonly _default: Settings;

	public constructor(key: string, value: Settings) {
		this._key = key;
		this._value = value;
		this._default = settings[key] || null;
	}

	private readonly ArrayValidator = () => {
		const { key, value } = { key: this._key, value: this._value };

		if (!Array.isArray(value)) return this._default;

		switch (key) {
			case "colors":
				const values = value.map((v) => v);

				for (const i in values) {
					if (!Object.values(Colors).includes(values[i])) {
						throw new Error(`${values[i]} in enum Colors is not defined`);
					}
				}

				return value;

			default:
				return this._default;
		}
	};

	private readonly AllowedValidator = () => {
		const { key, value } = { key: this._key, value: this._value };

		if (!value) return this._default;
		if (Array.isArray(value)) return this.ArrayValidator();

		if (!allowed[key]) throw new Error(`${key} in allowed settings is not defined`);

		if (!allowed[key].includes(value))
			throw new Error(`${value.toString()} at ${key} is not allowed`);

		console.log(allowed[key], allowed[key].includes(value), value);

		return value;
	};

	public readonly init = (): Settings => {
		const { key, value } = { key: this._key, value: this._value };

		if (!settings[key]) {
			console.log(
				`Value at key: "${key}" is not allowed, you can use:\r\n`,
				Object.keys(settings)
			);
			throw new Error(`Value at key: "${key}" is not allowed`);
		}

		if (!value) {
			console.log(
				`Value at key: "${key}" is not defined\r\nThis value can be:\r\n`,
				settings[key]
			);
			if (Object.keys(allowed).includes(key))
				console.log("Or other allowed values:\r\n", allowed[key]);

			throw new Error(`Value at key: "${key}" is not defined`);
		}

		if (Array.isArray(value)) return this.ArrayValidator();

		if (Object.keys(allowed).includes(value)) return this.AllowedValidator();

		return value;
	};
}

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

	private Validator(key: string, value: Settings): Settings {
		return new Validator(key, value).init();
	}

	private Validate(config: Config) {
		for (const key in settings) {
			const value = this.Validator(key, config[key]);

			this._config[key] = value;
		}
	}

	private Read() {
		fs.open(this._path, () => {
			if (this._create_file) this.Create();
		});

		try {
			const config: Config = new Formatter().FromJSONWithPath(this._path);

			this.Validate(config);
		} catch (err: any) {
			if (!fs.existsSync(this._path)) return;

			throw new Error(err);
		}
	}

	private readonly init = () => {
		this.Read();
	};

	get config(): Config {
		return this._config;
	}
}

(() => {
	new Configurator();
})();

export default Configurator;
