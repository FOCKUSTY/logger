import type { LoggerName } from "./loggers.type";
import { Colors } from "f-formatter/colors";

const loggers: {
    [key: LoggerName<string>]: { name: string, colors: [ Colors, Colors ] }
} = {
    Events:   { name: 'Events',   colors: [ Colors.brightYellow, Colors.green   ]},
    Fail:     { name: 'Fail',     colors: [ Colors.red,          Colors.red     ]},
    Loader:   { name: 'Loader',   colors: [ Colors.brightYellow, Colors.red     ]},
    Updater:  { name: 'Updater',  colors: [ Colors.brightYellow, Colors.yellow  ]}
};

export default loggers;