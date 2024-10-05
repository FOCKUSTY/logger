import Formatter from "f-formatter";
import { Colors } from "f-formatter/colors";

import type { LoggerName } from "./loggers.type";
import LoggersNames from './loggers.names';

import FileLogger from './file.logger';

const formatter = new Formatter();

class InitLogger {
    private readonly _name: string;
    private readonly _colors: [Colors, Colors];
    private readonly _log: FileLogger;

    constructor(dir: string, name: string, colors: [Colors, Colors]) {
        this._name = name;
        this._colors = colors;

        this._log = new FileLogger(dir);
    };

    public readonly execute = (text: string, color?: Colors): string => {
        const txt = (formatter.Color(this._name, this._colors[0]) + ':',
            formatter.Color(text, color
                ? color
                : this._colors[1]
            ));

        console.log(txt);

        this._log.writeFile(text);

        return txt;
    };

    get colors(): [Colors, Colors] {
        return this._colors;
    };
};

const loggers: { [ key: LoggerName<string> ]: InitLogger } = {};

class Logger<T extends string> {
    private readonly _name: LoggerName<T>;
    private readonly _dir: string;
    
    private _colors: [Colors, Colors];
    private _logger: InitLogger;
    
    constructor(name: LoggerName<T>, dir?: string, colors?: [Colors, Colors]) {
        this._dir = dir || './';
        this._name = name;
        this._colors = colors
            ? colors
            : loggers[name]
                ? loggers[name].colors
                : [Colors.reset, Colors.reset];

        this._logger = this.init();
    };

    private readonly init = (): InitLogger => {
        this._logger = new InitLogger(this._dir, this._name, this._colors);

        for(const key in LoggersNames) {
            const logger = LoggersNames[key];
            
            loggers[key] = new InitLogger(this._dir, logger.name, logger.colors);
        };

        loggers[this._name] = this._logger;

        if(!this._colors)
            this._colors = loggers[this._name].colors;

        return this._logger;
    };

    public readonly execute = (text: string, color?: Colors): string => {
        return this._logger.execute(text, color);
    };
};

export default Logger;