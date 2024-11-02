import Formatter from "f-formatter";
import path from "node:path";
import fs from "node:fs";

const week = 60 * 60 * 24 * 7;
const format: any = "*&00.00.0000";
const filter = new RegExp(
	format
		.replace("*", "[a-zA-Z]?")
		.replace("&", "[!@#$%^&*()-+]?")
		.replaceAll("0", "[0-9]"),
	"gi"
);

const formatter = new Formatter();

class Deleter {
	private readonly _dir: string = path.join("./");

	public constructor(dir: string) {
		this._dir = path.join(dir);
	}

	public init() {
		for (const log of fs.readdirSync(path.join(this._dir, "log"))) {
			const name = path.parse(path.join(this._dir, "log", log)).name;
			const date = name.match(filter);

			if (!date) continue;

			const currentTime = formatter.date.Date(new Date(), "yyyy.MM.dd").split(".");
			const time = date[0].split(".").reverse();

			const now = formatter.date.Timestamp({
				year: Number(currentTime[0]),
				month: Number(currentTime[1]),
				day: Number(currentTime[2])
			});

			const fileTime =
				formatter.date.Timestamp({
					year: Number(time[0]),
					month: Number(time[1]),
					day: Number(time[2])
				}) + week;

			try {
				if (now > fileTime) {
					fs.unlinkSync(path.join(this._dir, "log", log));

					continue;
				}
			} catch {}
		}
	}
}

export default Deleter;
