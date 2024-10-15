import Formatter from "f-formatter"

import path from "node:path"
import fs from "node:fs"

const cache = new Map()

const format: any = "*&00.00.0000"
const filter = new RegExp(
	format
		.replace("*", "[a-zA-Z]?")
		.replace("&", "[!@#$%^&*()-+]?")
		.replaceAll("0", "[0-9]"),
	"gi"
)

const formatter = new Formatter()

class Log {
	private readonly _dir: string = path.join("./")
	private readonly _prefix: string = ""
	private readonly _date = formatter.date.Date(new Date(), "dd.MM.yyyy")
	private readonly _file_path: string = ""

	private _cache: string = ""

	constructor(dir: string, filePath?: string, prefix?: string) {
		this._prefix = prefix ? prefix + "-" : ""

		this._file_path = filePath
			? filePath
			: path.join(dir, "log", this._prefix + this._date) + ".log"

		this.init()

		this._cache = this.ReadFile()
		cache.set(this._file_path, this._cache)
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
			)
		}
	}

	private CreateFolder() {
		if (!fs.readdirSync(this._dir).includes("log")) {
			fs.mkdirSync(path.join(this._dir, "log"))
		}

		this.CreateFile()
	}

	private ReadFile() {
		return fs.readFileSync(
			path.join("./log", this._prefix + this._date + ".log"),
			"utf-8"
		)
	}

	private WriteFile = () => {
		fs.writeFileSync(this._file_path, cache.get(this._file_path), {
			encoding: "utf-8"
		})
	}

	private readonly init = () => {
		this.CreateFolder()

		for (const log of fs.readdirSync(path.join(this._dir, "log"))) {
			const name = path.parse(path.join(this._dir, "log", log)).name
			const date = name.match(filter)

			if (!date) continue

			const currentTime = formatter.date
				.Date(new Date(), "dd.MM.yyyy")
				.split(".")
				.reverse()
			const time = date[0].split(".").reverse()

			for (const index in currentTime) {
				const currentDate = Number(currentTime[index])
				const date = Number(time[index])

				if (currentDate > date) {
					try {
						fs.unlinkSync(path.join(this._dir, "log", log))
						continue
					} catch {}
				}
			}
		}
	}

	public writeFile(text: string) {
		cache.set(
			this._file_path,
			cache.get(this._file_path) +
				"\n" +
				"[" +
				formatter.date.Date(new Date(), "HH:mm:ss") +
				"] " +
				text
		)

		this.WriteFile()
	}

	public get file() {
		return this.ReadFile()
	}
}

export default Log
