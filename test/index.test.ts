import Test from "./test.class"

import Logger, { Colors as c } from "index"

const logger = new Logger("Tester")
new Logger("Commands", [c.brightYellow, c.magenta])

describe("Logger", () => {
	;(() => {
		const tests: [string, string][] = [
			[c.reset + "Привет, Мир !" + c.reset, logger.execute("Привет, Мир !")],
			[c.reset + "Hello, World !" + c.reset, logger.execute("Hello, World !")],
			[
				c.magenta + "Hello, World !" + c.reset,
				new Logger("Commands").execute("Hello, World !")
			],
			[
				c.magenta + "Saving..." + c.reset,
				new Logger("Saver", [c.magenta, c.magenta]).execute("Saving...")
			]
		]

		new Test("nocolor", tests).execute()
	})()

	;(() => {
		const tests: [string, string][] = [
			[c.magenta + "Маджента" + c.reset, logger.execute("Маджента", c.magenta)],
			[c.bgGreen + "ГринСкрин" + c.reset, logger.execute("ГринСкрин", c.bgGreen)],
			[c.black + "Тоталблэк" + c.reset, logger.execute("Тоталблэк", c.black)],
			[
				c.magenta + "Loading..." + c.reset,
				new Logger("Saver").execute("Loading...")
			]
		]

		new Test("colors", tests).execute()
	})()
})
