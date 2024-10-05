import { Colors as c } from "f-formatter/colors";
import Test from './test.class';

import Logger from "index.logger";

const logger = new Logger('Tester');

describe('Logger', () => {
    (() => {
        const tests: [string, string][] = [
            [c.reset + 'Привет, Мир !' + c.reset, logger.execute('Привет, Мир !')],
            [c.reset + 'Hello, World !' + c.reset, logger.execute('Hello, World !')]
        ];

        new Test('nocolor', tests).execute();
    })();

    (() => {
        const tests: [string, string][] = [
            [c.magenta + 'Маджента' + c.reset, logger.execute('Маджента', c.magenta)],
            [c.bgGreen + 'ГринСкрин' + c.reset, logger.execute('ГринСкрин', c.bgGreen)],
            [c.black + 'Тоталблэк' + c.reset, logger.execute('Тоталблэк', c.black)]
        ];

        new Test('colors', tests).execute();
    })();
});