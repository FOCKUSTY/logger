import Configurator from "../config/configurator";
const { config } = new Configurator();

import Formatter from "f-formatter";

import path from "path";
import fs from "fs";

const day = 60 * 60 * 24;
const format: any = "*&0000.00.00";
const filter = new RegExp(
	format.replace("*", "[a-zA-Z]?").replace("&", "[!@#$%^&*()-+]?").replaceAll("0", "[0-9]"),
	"gi"
);

const formatter = new Formatter();
const pathFormat = (...p: string[]) => path.resolve(path.join(...p));

class Deleter {
	private readonly _dir: string = config.dir;

	public constructor(dir: string) {
		this._dir = pathFormat(dir);
	}

	public init() {
		for (const log of fs.readdirSync(pathFormat(this._dir, "log"))) {
			const name = path.parse(pathFormat(this._dir, "log", log)).name;
			const date = name.match(filter);

			if (!date) continue;

			const currentTime = formatter.date.Date(new Date(), "dd.MM.yyyy").split(".");
			const time = date[0].split(".").reverse();

			const now = formatter.date.Timestamp(
				{
					year: Number(currentTime[0]),
					month: Number(currentTime[1]),
					day: Number(currentTime[2])
				},
				"seconds"
			);

			const fileTime =
				formatter.date.Timestamp(
					{
						year: Number(time[0]),
						month: Number(time[1]),
						day: Number(time[2])
					},
					"seconds"
				) +
				day * config.deletion_interval;

			try {
				if (now > fileTime) {
					fs.unlinkSync(pathFormat(this._dir, "log", log));

					continue;
				}
			} catch {}
		}
	}
}

export default Deleter;
